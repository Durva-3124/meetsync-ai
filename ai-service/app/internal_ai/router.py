"""Router exposing internal AI endpoints for decision extraction."""

from __future__ import annotations

from typing import Optional
import re
import uuid

from fastapi import APIRouter, HTTPException

from app.intelligence.schemas import (
    DecisionLog,
    DecisionLogEntry,
    DecisionSourceSpan,
    Transcript,
)

internal_ai_router = APIRouter(prefix="/internal/ai", tags=["internal-ai"])


@internal_ai_router.post("/decisions", response_model=DecisionLog)
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
        if transcript:
            for seg in transcript.segments:
                if sentence in seg.text:
                    character_start = seg.text.find(sentence)
                    character_end = character_start + len(sentence) if character_start >= 0 else None
                    source_span = DecisionSourceSpan(
                        transcript_id=transcript.id,
                        segment_id=seg.id,
                        start_seconds=seg.start_seconds,
                        end_seconds=seg.end_seconds,
                        text=seg.text,
                        speaker=seg.speaker,
                        character_start=character_start if character_start >= 0 else None,
                        character_end=character_end,
                    )
                    break

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
