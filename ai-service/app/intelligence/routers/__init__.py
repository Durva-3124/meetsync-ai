from fastapi import APIRouter

from app.intelligence.routers.transcribe import transcribe_router

intelligence_router = APIRouter(prefix="/intelligence", tags=["intelligence"])

intelligence_router.include_router(transcribe_router)


@intelligence_router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
