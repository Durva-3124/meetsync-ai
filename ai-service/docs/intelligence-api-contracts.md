# Intelligence API contracts (v1)

This document is the proposed shared contract for the AI and backend services.
All JSON uses UTF-8, timestamps are seconds from the start of the source audio,
and IDs are UUID strings.

## Shared `Transcript` object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "source_url": "https://storage.example.com/meeting.wav",
  "language": "en",
  "duration_seconds": 42.7,
  "text": "Welcome everyone.",
  "segments": [
    {
      "id": "seg_0001",
      "start_seconds": 0.0,
      "end_seconds": 1.3,
      "text": "Welcome everyone.",
      "speaker": "SPEAKER_00",
      "confidence": 0.98
    }
  ],
  "model": {
    "transcription": "whisper-large-v3-turbo",
    "diarization": "pyannote/speaker-diarization-3.1"
  }
}
```

`speaker` and `confidence` may be `null` before diarization or when a provider
does not return a confidence score.

## Endpoint contracts

| Endpoint | Request | Response |
| --- | --- | --- |
| `POST /intelligence/transcribe` | `{ "audio_url": "https://…", "language": "en" }` | `Transcript` with text and timestamped segments; `speaker` is null. |
| `POST /intelligence/diarize` | `{ "transcript": Transcript }` | `Transcript` with each segment's `speaker` populated when detected. |
| `POST /intelligence/embed` | `{ "transcript_id": "uuid", "texts": [{ "segment_id": "seg_0001", "text": "…" }] }` | `{ "model": "sentence-transformers/all-MiniLM-L6-v2", "dimension": 384, "embeddings": [{ "segment_id": "seg_0001", "vector": [0.0] }] }`. |

## Model decision

The default embedding model is `sentence-transformers/all-MiniLM-L6-v2` (384
dimensions). It is small enough for CPU-first development and well suited to
semantic retrieval over meeting transcript segments. Changing it requires a
new embedding namespace because vector dimensions and similarity distributions
are model-specific.
