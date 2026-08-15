import logging
import time

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.intelligence.routers import intelligence_router
from app.internal_ai.router import internal_ai_router
from app.speech.router import speech_router

logger = logging.getLogger("meetsync-ai")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(
    logging.Formatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
)
logger.addHandler(handler)

app = FastAPI(title="meetsync-ai-service")
app.include_router(intelligence_router)
app.include_router(speech_router)
app.include_router(internal_ai_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.monotonic()
    logger.info(
        "request.start",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query": dict(request.query_params),
            "client": request.client.host if request.client else None,
        },
    )
    try:
        response = await call_next(request)
    except Exception:
        elapsed = int((time.monotonic() - start) * 1000)
        logger.exception(
            "request.exception",
            extra={
                "method": request.method,
                "path": request.url.path,
                "duration_ms": elapsed,
            },
        )
        raise
    elapsed = int((time.monotonic() - start) * 1000)
    logger.info(
        "request.complete",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": elapsed,
        },
    )
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(
        "http.exception",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": exc.status_code,
            "detail": exc.detail,
        },
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "http",
                "message": exc.detail,
                "status_code": exc.status_code,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(
        "validation.exception",
        extra={
            "method": request.method,
            "path": request.url.path,
            "errors": exc.errors(),
        },
    )
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "type": "validation",
                "message": "Request validation failed",
                "details": exc.errors(),
            }
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "unhandled.exception",
        extra={
            "method": request.method,
            "path": request.url.path,
        },
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "type": "internal",
                "message": "Internal server error",
            }
        },
    )


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
