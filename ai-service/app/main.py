from fastapi import FastAPI

from app.intelligence.routers import intelligence_router
from app.speech.router import speech_router
from app.internal_ai.router import internal_ai_router

app = FastAPI(title="meetsync-ai-service")
app.include_router(intelligence_router)
app.include_router(speech_router)
app.include_router(internal_ai_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
