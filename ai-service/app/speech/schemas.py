"""Pydantic models for the speech API."""

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class TranscriptionRequest(BaseModel):
    """Reference to audio that should be transcribed."""

    audio_url: HttpUrl = Field(
        description="A reachable HTTP(S) URL for the audio to transcribe."
    )
    language: str | None = Field(
        default=None,
        min_length=2,
        max_length=16,
        description="Optional BCP 47 language tag, for example `en` or `en-IN`.",
    )


class TranscriptionResponse(BaseModel):
    """Result returned when a transcription request is accepted."""

    status: Literal["pending"]
    transcript: str | None = None
