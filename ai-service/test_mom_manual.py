#!/usr/bin/env python
"""Manual testing of MoM API endpoint to verify contract compliance."""

from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

# Test 1: Verify /health endpoint
print("=== Testing /health endpoint ===")
resp = client.get("/health")
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")
print()

# Test 2: MoM endpoint with participants
print("=== Testing /internal/ai/mom with participants ===")
payload = {
    "meetingTitle": "Sprint Planning",
    "transcript": [
        {"speaker": "SPEAKER_00", "text": "We need to complete the authentication module by end of sprint."},
        {"speaker": "SPEAKER_01", "text": "Alice will handle the database migrations and Bob will write tests."},
        {"speaker": "SPEAKER_02", "text": "Decision: We deploy on Friday."}
    ],
    "participants": [
        {"name": "Alice", "email": "alice@company.com"},
        {"name": "Bob", "email": "bob@company.com"},
        {"name": "Charlie", "email": "charlie@company.com"}
    ]
}

resp = client.post("/internal/ai/mom", json=payload)
print(f"Status: {resp.status_code}")
data = resp.json()
print(f"Attendees: {len(data['attendees'])}")
print(f"Summary length: {len(data['summary'])}")
print(f"Key points: {len(data['keyPoints'])}")
print(f"Draft action items: {len(data['draftActionItems'])}")
print()

# Test 3: Verify schema fields
print("=== Verifying Response Schema ===")
required_fields = ["attendees", "summary", "keyPoints", "draftActionItems", "agenda", "discussionPoints"]
for field in required_fields:
    has_field = field in data
    print(f"{field}: {'✓' if has_field else '✗'}")

print()

# Test 4: Verify attendee structure
print("=== Attendee Structure ===")
if data["attendees"]:
    attendee = data["attendees"][0]
    print(f"Fields: {list(attendee.keys())}")
    print(f"Example: {attendee}")

print()

# Test 5: Verify action item structure
print("=== Draft Action Item Structure ===")
if data["draftActionItems"]:
    item = data["draftActionItems"][0]
    print(f"Fields: {list(item.keys())}")
    print(f"Example: {item}")

print()

# Test 6: Test edge case - no participants
print("=== Testing /internal/ai/mom without participants ===")
payload_no_participants = {
    "meetingTitle": "Team Sync",
    "transcript": [
        {"speaker": "SPEAKER_00", "text": "Feature A was completed."},
        {"speaker": "SPEAKER_01", "text": "Feature B will be done by next week."}
    ],
    "participants": []  # Empty
}

resp = client.post("/internal/ai/mom", json=payload_no_participants)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data2 = resp.json()
    print(f"Attendees auto-mapped: {len(data2['attendees'])}")
    print(f"Names: {[a['name'] for a in data2['attendees']]}")
else:
    print(f"Error: {resp.json()}")

print()

# Test 7: Test error case - empty transcript
print("=== Testing /internal/ai/mom with empty transcript (should error) ===")
payload_empty = {
    "meetingTitle": "Test",
    "transcript": [],
    "participants": []
}

resp = client.post("/internal/ai/mom", json=payload_empty)
print(f"Status: {resp.status_code}")
print(f"Error expected (400 or 422): {resp.status_code in [400, 422]}")

print("\n✓ All manual API tests completed!")
