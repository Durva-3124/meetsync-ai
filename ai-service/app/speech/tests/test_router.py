import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.anyio
async def test_transcribe_accepts_valid_audio_url() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/speech/transcribe",
            json={"audio_url": "https://example.com/recording.mp3", "language": "en-IN"},
        )

    assert response.status_code == 202
    assert response.json() == {"status": "pending", "transcript": None}


@pytest.mark.anyio
async def test_transcribe_rejects_invalid_audio_url() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/speech/transcribe", json={"audio_url": "not-a-url"})

    assert response.status_code == 422


@pytest.mark.anyio
async def test_speech_health_check_returns_ok() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/speech/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
