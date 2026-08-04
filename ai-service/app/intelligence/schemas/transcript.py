"""Versioned transcript and intelligence endpoint schemas."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class TranscriptSegment(BaseModel):
    id: str = Field(pattern=r"^seg_[A-Za-z0-9_-]+$")
    start_seconds: float = Field(ge=0)
    end_seconds: float = Field(ge=0)
    text: str
    speaker: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)


class TranscriptModels(BaseModel):
    transcription: str
    diarization: str | None = None


class Transcript(BaseModel):
    id: UUID
    source_url: HttpUrl
    language: str | None = None
    duration_seconds: float = Field(ge=0)
    text: str
    segments: list[TranscriptSegment]
    model: TranscriptModels


class TranscribeRequest(BaseModel):
    audio_url: HttpUrl
    language: str | None = Field(default=None, min_length=2, max_length=16)


class DiarizeRequest(BaseModel):
    transcript: Transcript


class EmbeddingText(BaseModel):
    segment_id: str
    text: str


class EmbeddingRequest(BaseModel):
    transcript_id: UUID
    texts: list[EmbeddingText] = Field(min_length=1)


class SegmentEmbedding(BaseModel):
    segment_id: str
    vector: list[float]


class EmbeddingResponse(BaseModel):
    model: Literal["sentence-transformers/all-MiniLM-L6-v2"]
    dimension: Literal[384]
    embeddings: list[SegmentEmbedding]


class DecisionSourceSpan(BaseModel):
    transcript_id: UUID
    segment_id: str = Field(pattern=r"^seg_[A-Za-z0-9_-]+$")
    start_seconds: float = Field(ge=0)
    end_seconds: float = Field(ge=0)
    text: str
    speaker: str | None = None
    character_start: int | None = Field(default=None, ge=0)
    character_end: int | None = Field(default=None, ge=0)


class DecisionLogEntry(BaseModel):
    decision_id: str = Field(pattern=r"^dec_[A-Za-z0-9_-]+$")
    decision_text: str
    reasoning: str
    source_span: DecisionSourceSpan
    confidence: float = Field(ge=0, le=1)


class DecisionLog(BaseModel):
    transcript_id: UUID
    decisions: list[DecisionLogEntry] = Field(min_length=1)
