"""Transcript-embedding endpoint contract."""

from fastapi import APIRouter, HTTPException, status

from app.intelligence.schemas import EmbeddingRequest, EmbeddingResponse

embed_router = APIRouter(prefix="/embed", tags=["intelligence"])


@embed_router.post("", response_model=EmbeddingResponse, summary="Embed transcript text")
async def embed_transcript(request: EmbeddingRequest) -> EmbeddingResponse:
    _ = request
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Embedding provider is not configured.",
    )
