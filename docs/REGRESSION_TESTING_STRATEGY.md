# Regression Testing Strategy

## Overview

The AI service regression test suite ensures that the decision extraction, skill-matching, and effectiveness scoring pipelines remain stable across code changes. Fixtures are organized by complexity and use case.

## Fixture Categories

### Audio Fixtures

Located in [ai-service/app/intelligence/tests/fixtures.py](../../ai-service/app/intelligence/tests/fixtures.py):

- **minimal_1sec**: Minimal 1-second WAV file for format validation
- **hiring_decision**: 3-second segment representing a hiring decision statement
- **deadline_discussion**: 5-second multi-speaker deadline discussion
- **meeting_3min**: 3-minute meeting with multiple decisions and deadlines
- **meeting_10min**: 10-minute meeting for memory/latency stress testing

### Transcript Fixtures

Pre-normalized transcript outputs for consistent test behavior:

- `FIXTURE_TRANSCRIPT_HIRING`: Single-speaker hiring decision
- `FIXTURE_TRANSCRIPT_DEADLINE`: Multi-speaker deadline discussion
- `FIXTURE_TRANSCRIPT_FULL_MEETING`: Complete 3-minute meeting with decision log

## Test Coverage

### Audio Fixture Validation (`TestAudioFixturesRegression`)

Ensures WAV file headers and format are correct:
- RIFF header validation
- WAVE format marker presence
- No corruption during base64 encoding/decoding

### Decision Extraction (`TestDecisionExtractionRegression`)

Tests decision extraction against various transcript lengths:
- Single-decision transcripts (hiring)
- Multi-speaker transcripts (deadlines)
- Full-meeting transcripts (complex scenarios)

**Verified:**
- Decisions are extracted with reasoning and confidence
- Source spans are correctly linked to transcript segments
- No timeouts on longer transcripts

### Skill-Match Ranking (`TestSkillMatchRegressionWithDecisions`)

Tests skill-candidate ranking accuracy:
- Relevant skills rank higher than irrelevant skills
- Workload penalty correctly reduces final scores
- Multiple candidates are ranked consistently

**Verified:**
- Alice ranks first for recruiting tasks (relevant skills + good availability)
- Bob ranks lower for the same task (irrelevant skills + high workload)

### Effectiveness Score (`TestEffectivenessScoreRegression`)

Tests holistic meeting quality scoring:
- Talk time balance calculation
- Decision density scoring
- Agenda adherence tracking

**Verified:**
- Scores are within [0.0, 100.0] range
- All component metrics are calculated
- Multiple assignments are handled correctly

### End-to-End Pipeline (`TestEndToEndPipelineRegression`)

Tests the full pipeline:
1. Transcript → Decision extraction
2. Decision extraction → Deadline extraction
3. Complete → Effectiveness scoring

**Verified:**
- No data loss or schema mismatches between stages
- Transcript IDs are correctly threaded through the pipeline

## CI Integration

The regression suite runs in GitHub Actions as part of the AI service CI pipeline:

```yaml
- name: Run Regression Tests Against Fixtures
  run: pytest app/intelligence/tests/test_regression.py -v --tb=short
  env:
    MEETSYNC_USE_LOCAL_EMBEDDINGS: "1"
```

**Key points:**
- Local embeddings are used (`MEETSYNC_USE_LOCAL_EMBEDDINGS=1`) for fast, deterministic test execution
- Tests run on every push to `main`, `feature/development`, and on pull requests
- Test output includes verbose results for debugging

## Running Locally

```bash
cd ai-service

# Run all regression tests
.\.venv\Scripts\python.exe -m pytest app/intelligence/tests/test_regression.py -v

# Run a specific test class
.\.venv\Scripts\python.exe -m pytest app/intelligence/tests/test_regression.py::TestDecisionExtractionRegression -v

# Run with live embeddings (slower, more accurate)
$env:MEETSYNC_USE_LOCAL_EMBEDDINGS = "0"
.\.venv\Scripts\python.exe -m pytest app/intelligence/tests/test_regression.py -v
```

## Adding New Fixtures

To add a new fixture:

1. Add a `get_fixture_wav_*` function in [fixtures.py](../../ai-service/app/intelligence/tests/fixtures.py)
2. Add an entry to `FIXTURE_AUDIO_CATALOG` with metadata
3. Add a transcript fixture (e.g., `FIXTURE_TRANSCRIPT_*`)
4. Add a test class to [test_regression.py](../../ai-service/app/intelligence/tests/test_regression.py)

Example:

```python
def get_fixture_wav_backlog_refinement() -> bytes:
    """Fixture for a backlog refinement meeting."""
    b64 = "UklGRloAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    return base64.b64decode(b64)

FIXTURE_AUDIO_CATALOG["backlog_refinement"] = {
    "name": "backlog_refinement",
    "duration_seconds": 45.0,
    "get": get_fixture_wav_backlog_refinement,
    "expected_segments": 3,
    "description": "Backlog refinement with story estimation",
}
```

## Maintenance

- **Fixture updates**: Update fixtures when the expected decision/deadline format changes
- **Embedding model changes**: If switching from local embeddings to full sentence-transformers, re-baseline all test thresholds
- **Timeout changes**: If endpoint timeouts change, update `@with_timeout_and_retries` decorators
- **New endpoints**: Add test cases to `TestEndToEndPipelineRegression` for new AI service endpoints

## Known Limitations

- Audio fixtures are silence-based placeholders; real speech would improve accuracy testing
- Local embeddings are deterministic but less semantically accurate than full sentence-transformers
- Deadline normalization depends on `meetingDate` context; tests use fixed dates
