import logging
import time
import uuid
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.concurrency import iterate_in_threadpool

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


def error_payload(status_code: int, code: str, message: str, details: Any | None = None) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "status_code": status_code,
            "details": details if details is not None else {},
        }
    }


app = FastAPI(title="meetsync-ai-service")
app.include_router(intelligence_router)
app.include_router(speech_router)
app.include_router(internal_ai_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start = time.monotonic()
    logger.info(
        "request.start",
        extra={
            "request_id": request_id,
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
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "duration_ms": elapsed,
            },
        )
        raise

    response_body: bytes | None = None
    if hasattr(response, "body_iterator"):
        body_chunks = [chunk async for chunk in response.body_iterator]
        response_body = b"".join(body_chunks)
        async def _set_body() -> Any:
            for chunk in body_chunks:
                yield chunk
        response.body_iterator = _set_body()

    elapsed = int((time.monotonic() - start) * 1000)
    logger.info(
        "request.complete",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": elapsed,
            "response_size_bytes": len(response_body or b""),
        },
    )
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    payload = exc.detail
    if isinstance(payload, dict):
        code = payload.get("code", "http_error")
        message = payload.get("message", payload.get("detail", "HTTP error"))
        details = payload.get("details", {})
    else:
        code = "http_error"
        message = str(payload)
        details = {}

    logger.warning(
        "http.exception",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": exc.status_code,
            "error_code": code,
            "detail": details or message,
        },
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(exc.status_code, code, message, details),
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
        content=error_payload(422, "validation_error", "Request validation failed", exc.errors()),
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
        content=error_payload(500, "internal_server_error", "Internal server error"),
    )


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
