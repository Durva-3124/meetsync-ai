"""Router exposing internal AI endpoints for decision extraction."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from functools import wraps
from time import sleep
from typing import Any, Callable, Optional
import logging
import re
import uuid

import numpy as np
from fastapi import APIRouter, HTTPException

from app.intelligence.embeddings import embed
from app.intelligence.schemas import (
    DecisionLog,
    DecisionLogEntry,
    DecisionSourceSpan,
    EmployeeMatch,
    MeetingEffectivenessRequest,
    MeetingEffectivenessResponse,
    SkillMatchCandidate,
    SkillMatchRequest,
    SkillMatchResponse,
    Transcript,
)

logger = logging.getLogger("meetsync-ai.internal-ai")
executor = ThreadPoolExecutor(max_workers=4)


def with_timeout_and_retries(timeout_seconds: float = 10.0, retries: int = 2, backoff_seconds: float = 0.5):
    def decorator(fn: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception: Exception | None = None
            logger.info(
                "endpoint.start",
                extra={"function": fn.__name__, "fn_args": [], "fn_kwargs": {}},
            )
            for attempt in range(1, retries + 1):
                try:
                    future = executor.submit(fn, *args, **kwargs)
                    result = future.result(timeout=timeout_seconds)
                    if attempt > 1:
                        logger.info(
                            "endpoint.retry_success",
                            extra={"function": fn.__name__, "attempt": attempt},
                        )
                    logger.info(
                        "endpoint.complete",
                        extra={"function": fn.__name__, "attempt": attempt},
                    )
                    return result
                except FutureTimeoutError as exc:
                    logger.warning(
                        "endpoint.timeout",
                        extra={
                            "function": fn.__name__,
                            "attempt": attempt,
                            "timeout_seconds": timeout_seconds,
                        },
                    )
                    last_exception = HTTPException(status_code=504, detail="Request timed out")
                except HTTPException:
                    raise
                except Exception as exc:
                    logger.warning(
                        "endpoint.failure",
                        extra={
                            "function": fn.__name__,
                            "attempt": attempt,
                            "error": str(exc),
                        },
                    )
                    last_exception = exc
                if attempt < retries:
                    sleep(backoff_seconds * attempt)
            if isinstance(last_exception, HTTPException):
                raise last_exception
            raise HTTPException(status_code=500, detail=str(last_exception) if last_exception else "Unhandled error")

        return wrapper

    return decorator


internal_ai_router = APIRouter(prefix="/internal/ai", tags=["internal-ai"])


def _normalize_vector(vector: list[float] | np.ndarray) -> np.ndarray:
    arr = np.asarray(vector, dtype=float)
    norm = np.linalg.norm(arr)
    return arr / (norm or 1.0)


def _aggregate_candidate_vector(candidate: SkillMatchCandidate) -> np.ndarray:
    if candidate.profile_embedding:
        return _normalize_vector(candidate.profile_embedding)

    texts = [skill.description or skill.name for skill in candidate.skills]
    if not texts:
        return np.zeros(384, dtype=float)

    embeddings = embed(texts)
    weights = np.asarray([skill.proficiency for skill in candidate.skills], dtype=float)
    total_weight = float(weights.sum() or 1.0)
    stacked = np.asarray(embeddings, dtype=float)
    weighted = np.sum(stacked * weights.reshape(-1, 1), axis=0) / total_weight
    return _normalize_vector(weighted)


def _matched_skill_ids(candidate: SkillMatchCandidate, query_vector: np.ndarray, top_k: int = 3) -> list[str]:
    texts = [skill.description or skill.name for skill in candidate.skills]
    if not texts:
        return []

    skill_embeddings = np.asarray(embed(texts), dtype=float)
    similarities = np.dot(skill_embeddings, query_vector)
    ranked = sorted(
        zip(candidate.skills, similarities.tolist()),
        key=lambda item: item[1],
        reverse=True,
    )
    return [skill.skill_id for skill, _ in ranked[: min(top_k, len(ranked))]]


@internal_ai_router.post("/decisions", response_model=DecisionLog)
@with_timeout_and_retries(timeout_seconds=10.0, retries=3, backoff_seconds=0.3)
def extract_decisions(payload: dict) -> DecisionLog:
    """Extract decisions and reasoning from a transcript or free text.

    This endpoint implements a lightweight, prompt-engineered extraction fallback
    that uses simple heuristics when no external LLM is configured. It returns
    a `DecisionLog` (see `app.intelligence.schemas`).
    """

    transcript_data = payload.get("transcript")
    text = payload.get("text")
    max_decisions = int(payload.get("max_decisions", 10))

    if not transcript_data and not text:
        raise HTTPException(status_code=400, detail="Provide `transcript` or `text` in the request body")

    transcript: Optional[Transcript] = None
    if transcript_data:
        try:
            transcript = Transcript(**transcript_data)
        except Exception as exc:  # pragma: no cover - validation errors surfaced to caller
            raise HTTPException(status_code=400, detail=f"Invalid transcript: {exc}")

    if not text and transcript:
        text = transcript.text

    # Precompute embeddings for transcript segments so we can link decisions by similarity.
    segment_embeddings = []
    if transcript and transcript.segments:
        segment_embeddings = embed([seg.text for seg in transcript.segments])

    # Heuristic decision extraction (demo / fallback for local testing)
    keywords = [
        "we will",
        "let's",
        "let us",
        "decide",
        "decided",
        "action:",
        "action item",
        "todo",
        "we should",
        "agree to",
        "will",
    ]

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text or "") if s.strip()]

    decisions: list[DecisionLogEntry] = []
    for idx, sentence in enumerate(sentences):
        low = sentence.lower()
        score = 0.0
        for kw in keywords:
            if kw in low:
                score = max(score, 0.9)

        if score == 0.0:
            continue

        # find a matching source segment if transcript provided
        source_span = None
        if transcript and transcript.segments:
            query_embedding = embed([sentence])[0]
            candidate_embeddings = np.asarray(segment_embeddings, dtype=float)
            query_vector = np.asarray(query_embedding, dtype=float)
            similarities = np.dot(candidate_embeddings, query_vector)
            best_index = int(np.argmax(similarities))
            best_seg = transcript.segments[best_index]
            character_start = best_seg.text.find(sentence)
            character_end = character_start + len(sentence) if character_start >= 0 else None
            source_span = DecisionSourceSpan(
                transcript_id=transcript.id,
                segment_id=best_seg.id,
                start_seconds=best_seg.start_seconds,
                end_seconds=best_seg.end_seconds,
                text=best_seg.text,
                speaker=best_seg.speaker,
                character_start=character_start if character_start >= 0 else None,
                character_end=character_end,
            )

        if not source_span:
            # best-effort empty span when we can't map to a segment
            source_span = DecisionSourceSpan(
                transcript_id=transcript.id if transcript else uuid.UUID(int=0),
                segment_id="seg_0000",
                start_seconds=0.0,
                end_seconds=0.0,
                text=sentence,
                speaker=None,
                character_start=0,
                character_end=len(sentence),
            )

        decision = DecisionLogEntry(
            decision_id=f"dec_{idx}",
            decision_text=sentence,
            reasoning="Extracted by heuristic decision-extraction (keywords match).",
            source_span=source_span,
            confidence=float(score),
        )
        decisions.append(decision)
        if len(decisions) >= max_decisions:
            break

    # Response transcript_id should be the actual transcript UUID when available
    transcript_id = transcript.id if transcript else uuid.UUID(int=0)

    return DecisionLog(transcript_id=transcript_id, decisions=decisions)


@internal_ai_router.post("/skill-match", response_model=SkillMatchResponse)
@with_timeout_and_retries(timeout_seconds=10.0, retries=3, backoff_seconds=0.3)
def match_skills(request: SkillMatchRequest) -> SkillMatchResponse:
    query_parts = [request.task_description]
    if request.required_skills:
        query_parts.append(" ".join(request.required_skills))

    query_text = " ".join(query_parts).strip()
    query_vector = _normalize_vector(embed([query_text])[0])

    matches: list[EmployeeMatch] = []
    for candidate in request.candidates:
        candidate_vector = _aggregate_candidate_vector(candidate)
        similarity = float(np.dot(query_vector, candidate_vector))

        utilization = min(1.0, max(0.0, candidate.workload.hours_assigned / candidate.workload.hours_capacity))
        penalty = min(1.0, max(0.0, request.workload_weight * utilization))
        final_score = float(max(0.0, similarity * (1.0 - penalty)))
        available_fraction = 1.0 - utilization

        matches.append(
            EmployeeMatch(
                employee_id=candidate.employee_id,
                name=candidate.name,
                matched_skill_ids=_matched_skill_ids(candidate, query_vector),
                skill_similarity=similarity,
                workload_penalty=penalty,
                final_score=final_score,
                utilization=utilization,
                available_fraction=available_fraction,
                reason="Matched by skill embedding similarity with workload penalty.",
            )
        )

    matches.sort(key=lambda item: item.final_score, reverse=True)
    return SkillMatchResponse(task_id=request.task_id, matches=matches)


def _safe_ratio(numerator: float, denominator: float) -> float:
    return float(0.0 if denominator <= 0 else numerator / denominator)


@internal_ai_router.post("/effectiveness-score", response_model=MeetingEffectivenessResponse)
@with_timeout_and_retries(timeout_seconds=10.0, retries=3, backoff_seconds=0.3)
def effectiveness_score(request: MeetingEffectivenessRequest) -> MeetingEffectivenessResponse:
    talk_times = [item.seconds for item in request.talk_time if item.seconds >= 0]
    speaker_count = len(talk_times)
    total_talk = sum(talk_times)
    ideal_share = _safe_ratio(total_talk, speaker_count)

    if speaker_count == 0 or total_talk <= 0:
        talk_time_balance = 0.0
    else:
        variance = float(np.mean([(sec - ideal_share) ** 2 for sec in talk_times]))
        max_variance = ideal_share**2 if ideal_share > 0 else 1.0
        talk_time_balance = 1.0 - min(1.0, variance / max_variance)

    decisions = request.decision_log.decisions
    decision_count = len(decisions)
    meeting_minutes = max(1.0, request.duration_seconds / 60.0)
    raw_density = decision_count / max(meeting_minutes / 30.0, 1.0)
    decision_density = min(1.0, raw_density)

    if request.agenda_items_planned and request.agenda_items_planned > 0:
        item_score = _safe_ratio(request.agenda_items_covered or 0.0, request.agenda_items_planned)
    else:
        item_score = 0.0

    if request.agenda_time_seconds is not None and request.agenda_time_seconds >= 0:
        time_score = min(1.0, request.agenda_time_seconds / request.duration_seconds)
    else:
        time_score = item_score

    agenda_adherence = 0.6 * item_score + 0.4 * time_score

    assignment_count = len(request.assignments or [])
    assignment_coverage = 0.0
    if decision_count > 0:
        assignment_coverage = min(1.0, _safe_ratio(assignment_count, decision_count))

    weights = {
        "agenda_adherence": 0.30,
        "decision_density": 0.30,
        "talk_time_balance": 0.25,
        "assignment_coverage": 0.15,
    }

    overall = (
        agenda_adherence * weights["agenda_adherence"]
        + decision_density * weights["decision_density"]
        + talk_time_balance * weights["talk_time_balance"]
        + assignment_coverage * weights["assignment_coverage"]
    )

    explanation = (
        f"Agenda adherence={agenda_adherence:.2f}, decision density={decision_density:.2f}, "
        f"talk-time balance={talk_time_balance:.2f}, assignment coverage={assignment_coverage:.2f}."
    )

    return MeetingEffectivenessResponse(
        meeting_id=request.meeting_id,
        effectiveness_score=round(float(overall * 100.0), 2),
        agenda_adherence=round(agenda_adherence, 3),
        decision_density=round(decision_density, 3),
        talk_time_balance=round(talk_time_balance, 3),
        assignment_coverage=round(assignment_coverage, 3),
        component_weights=weights,
        explanation=explanation,
    )
