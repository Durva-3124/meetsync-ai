"""LLM utilities for MoM generation with structured output parsing."""

import json
import logging
import os
from typing import Optional

from openai import OpenAI, APIError, APITimeoutError
from pydantic import BaseModel, ValidationError

logger = logging.getLogger("meetsync-ai.llm")


class MoMLLMOutput(BaseModel):
    """Structured output from LLM for MoM generation."""

    summary: str
    keyPoints: list[str]
    actionItems: list[dict]  # [{assignee: str, task: str, dueDate?: str}, ...]


def get_llm_client() -> Optional[OpenAI]:
    """Get OpenAI client if API key is configured.
    
    Returns None if OPENAI_API_KEY is not set, allowing fallback to rule-based extraction.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.info("OPENAI_API_KEY not configured; MoM generation will use rule-based extraction")
        return None
    try:
        return OpenAI(api_key=api_key)
    except Exception as exc:
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


def call_llm_for_mom(
    transcript_text: str,
    meeting_title: str,
    timeout_seconds: float = 15.0,
    client: Optional[OpenAI] = None,
) -> Optional[MoMLLMOutput]:
    """Call OpenAI to generate structured MoM.
    
    Args:
        transcript_text: Full transcript text
        meeting_title: Meeting title for context
        timeout_seconds: Timeout for API call
        client: OpenAI client (if None, creates one or returns None if key not configured)
    
    Returns:
        MoMLLMOutput if successful, None if LLM unavailable or fails (triggering fallback)
    
    Raises:
        ValueError: If JSON parsing fails after valid LLM response
        APITimeoutError: If call times out (will be caught by decorator)
    """
    if client is None:
        client = get_llm_client()

    if client is None:
        logger.info("LLM not available; skipping LLM generation")
        return None

    try:
        prompt = generate_mom_prompt(transcript_text, meeting_title)

        logger.info("Calling OpenAI API for MoM generation", extra={"meeting_title": meeting_title})

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Or "gpt-3.5-turbo" for cheaper option
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower temp for more consistent, factual output
            max_tokens=1500,
            timeout=timeout_seconds,
        )

        llm_output = response.choices[0].message.content.strip()

        logger.debug(f"LLM raw output: {llm_output}")

        # Parse JSON from LLM response
        # Try direct JSON parsing first
        try:
            parsed_json = json.loads(llm_output)
        except json.JSONDecodeError:
            # If direct parsing fails, try extracting JSON from response
            # (in case LLM wrapped it in markdown code blocks)
            if "```json" in llm_output:
                json_str = llm_output.split("```json")[1].split("```")[0].strip()
            elif "```" in llm_output:
                json_str = llm_output.split("```")[1].split("```")[0].strip()
            else:
                raise ValueError(f"Invalid JSON in LLM response: {llm_output}")
            parsed_json = json.loads(json_str)

        # Validate with Pydantic
        mom_output = MoMLLMOutput(**parsed_json)

        logger.info(
            "MoM generation successful",
            extra={
                "meeting_title": meeting_title,
                "key_points_count": len(mom_output.keyPoints),
                "action_items_count": len(mom_output.actionItems),
            },
        )

        return mom_output

    except APITimeoutError as exc:
        logger.warning(
            f"LLM API timeout after {timeout_seconds}s; falling back to rule-based extraction",
            extra={"meeting_title": meeting_title},
        )
        return None

    except APIError as exc:
        logger.warning(
            f"LLM API error: {exc}; falling back to rule-based extraction",
            extra={"meeting_title": meeting_title, "error": str(exc)},
        )
        return None

    except ValidationError as exc:
        logger.warning(
            f"Pydantic validation error on LLM output: {exc}; falling back to rule-based extraction",
            extra={"meeting_title": meeting_title},
        )
        return None

    except ValueError as exc:
        logger.warning(
            f"JSON parsing error: {exc}; falling back to rule-based extraction",
            extra={"meeting_title": meeting_title},
        )
        return None

    except Exception as exc:
        logger.exception(
            f"Unexpected error in LLM generation: {exc}",
            extra={"meeting_title": meeting_title},
        )
        return None
