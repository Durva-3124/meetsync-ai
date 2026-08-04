import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def make_transcript(tid: str):
    return {
        "id": tid,
        "source_url": "https://example.com/audio.wav",
        "language": "en",
        "duration_seconds": 10.0,
        "text": "We will hire Alice. Discuss budgets later.",
        "segments": [
            {"id": "seg_0001", "start_seconds": 0.0, "end_seconds": 2.0, "text": "We will hire Alice.", "speaker": "SPEAKER_00", "confidence": 0.99},
            {"id": "seg_0002", "start_seconds": 2.0, "end_seconds": 5.0, "text": "Discuss budgets later.", "speaker": "SPEAKER_01", "confidence": 0.9},
        ],
        "model": {"transcription": "whisper", "diarization": None},
    }


def test_decisions_endpoint_with_transcript():
    tid = str(uuid.uuid4())
    transcript = make_transcript(tid)
    resp = client.post("/internal/ai/decisions", json={"transcript": transcript})
    assert resp.status_code == 200
    data = resp.json()
    assert data["transcript_id"] == tid
    assert "decisions" in data
    assert len(data["decisions"]) >= 1


def test_decisions_endpoint_with_text_only():
    resp = client.post("/internal/ai/decisions", json={"text": "Let's finalize the timeline and assign tasks."})
    assert resp.status_code == 200
    data = resp.json()
    assert "decisions" in data
