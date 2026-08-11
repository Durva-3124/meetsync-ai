import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_mom_endpoint():
    # 1. Arrange
    payload = {
        "meetingTitle": "Q3 Execution Planning",
        "transcript": [
            {
                "speaker": "SPEAKER_00",
                "start": 0.0,
                "end": 4.5,
                "text": "Welcome to the meeting. First, the Auth module with JWT rotation was completed and tested."
            },
            {
                "speaker": "SPEAKER_01",
                "start": 4.6,
                "end": 9.1,
                "text": "Great! Bob will configure the Redis caching layer by Friday."
            }
        ],
        "participants": [
            {"name": "Alice", "email": "alice@example.com"},
            {"name": "Bob", "email": "bob@example.com"}
        ]
    }

    # 2. Act
    resp = client.post("/internal/ai/mom", json=payload)

    # 3. Assert
    assert resp.status_code == 200
    data = resp.json()

    # Check that our newly designed schema fields are populated and returned
    assert "attendees" in data
    assert len(data["attendees"]) >= 2
    # Verify we mapped Bob and Alice correctly
    names = [a["name"] for a in data["attendees"]]
    assert "Alice" in names
    assert "Bob" in names

    assert "summary" in data
    assert isinstance(data["summary"], str)
    assert len(data["summary"]) > 0

    assert "keyPoints" in data
    assert len(data["keyPoints"]) > 0
    # Our simple extractor should pull the first sentence containing 'completed'
    assert any("completed" in p for p in data["keyPoints"])

    assert "draftActionItems" in data
    assert len(data["draftActionItems"]) > 0
    # Bob will configure the Redis caching layer... is an action item
    assert any(item["assignee"] == "Bob" for item in data["draftActionItems"])

    # Backwards compatibility fields
    assert "agenda" in data
    assert "discussionPoints" in data
    assert len(data["discussionPoints"]) > 0
