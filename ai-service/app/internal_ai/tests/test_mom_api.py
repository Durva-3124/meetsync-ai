import json
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.internal_ai.llm import MoMLLMOutput
from app.main import app

client = TestClient(app)


# ============================================================================
# Test Fixtures
# ============================================================================

MOCK_PAYLOAD = {
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

MOCK_LLM_OUTPUT = MoMLLMOutput(
    summary="The team discussed the completed Auth module with JWT rotation and planned to configure Redis caching by Friday.",
    keyPoints=[
        "Auth module with JWT rotation was completed and tested.",
        "Redis caching layer needs to be configured by Friday.",
        "All attendees aligned on implementation timeline."
    ],
    actionItems=[
        {
            "assignee": "Bob",
            "task": "Configure the Redis caching layer",
            "dueDate": "Friday"
        },
        {
            "assignee": "Alice",
            "task": "Complete integration testing for Auth module",
            "dueDate": None
        }
    ]
)


# ============================================================================
# Tests: LLM Retry & Repair Path
# ============================================================================

def test_call_llm_for_mom_retries_and_repairs_malformed_json():
    """Test malformed LLM JSON is retried and repaired before falling back."""

    class FakeCompletions:
        def __init__(self):
            self.calls = 0

        def create(self, **kwargs):
            self.calls += 1
            if self.calls == 1:
                return SimpleNamespace(
                    choices=[
                        SimpleNamespace(
                            message=SimpleNamespace(content='```json {"summary": "bad json", "keyPoints": ["A"], "actionItems": [}')
                        )
                    ]
                )

            return SimpleNamespace(
                choices=[
                    SimpleNamespace(
                        message=SimpleNamespace(
                            content=json.dumps({
                                "summary": "The team aligned on next steps.",
                                "keyPoints": ["The feature is ready for deployment."],
                                "actionItems": [{
                                    "assignee": "Bob",
                                    "task": "Deploy the feature",
                                    "dueDate": "Friday",
                                }],
                            })
                        )
                    )
                ]
            )

    fake_client = SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))

    output = __import__("app.internal_ai.llm", fromlist=["call_llm_for_mom"]).call_llm_for_mom(
        transcript_text="Bob will deploy the feature by Friday.",
        meeting_title="Release check-in",
        client=fake_client,
    )

    assert output is not None
    assert output.summary == "The team aligned on next steps."
    assert output.actionItems[0].assignee == "Bob"
    assert fake_client.chat.completions.calls == 2


# ============================================================================
# Tests: LLM Success Path
# ============================================================================

def test_mom_endpoint_with_llm_success():
    """Test MoM generation when LLM is available and returns valid output."""
    with patch("app.internal_ai.llm.call_llm_for_mom") as mock_llm:
        mock_llm.return_value = MOCK_LLM_OUTPUT
        
        # Act
        resp = client.post("/internal/ai/mom", json=MOCK_PAYLOAD)
        
        # Assert
        assert resp.status_code == 200
        data = resp.json()
        
        # Verify schema fields
        assert "attendees" in data
        assert len(data["attendees"]) >= 2
        assert "Alice" in [a["name"] for a in data["attendees"]]
        assert "Bob" in [a["name"] for a in data["attendees"]]
        
        assert "summary" in data
        assert isinstance(data["summary"], str)
        assert len(data["summary"]) > 0
        assert "Auth module" in data["summary"] or "Redis" in data["summary"]
        
        assert "keyPoints" in data
        assert len(data["keyPoints"]) > 0
        assert any("completed" in kp for kp in data["keyPoints"])
        
        assert "draftActionItems" in data
        assert len(data["draftActionItems"]) > 0
        assert any(item["assignee"] == "Bob" for item in data["draftActionItems"])
        
        # Check backward compatibility
        assert "agenda" in data
        assert "discussionPoints" in data


# ============================================================================
# Tests: LLM Fallback Path (Unavailable / Failure)
# ============================================================================

def test_mom_endpoint_with_llm_fallback_returns_none():
    """Test MoM generation falls back to rule-based when LLM returns None."""
    with patch("app.internal_ai.llm.call_llm_for_mom") as mock_llm:
        mock_llm.return_value = None  # Simulate LLM unavailable
        
        # Act
        resp = client.post("/internal/ai/mom", json=MOCK_PAYLOAD)
        
        # Assert
        assert resp.status_code == 200
        data = resp.json()
        
        # Should still return valid response via rule-based extraction
        assert "attendees" in data
        assert len(data["attendees"]) >= 2
        
        assert "summary" in data
        assert len(data["summary"]) > 0
        
        assert "keyPoints" in data
        # Rule-based should find "completed" keyword
        assert any("completed" in kp for kp in data["keyPoints"])
        
        assert "draftActionItems" in data
        # Rule-based should find action items with "will"
        assert any(item["assignee"] == "Bob" for item in data["draftActionItems"])


def test_mom_endpoint_without_participants():
    """Test MoM generation when no participants provided (uses speaker mapping)."""
    payload = {
        "meetingTitle": "Sprint Sync",
        "transcript": [
            {
                "speaker": "SPEAKER_00",
                "start": 0.0,
                "end": 3.0,
                "text": "The feature was completed and tested."
            },
            {
                "speaker": "SPEAKER_01",
                "start": 3.1,
                "end": 6.0,
                "text": "Great! I will deploy it by Friday."
            }
        ],
        "participants": []  # No participants
    }
    
    with patch("app.internal_ai.llm.call_llm_for_mom") as mock_llm:
        mock_llm.return_value = None
        
        # Act
        resp = client.post("/internal/ai/mom", json=payload)
        
        # Assert
        assert resp.status_code == 200
        data = resp.json()
        
        # Should auto-map SPEAKER_00 to Alice, SPEAKER_01 to Bob
        names = [a["name"] for a in data["attendees"]]
        assert "Alice" in names
        assert "Bob" in names


# ============================================================================
# Tests: Error Handling
# ============================================================================

def test_mom_endpoint_empty_transcript():
    """Test MoM generation rejects empty transcript."""
    payload = {
        "meetingTitle": "Empty Meeting",
        "transcript": [],  # Empty
        "participants": [{"name": "Alice"}]
    }
    
    resp = client.post("/internal/ai/mom", json=payload)
    
    # Pydantic validates empty list and returns 422 UnprocessableContent
    # Our HTTPException(400) in the endpoint won't be reached
    assert resp.status_code in [400, 422]


def test_mom_endpoint_transcript_all_empty_segments():
    """Test MoM generation rejects transcript with only empty segments."""
    payload = {
        "meetingTitle": "Empty Meeting",
        "transcript": [
            {"speaker": "SPEAKER_00", "start": 0.0, "end": 1.0, "text": ""},
            {"speaker": "SPEAKER_01", "start": 1.1, "end": 2.0, "text": "   "}
        ],
        "participants": [{"name": "Alice"}]
    }
    
    resp = client.post("/internal/ai/mom", json=payload)
    
    assert resp.status_code == 400
    data = resp.json()
    # Check for error message in either 'detail' or root level
    error_msg = data.get("detail") or str(data)
    assert "must contain at least one non-empty segment" in error_msg


def test_mom_endpoint_malformed_json_from_llm():
    """Test MoM generation handles malformed JSON from LLM."""
    with patch("app.internal_ai.llm.call_llm_for_mom") as mock_llm:
        # LLM returns None on JSON error, triggering fallback
        mock_llm.return_value = None
        
        # Act
        resp = client.post("/internal/ai/mom", json=MOCK_PAYLOAD)
        
        # Assert - should fall back to rule-based
        assert resp.status_code == 200
        data = resp.json()
        assert "attendees" in data
        assert "keyPoints" in data


def test_mom_endpoint_missing_required_fields_from_llm():
    """Test MoM generation handles LLM output missing required fields."""
    incomplete_output = MoMLLMOutput(
        summary="Brief summary",
        keyPoints=["Point 1"],
        actionItems=[]
    )
    
    with patch("app.internal_ai.llm.call_llm_for_mom") as mock_llm:
        mock_llm.return_value = incomplete_output
        
        # Act
        resp = client.post("/internal/ai/mom", json=MOCK_PAYLOAD)
        
        # Assert - should still process even if action items empty
        assert resp.status_code == 200
        data = resp.json()
        assert "summary" in data
        assert "keyPoints" in data
        # Empty action items is acceptable (LLM may not find any)
        assert "draftActionItems" in data


def test_mom_endpoint_validation_error():
    """Test MoM generation returns 400 on validation error."""
    invalid_payload = {
        # Missing required "transcript" field
        "meetingTitle": "Test Meeting",
        "participants": []
    }
    
    resp = client.post("/internal/ai/mom", json=invalid_payload)
    
    assert resp.status_code in [400, 422]  # Pydantic validation error


def test_deadlines_endpoint_normalizes_due_dates_and_links_to_action_items():
    """Test normalized deadlines are generated from draft action items with confidence scores."""
    payload = {
        "meetingTitle": "Release check-in",
        "meetingDate": "2026-08-14",
        "transcript": [
            {"speaker": "SPEAKER_00", "start": 0.0, "end": 2.0, "text": "Bob will deploy the feature by Friday."},
            {"speaker": "SPEAKER_01", "start": 2.1, "end": 4.0, "text": "Alice will finalize the API docs by Monday."},
        ],
        "draftActionItems": [
            {"assignee": "Bob", "task": "Deploy the feature", "dueDate": "Friday"},
            {"assignee": "Alice", "task": "Finalize the API docs", "dueDate": "Monday"},
        ],
    }

    resp = client.post("/internal/ai/deadlines", json=payload)

    assert resp.status_code == 200
    data = resp.json()
    assert "deadlines" in data
    assert len(data["deadlines"]) >= 2
    assert all(0.0 <= item["confidence"] <= 1.0 for item in data["deadlines"])
    assert all("sourceActionItem" in item for item in data["deadlines"])
    assert any(item["assignee"] == "Bob" for item in data["deadlines"])
    assert any(item["deadline"].startswith("2026-08-") for item in data["deadlines"])


def test_deadlines_integration_after_mom_generation():
    """Test deadlines are derived from MoM draft action items in the same meeting flow."""
    payload = {
        "meetingTitle": "Q3 Execution Planning",
        "meetingDate": "2026-08-14",
        "transcript": [
            {"speaker": "SPEAKER_00", "start": 0.0, "end": 5.0, "text": "Auth module with JWT rotation was completed and tested."},
            {"speaker": "SPEAKER_01", "start": 5.1, "end": 9.0, "text": "Bob will configure the Redis caching layer by Friday."},
        ],
        "participants": [
            {"name": "Alice", "email": "alice@example.com"},
            {"name": "Bob", "email": "bob@example.com"},
        ],
    }

    mom_resp = client.post("/internal/ai/mom", json=payload)
    assert mom_resp.status_code == 200
    mom_data = mom_resp.json()
    assert len(mom_data["draftActionItems"]) >= 1

    deadlines_resp = client.post(
        "/internal/ai/deadlines",
        json={
            "meetingTitle": payload["meetingTitle"],
            "meetingDate": payload["meetingDate"],
            "transcript": payload["transcript"],
            "draftActionItems": mom_data["draftActionItems"],
        },
    )

    assert deadlines_resp.status_code == 200
    deadlines_data = deadlines_resp.json()
    assert "deadlines" in deadlines_data
    assert any(item["assignee"] == "Bob" for item in deadlines_data["deadlines"])


# ============================================================================
# Tests: Original Test (Backward Compatibility)
# ============================================================================

def test_mom_endpoint():
    """Original test - should still pass with LLM mocked or in fallback mode."""
    with patch("app.internal_ai.llm.call_llm_for_mom") as mock_llm:
        # Let's use LLM success path
        mock_llm.return_value = MOCK_LLM_OUTPUT
        
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
        # Our extractor should pull 'completed'
        assert any("completed" in p for p in data["keyPoints"])

        assert "draftActionItems" in data
        assert len(data["draftActionItems"]) > 0
        # Bob should be assigned to Redis task
        assert any(item["assignee"] == "Bob" for item in data["draftActionItems"])

        # Backwards compatibility fields
        assert "agenda" in data
        assert "discussionPoints" in data
        assert len(data["discussionPoints"]) > 0

