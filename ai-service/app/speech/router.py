"""HTTP endpoints for speech processing."""

from fastapi import APIRouter, status

from app.speech.schemas import TranscriptionRequest, TranscriptionResponse

speech_router = APIRouter(tags=["speech"])


@speech_router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit audio for transcription",
)
async def transcribe_audio(request: TranscriptionRequest) -> TranscriptionResponse:
    """Accept an audio reference until a transcription provider is connected."""
    _ = request
    return TranscriptionResponse(status="pending")
