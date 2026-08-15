"""Audio and transcript fixtures for regression testing."""

import base64
import json
from pathlib import Path
from typing import Any

# Minimal WAV file headers (PCM, mono, 16-bit, 16kHz)
# These are stub audio files used for format validation and endpoint shape testing
# Real audio processing is tested in the speech service

_FIXTURE_DIR = Path(__file__).parent / "audio_fixtures"


def get_fixture_wav_minimal_1sec() -> bytes:
    """Return a minimal 1-second WAV file (16kHz mono PCM, ~32KB).
    
    This fixture represents a very short meeting segment for testing
    transcription endpoint response shape without full model inference.
    """
    # Base64-encoded minimal WAV: 1 second silence at 16kHz, mono, 16-bit PCM
    b64 = (
        "UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    )
    return base64.b64decode(b64)


def get_fixture_wav_hiring_decision() -> bytes:
    """Fixture representing a short hiring decision statement (~3 seconds).
    
    Expected to contain recognizable speech patterns for:
    'We will hire Alice for the recruiting lead role.'
    """
    # For testing purposes, this is a silence-based placeholder
    # Real audio would be recorded or synthesized speech
    b64 = (
        "UklGRkIAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    )
    return base64.b64decode(b64)


def get_fixture_wav_deadline_discussion() -> bytes:
    """Fixture representing a deadline discussion (~5 seconds).
    
    Expected to contain:
    'Bob will configure the Redis caching layer by Friday.'
    'Alice will finalize the API docs by Monday.'
    """
    b64 = (
        "UklGRkoAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    )
    return base64.b64decode(b64)


def get_fixture_wav_meeting_3min() -> bytes:
    """Fixture representing a 3-minute meeting segment.
    
    Expected to contain multiple speakers and discussion points
    for full decision/deadline/skill-match extraction testing.
    """
    b64 = (
        "UklGRkwAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    )
    return base64.b64decode(b64)


def get_fixture_wav_long_form() -> bytes:
    """Fixture representing a longer meeting (~10 minutes).
    
    Used for testing memory efficiency and chunked processing
    in the live-caption prototype.
    """
    b64 = (
        "UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    )
    return base64.b64decode(b64)


FIXTURE_AUDIO_CATALOG = {
    "minimal_1sec": {
        "name": "minimal_1sec",
        "duration_seconds": 1.0,
        "get": get_fixture_wav_minimal_1sec,
        "expected_segments": 0,
        "description": "Minimal 1-second silence for format validation",
    },
    "hiring_decision": {
        "name": "hiring_decision",
        "duration_seconds": 3.0,
        "get": get_fixture_wav_hiring_decision,
        "expected_segments": 1,
        "description": "Hiring decision statement",
    },
    "deadline_discussion": {
        "name": "deadline_discussion",
        "duration_seconds": 5.0,
        "get": get_fixture_wav_deadline_discussion,
        "expected_segments": 2,
        "description": "Deadline discussion with multiple speakers",
    },
    "meeting_3min": {
        "name": "meeting_3min",
        "duration_seconds": 180.0,
        "get": get_fixture_wav_meeting_3min,
        "expected_segments": 5,
        "description": "3-minute meeting with decisions and deadlines",
    },
    "meeting_10min": {
        "name": "meeting_10min",
        "duration_seconds": 600.0,
        "get": get_fixture_wav_long_form,
        "expected_segments": 12,
        "description": "10-minute meeting for memory/latency testing",
    },
}


# Transcript fixtures (normalized outputs from the transcription service)

FIXTURE_TRANSCRIPT_HIRING = {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "source_url": "https://storage.example.com/hiring_decision.wav",
    "language": "en",
    "duration_seconds": 3.0,
    "text": "We will hire Alice for the recruiting lead role.",
    "segments": [
        {
            "id": "seg_0001",
            "start_seconds": 0.0,
            "end_seconds": 3.0,
            "text": "We will hire Alice for the recruiting lead role.",
            "speaker": "SPEAKER_00",
            "confidence": 0.95,
        }
    ],
    "model": {"transcription": "whisper-large-v3-turbo", "diarization": None},
}

FIXTURE_TRANSCRIPT_DEADLINE = {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "source_url": "https://storage.example.com/deadline_discussion.wav",
    "language": "en",
    "duration_seconds": 5.0,
    "text": "Bob will configure the Redis caching layer by Friday. Alice will finalize the API docs by Monday.",
    "segments": [
        {
            "id": "seg_0001",
            "start_seconds": 0.0,
            "end_seconds": 2.5,
            "text": "Bob will configure the Redis caching layer by Friday.",
            "speaker": "SPEAKER_00",
            "confidence": 0.92,
        },
        {
            "id": "seg_0002",
            "start_seconds": 2.5,
            "end_seconds": 5.0,
            "text": "Alice will finalize the API docs by Monday.",
            "speaker": "SPEAKER_01",
            "confidence": 0.89,
        },
    ],
    "model": {"transcription": "whisper-large-v3-turbo", "diarization": None},
}

FIXTURE_TRANSCRIPT_FULL_MEETING = {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "source_url": "https://storage.example.com/meeting_full.wav",
    "language": "en",
    "duration_seconds": 180.0,
    "text": "Welcome to the sprint planning meeting. First item, we will hire Alice for the recruiting lead role. Discussing timeline and next steps. Bob will configure the Redis caching layer by Friday. Alice will finalize the API docs by Monday. We have decided to adopt Redis for caching. Any other business? Thanks everyone.",
    "segments": [
        {
            "id": "seg_0001",
            "start_seconds": 0.0,
            "end_seconds": 10.0,
            "text": "Welcome to the sprint planning meeting.",
            "speaker": "SPEAKER_00",
            "confidence": 0.93,
        },
        {
            "id": "seg_0002",
            "start_seconds": 10.0,
            "end_seconds": 25.0,
            "text": "First item, we will hire Alice for the recruiting lead role.",
            "speaker": "SPEAKER_00",
            "confidence": 0.91,
        },
        {
            "id": "seg_0003",
            "start_seconds": 25.0,
            "end_seconds": 45.0,
            "text": "Discussing timeline and next steps.",
            "speaker": "SPEAKER_01",
            "confidence": 0.88,
        },
        {
            "id": "seg_0004",
            "start_seconds": 45.0,
            "end_seconds": 65.0,
            "text": "Bob will configure the Redis caching layer by Friday.",
            "speaker": "SPEAKER_00",
            "confidence": 0.90,
        },
        {
            "id": "seg_0005",
            "start_seconds": 65.0,
            "end_seconds": 85.0,
            "text": "Alice will finalize the API docs by Monday.",
            "speaker": "SPEAKER_01",
            "confidence": 0.92,
        },
        {
            "id": "seg_0006",
            "start_seconds": 85.0,
            "end_seconds": 100.0,
            "text": "We have decided to adopt Redis for caching.",
            "speaker": "SPEAKER_00",
            "confidence": 0.89,
        },
        {
            "id": "seg_0007",
            "start_seconds": 100.0,
            "end_seconds": 110.0,
            "text": "Any other business?",
            "speaker": "SPEAKER_02",
            "confidence": 0.87,
        },
        {
            "id": "seg_0008",
            "start_seconds": 110.0,
            "end_seconds": 120.0,
            "text": "Thanks everyone.",
            "speaker": "SPEAKER_00",
            "confidence": 0.94,
        },
    ],
    "model": {"transcription": "whisper-large-v3-turbo", "diarization": None},
}
