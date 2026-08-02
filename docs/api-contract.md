# Node ↔ Python AI Service API Contract (v1)

Base URL: `http://ai-service:8000`

All requests from Node backend to AI service are internal only (not exposed to public).
All responses use `Content-Type: application/json` unless noted.

---

### 1. Audio Transcription & Diarization

**POST** `/internal/ai/transcribe`

Request (`multipart/form-data`):
- `file`: binary audio (`.mp3`, `.wav`, `.m4a`)

Response `200 OK`:
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "Welcome to the meeting." },
    { "speaker": "SPEAKER_01", "start": 4.6, "end": 9.1, "text": "Thanks for joining." }
  ]
}
```

Error `422 Unprocessable Entity`:
```json
{ "error": "Unsupported audio format" }
```

---

### 2. Meeting Summary Generation

**POST** `/internal/ai/summarize`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "Welcome to the meeting." }
  ],
  "meetingTitle": "Q3 Planning"
}
```

Response `200 OK`:
```json
{
  "summary": "The meeting covered Q3 planning objectives...",
  "keyPoints": [
    "Discussed Q3 targets",
    "Assigned action items to team leads"
  ]
}
```

---

### 3. Action Item Extraction

**POST** `/internal/ai/action-items`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "John will send the report by Friday." }
  ]
}
```

Response `200 OK`:
```json
{
  "actionItems": [
    {
      "assignee": "John",
      "task": "Send the report",
      "dueDate": "Friday",
      "rawText": "John will send the report by Friday."
    }
  ]
}
```

---

### 4. Sentiment Analysis

**POST** `/internal/ai/sentiment`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "I'm really happy with the progress." }
  ]
}
```

Response `200 OK`:
```json
{
  "overall": "positive",
  "score": 0.87,
  "bySpeaker": {
    "SPEAKER_00": { "sentiment": "positive", "score": 0.87 }
  }
}
```

---

### 5. Speaker Identification / Mapping

**POST** `/internal/ai/identify-speakers`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "Hi, I'm Alice." }
  ],
  "participants": [
    { "name": "Alice", "email": "alice@example.com" }
  ]
}
```

Response `200 OK`:
```json
{
  "speakerMap": {
    "SPEAKER_00": { "name": "Alice", "email": "alice@example.com" }
  }
}
```

---

### 6. Meeting Performance / Skill Insights

**POST** `/internal/ai/insights`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "Let me walk you through the architecture." }
  ],
  "speakerMap": {
    "SPEAKER_00": { "name": "Alice", "email": "alice@example.com" }
  }
}
```

Response `200 OK`:
```json
{
  "insights": [
    {
      "speaker": "SPEAKER_00",
      "name": "Alice",
      "talkTimeSeconds": 120,
      "talkTimePercent": 45.3,
      "skills": ["communication", "technical explanation"],
      "suggestions": ["Allow more space for others to respond"]
    }
  ]
}
```

---

### 7. Minutes of Meeting (MoM) Generation

**POST** `/internal/ai/mom`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "Let's review the agenda." }
  ],
  "meetingTitle": "Sprint Review"
}
```

Response `200 OK`:
```json
{
  "agenda": ["Sprint review", "Demo", "Retrospective"],
  "discussionPoints": [
    { "speaker": "SPEAKER_00", "point": "Auth module completed and tested." }
  ],
  "summary": "The team completed the auth module and discussed next sprint priorities."
}
```

---

### 8. Decision Extraction

**POST** `/internal/ai/decisions`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.5, "text": "We decided to adopt Redis for caching." }
  ]
}
```

Response `200 OK`:
```json
{
  "decisions": [
    {
      "decision": "Adopt Redis for session caching",
      "madeBy": "SPEAKER_00",
      "rationale": "Reduces DB load for token lookups."
    }
  ]
}
```

---

### 9. Deadline Extraction

**POST** `/internal/ai/deadlines`

Request (`application/json`):
```json
{
  "transcript": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 5.0, "text": "Alice will submit the PR by Monday EOD." }
  ]
}
```

Response `200 OK`:
```json
{
  "deadlines": [
    {
      "description": "Submit frontend scaffold PR",
      "assignee": "Alice",
      "deadline": "2025-08-04T17:00:00.000Z",
      "rawText": "Alice will submit the PR by Monday EOD."
    }
  ]
}
```

---

### 10. Skill Match

**POST** `/internal/ai/skill-match`

Request (`application/json`):
```json
{
  "task": "Scaffold the frontend project",
  "assignee": "Alice",
  "participants": [
    { "name": "Alice", "email": "alice@example.com", "skills": ["TypeScript", "React"] }
  ]
}
```

Response `200 OK`:
```json
{
  "requiredSkills": ["TypeScript", "React", "API integration"],
  "matchedUserId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "confidence": 0.78
}
```

---

### 11. Meeting Effectiveness Score

**POST** `/internal/ai/effectiveness-score`

Request (`application/json`):
```json
{
  "decisions": [
    { "decision": "Adopt Redis for caching", "madeBy": "SPEAKER_00", "rationale": "Reduces DB load." }
  ],
  "keyPoints": ["Sprint review", "Demo", "Retrospective"],
  "talkTime": [
    { "speaker": "SPEAKER_00", "talkTimeSeconds": 145, "talkTimePercent": 52.3 },
    { "speaker": "SPEAKER_01", "talkTimeSeconds": 89, "talkTimePercent": 32.1 }
  ]
}
```

Response `200 OK`:
```json
{
  "score": 78,
  "breakdown": {
    "decisionsScore": 85,
    "keyPointsCoverage": 72,
    "participationBalance": 76
  },
  "suggestions": [
    "Encourage quieter participants to contribute earlier",
    "Document rationale for all decisions"
  ]
}
```

---

## Shared Error Format

All endpoints return errors in this shape:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / missing fields |
| `422` | Invalid input (e.g. bad audio format) |
| `500` | Internal AI service error |
