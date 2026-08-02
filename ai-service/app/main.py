from fastapi import FastAPI

from app.intelligence.routers import intelligence_router

app = FastAPI(title="meetsync-ai-service")
app.include_router(intelligence_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
