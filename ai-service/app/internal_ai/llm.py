"""LLM utilities for MoM generation with structured output parsing."""

import json
import logging
import os
import re
from datetime import date, datetime
from typing import Any

from openai import APIError, APITimeoutError, OpenAI
from pydantic import BaseModel, ValidationError

try:
    import dateparser
except ImportError:  # pragma: no cover - optional dependency in minimal envs
    dateparser = None

try:
    import jsonschema
except ImportError:  # pragma: no cover - optional dependency in minimal envs
    jsonschema = None

try:
    import spacy
except ImportError:  # pragma: no cover - optional dependency in minimal envs
    spacy = None

logger = logging.getLogger("meetsync-ai.llm")


class MoMActionItem(BaseModel):
    """Structured action item for MoM generation."""

    assignee: str
    task: str
    dueDate: str | None = None


class MoMLLMOutput(BaseModel):
    """Structured output from LLM for MoM generation."""

    summary: str
    keyPoints: list[str]
    actionItems: list[MoMActionItem]


def get_llm_client() -> OpenAI | None:
    """Get OpenAI client if API key is configured.

    Returns None if OPENAI_API_KEY is not set, allowing fallback to rule-based extraction.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.info("OPENAI_API_KEY not configured; MoM generation will use rule-based extraction")
        return None
    try:
        return OpenAI(api_key=api_key)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Failed to initialize OpenAI client: {exc}")
        return None


def generate_mom_prompt(transcript_text: str, meeting_title: str) -> str:
    """Generate a strong prompt for MoM extraction that prevents hallucination."""
    return f"""You are an expert meeting minutes (MoM) generator. Your task is to extract key information from a meeting transcript.

CRITICAL RULES:
1. Extract ONLY information explicitly stated in the transcript.
2. Do NOT invent, assume, or hallucinate any details.
3. If a piece of information is not in the transcript, DO NOT include it.
4. For action items, ONLY extract tasks that are explicitly assigned or clearly implied.
5. For deadlines, ONLY use dates/times mentioned in the transcript (e.g., "Friday", "by end of sprint").
6. For key points, extract 3-5 most important discussion items.
7. Return valid JSON that matches the required schema exactly and contains no markdown wrappers.

Meeting Title: {meeting_title}

Transcript:
{transcript_text}

Return a JSON object (and ONLY JSON, no other text) with this exact structure:
{{
  "summary": "1-2 paragraph summary of the meeting (3-5 sentences max). Only facts from transcript.",
  "keyPoints": [
    "Key discussion point 1 (direct quote or close paraphrase from transcript)",
    "Key discussion point 2",
    "Key discussion point 3"
  ],
  "actionItems": [
    {{
      "assignee": "Person Name (must appear in transcript)",
      "task": "Specific task (direct from transcript, not inferred)",
      "dueDate": "Due date if mentioned (e.g., 'Friday', '2025-08-15'), or null"
    }}
  ]
}}

Important:
- Do not use generic placeholders or made-up details
- If a field cannot be filled from the transcript, use null or empty array
- Assignee must be a real person name from the transcript or participants
- Ensure valid JSON with proper quotes and escaping"""


def generate_mom_repair_prompt(transcript_text: str, meeting_title: str, error_message: str) -> str:
    """Ask the LLM to repair malformed JSON while preserving the exact schema."""
    schema = json.dumps(MoMLLMOutput.model_json_schema(), indent=2)
    return (
        f"The previous output was malformed or failed schema validation: {error_message}\n"
        f"Return only valid JSON matching this schema exactly:\n{schema}\n"
        f"Meeting Title: {meeting_title}\n\nTranscript:\n{transcript_text}\n"
    )


def _extract_json_payload(raw_content: str) -> str:
    """Extract JSON text from a raw LLM response, including fenced code blocks."""
    candidate = raw_content.strip()

    if "```json" in candidate:
        candidate = candidate.split("```json", 1)[1]
    elif "```" in candidate:
        candidate = candidate.split("```", 1)[1]

    if "```" in candidate:
        candidate = candidate.split("```", 1)[0].strip()

    start = candidate.find("{")
    end = candidate.rfind("}")
    if start != -1 and end > start:
        candidate = candidate[start : end + 1]

    if not candidate.startswith("{"):
        raise ValueError(f"No JSON object found in LLM response: {raw_content}")

    return candidate


def _repair_malformed_json(raw_content: str) -> str | None:
    """Repair common malformed JSON issues such as missing closing brackets."""
    candidate = _extract_json_payload(raw_content)
    if not candidate:
        return None

    candidate = re.sub(r",\s*([}\]])", r"\1", candidate)

    stack: list[str] = []
    for char in candidate:
        if char in "{[":
            stack.append(char)
        elif char in "}]":
            expected = {"}": "{", "]": "["}.get(char)
            if stack and stack[-1] == expected:
                stack.pop()

    repaired = candidate
    while stack:
        opener = stack.pop()
        repaired += "}" if opener == "{" else "]"

    try:
        json.loads(repaired)
        return repaired
    except json.JSONDecodeError:
        return None


def _coerce_meeting_date(meeting_date: str | date | datetime | None) -> datetime | None:
    """Normalize a meeting date into a datetime, retaining the calendar context for relative date expressions."""
    if meeting_date is None:
        return None
    if isinstance(meeting_date, datetime):
        return meeting_date
    if isinstance(meeting_date, date):
        return datetime.combine(meeting_date, datetime.min.time())
    text = str(meeting_date).strip()
    if not text:
        return None
    parsed = dateparser.parse(text) if dateparser is not None else None
    return parsed


def _normalize_due_date(raw_due_date: str | None, meeting_date: str | date | datetime | None) -> str | None:
    """Normalize a due date relative to the meeting date, supporting expressions like Friday or tomorrow."""
    if raw_due_date is None:
        return None

    value = str(raw_due_date).strip()
    if not value or value.lower() in {"null", "none"}:
        return None

    if dateparser is None:
        return value

    base_date = _coerce_meeting_date(meeting_date)
    settings: dict[str, Any] = {"PREFER_DATES_FROM": "future"}
    if base_date is not None:
        settings["RELATIVE_BASE"] = base_date

    try:
        parsed = dateparser.parse(value, settings=settings)
    except (TypeError, ValueError):
        try:
            parsed = dateparser.parse(value)
        except (TypeError, ValueError):
            return value

    if parsed is None:
        return value
    return parsed.date().isoformat()


def _extract_date_entities(text: str) -> list[str]:
    """Extract date/time entities using spaCy when the NLP model is installed."""
    if not text or spacy is None:
        return []

    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        try:
            nlp = spacy.blank("en")
        except Exception:  # pragma: no cover - best effort only
            return []

    try:
        entities = []
        for ent in nlp(text).ents:
            if ent.label_ in {"DATE", "TIME"}:
                entities.append(ent.text.strip())
        return entities
    except Exception:  # pragma: no cover - best effort only
        return []


def normalize_mom_action_items(action_items: list[dict[str, Any]], meeting_date: str | date | datetime | None) -> list[dict[str, Any]]:
    """Normalize due dates on LLM-generated action items against the meeting calendar date."""
    normalized: list[dict[str, Any]] = []
    for item in action_items:
        if not isinstance(item, dict):
            normalized.append(item)
            continue
        updated = dict(item)
        if updated.get("dueDate") is not None:
            updated["dueDate"] = _normalize_due_date(updated.get("dueDate"), meeting_date)
        normalized.append(updated)
    return normalized


def _validate_mom_payload(payload: Any) -> MoMLLMOutput:
    """Validate a parsed LLM payload against the schema model and JSON schema."""
    model = MoMLLMOutput.model_validate(payload)

    if jsonschema is not None:
        validator = jsonschema.Draft7Validator(MoMLLMOutput.model_json_schema())
        errors = sorted(validator.iter_errors(payload), key=lambda item: list(item.path))
        if errors:
            path = ".".join(str(part) for part in errors[0].path) or "<root>"
            raise ValueError(f"JSON schema validation failed at {path}: {errors[0].message}")

    return model


def call_llm_for_mom(
    transcript_text: str,
    meeting_title: str,
    timeout_seconds: float = 15.0,
    client: OpenAI | None = None,
    retries: int = 2,
    meeting_date: str | date | datetime | None = None,
) -> MoMLLMOutput | None:
    """Call OpenAI to generate structured MoM with retry + repair for malformed JSON."""
    if client is None:
        client = get_llm_client()

    if client is None:
        logger.info("LLM not available; skipping LLM generation")
        return None

    last_error: str | None = None

    for attempt in range(1, retries + 2):
        prompt = generate_mom_prompt(transcript_text, meeting_title) if attempt == 1 else generate_mom_repair_prompt(
            transcript_text,
            meeting_title,
            last_error or "previous output did not match schema",
        )
        if meeting_date is not None:
            prompt = f"Meeting calendar date: {meeting_date}\n\n{prompt}"

        logger.info(
            "LLM prompt/response pair",
            extra={
                "meeting_title": meeting_title,
                "attempt": attempt,
                "prompt": prompt,
            },
        )

        try:
            logger.info("Calling OpenAI API for MoM generation", extra={"meeting_title": meeting_title, "attempt": attempt})
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1500,
                timeout=timeout_seconds,
            )

            content = response.choices[0].message.content
            if content is None:
                raise ValueError("LLM response had empty content")

            logger.info(
                "LLM prompt/response pair",
                extra={
                    "meeting_title": meeting_title,
                    "attempt": attempt,
                    "response": content,
                },
            )

            try:
                parsed_json = json.loads(_extract_json_payload(content))
            except json.JSONDecodeError:
                repaired = _repair_malformed_json(content)
                if repaired is None:
                    raise ValueError(f"Invalid JSON in LLM response: {content}")
                parsed_json = json.loads(repaired)

            try:
                mom_output = _validate_mom_payload(parsed_json)
                if meeting_date is not None:
                    normalized_items = normalize_mom_action_items(
                        [item.model_dump() if hasattr(item, "model_dump") else item for item in mom_output.actionItems],
                        meeting_date,
                    )
                    mom_output = MoMLLMOutput(
                        summary=mom_output.summary,
                        keyPoints=mom_output.keyPoints,
                        actionItems=[MoMActionItem(**item) for item in normalized_items],
                    )
            except (ValidationError, ValueError) as exc:
                last_error = str(exc)
                if attempt <= retries:
                    logger.warning(
                        "Malformed or invalid MoM JSON; retrying with schema repair",
                        extra={"meeting_title": meeting_title, "attempt": attempt, "error": last_error},
                    )
                    continue
                raise

            logger.info(
                "MoM generation successful",
                extra={
                    "meeting_title": meeting_title,
                    "attempt": attempt,
                    "key_points_count": len(mom_output.keyPoints),
                    "action_items_count": len(mom_output.actionItems),
                },
            )
            return mom_output

        except APITimeoutError:
            logger.warning(
                "LLM API timeout after %ss; falling back to rule-based extraction",
                extra={"meeting_title": meeting_title, "attempt": attempt, "timeout_seconds": timeout_seconds},
            )
            return None

        except APIError as exc:
            logger.warning(
                "LLM API error: %s; falling back to rule-based extraction",
                extra={"meeting_title": meeting_title, "attempt": attempt, "error": str(exc)},
            )
            return None

        except ValueError as exc:
            last_error = str(exc)
            if attempt <= retries:
                logger.warning(
                    "JSON parsing/repair failed; retrying",
                    extra={"meeting_title": meeting_title, "attempt": attempt, "error": last_error},
                )
                continue
            logger.warning(
                "JSON parsing error: %s; falling back to rule-based extraction",
                extra={"meeting_title": meeting_title, "attempt": attempt, "error": last_error},
            )
            return None

        except Exception:
            logger.exception(
                "Unexpected error in LLM generation",
                extra={"meeting_title": meeting_title, "attempt": attempt},
            )
            return None

    logger.warning(
        "LLM output could not be validated after retries; falling back to rule-based extraction",
        extra={"meeting_title": meeting_title, "error": last_error},
    )
    return None
