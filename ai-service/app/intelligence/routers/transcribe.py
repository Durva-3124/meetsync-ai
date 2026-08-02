from fastapi import APIRouter

transcribe_router = APIRouter(prefix="/transcribe", tags=["intelligence"])


@transcribe_router.get("", summary="Transcribe router health check")
def transcribe_health_check() -> dict[str, str]:
    return {"status": "transcribe router ok"}
