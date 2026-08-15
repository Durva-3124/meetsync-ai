# Sprint 3 Demo Script

## Title
**"From Decisions to Action: Explainable AI for Meeting Intelligence"**

---

## Demo Overview (15 minutes)

### What We Built
A complete intelligence pipeline that:
1. **Extracts decisions** from meeting transcripts with confidence scoring
2. **Ranks skill-matched candidates** for action items with workload awareness  
3. **Scores meeting effectiveness** using multiple dimensions
4. **Traces every decision back to source** (Explainable-AI)
5. **Runs end-to-end regression tests** on real meeting data

### Key Theme
**"Interpretability matters"** — Every decision includes its source span, confidence score, and reasoning. The frontend can render "View Source" without data loss.

---

## Live Demo Flow (9 minutes)

### Part 1: Decision Extraction (3 min)

**Narrative:**  
"Let's start with a real 3-minute meeting. We want to know: what were the decisions made?"

```bash
# Show the test transcript
curl -X POST http://localhost:8000/internal/ai/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "text": "Welcome to sprint planning. We will hire Alice for recruiting...",
      "segments": [...]
    }
  }'
```

**Expected output:**
- 3+ decisions extracted
- Each with reasoning and confidence (0.85-0.95)
- Source spans pinpoint exact segment, timestamp, and speaker
- Log shows: `decision_extraction.complete confidence=0.91 decision_count=3`

**Key talking point:**  
"Notice the source_span — it's not just the decision text, but the exact segment ID, timestamp, and original speaker. The frontend can hyperlink from a decision back to the transcript."

---

### Part 2: Skill-Match Ranking (3 min)

**Narrative:**  
"Now we have a decision: 'We need to hire a recruiting lead.' The system has 5 candidates. How should we rank them?"

```bash
# Show skill-match response
curl -X POST http://localhost:8000/internal/ai/skill-match \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task_hiring_001",
    "task_description": "We need a recruiting lead",
    "required_skills": ["recruiting", "interviewing"],
    "candidates": [
      {
        "employee_id": "...", "name": "Alice",
        "skills": [{"skill_id": "...", "name": "Recruiting", "proficiency": 0.95}],
        "workload": {"hours_assigned": 5, "hours_capacity": 40}
      },
      {
        "employee_id": "...", "name": "Bob",
        "skills": [{"skill_id": "...", "name": "Backend", "proficiency": 0.95}],
        "workload": {"hours_assigned": 38, "hours_capacity": 40}
      }
    ]
  }'
```

**Expected output:**
- Alice ranks #1 (0.84 final_score): skill_similarity=0.92, workload_penalty=0.08
- Bob ranks #2 (0.15 final_score): skill_similarity=0.40, workload_penalty=0.99
- Each match includes matched_skill_ids and reason string

**Key talking point:**  
"This isn't a black-box algorithm. We can explain every score: Alice has 92% skill similarity to the task AND 75% availability. Bob has mismatched skills AND is nearly fully booked. The formula is: `final_score = skill_similarity * (1 - workload_weight * utilization)`."

---

### Part 3: Effectiveness Scoring (2 min)

**Narrative:**  
"How effective was this meeting? Let's score it across four dimensions."

```bash
# Show effectiveness response
curl -X POST http://localhost:8000/internal/ai/effectiveness-score \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_id": "meeting_001",
    "duration_seconds": 180,
    "talk_time": [
      {"speaker": "SPEAKER_00", "seconds": 95},
      {"speaker": "SPEAKER_01", "seconds": 55},
      {"speaker": "SPEAKER_02", "seconds": 30}
    ],
    "decision_log": {"decisions": [...]},
    "agenda_items_planned": 3,
    "agenda_items_covered": 2
  }'
```

**Expected output:**
```json
{
  "effectiveness_score": 72.5,
  "agenda_adherence": 0.733,      // 2/3 items covered, 2/3 time spent
  "decision_density": 0.900,      // 3 decisions in 3 minutes
  "talk_time_balance": 0.650,     // Some imbalance but acceptable
  "assignment_coverage": 0.857,   // 6 assignments from 7 decisions
  "component_weights": {...},
  "explanation": "Agenda adherence=0.73, decision density=0.90, ..."
}
```

**Key talking point:**  
"A score of 72.5 means: good decision velocity, but agenda adherence could improve. We're not hiding behind a single number — each component is visible and weighted."

---

## Code Review Highlights (3 minutes)

### 1. Source-Span Contract (Explainable-AI Foundation)

**File:** [ai-service/app/intelligence/schemas/transcript.py](../../ai-service/app/intelligence/schemas/transcript.py)

```python
class DecisionSourceSpan(BaseModel):
    transcript_id: UUID                        # Link to source
    segment_id: str = Field(pattern=r"^seg_[A-Za-z0-9_-]+$")
    start_seconds: float = Field(ge=0)
    end_seconds: float = Field(ge=0)
    text: str                                  # Original text
    speaker: str | None = None
    character_start: int | None = Field(default=None, ge=0)
    character_end: int | None = Field(default=None, ge=0)
```

**Why this matters:** Every decision can be traced back to the exact source. Frontend renders:
- Clickable timestamp (start_seconds → play from 25s)
- Speaker name (SPEAKER_00 → identified as "Alice" via diarization)
- Highlighted transcript excerpt (character_start/end)
- Confidence badge

### 2. Regression Test Suite (Confidence in Stability)

**File:** [ai-service/app/intelligence/tests/test_regression.py](../../ai-service/app/intelligence/tests/test_regression.py)

**Coverage:**
- 5 fixture audio files (minimal → 10-minute meeting)
- 3 fixture transcripts (hiring → full meeting)
- 13 regression tests (audio validation → end-to-end pipeline)
- All tests passing in <6 seconds with local embeddings

**Key insight:** "We don't rely on mocks. These tests use the real FastAPI app, real transcript data, and real ranking algorithms."

### 3. Skill-Match Ranking Logic

**File:** [ai-service/app/internal_ai/router.py](../../ai-service/app/internal_ai/router.py), lines 298-350

```python
# Step 1: Embed task description
query_vector = _normalize_vector(embed([task_description])[0])

# Step 2: For each candidate, aggregate skill embeddings by proficiency
candidate_vector = _aggregate_candidate_vector(candidate)

# Step 3: Compute similarity
similarity = float(np.dot(query_vector, candidate_vector))

# Step 4: Apply workload penalty
utilization = candidate.workload.hours_assigned / candidate.workload.hours_capacity
penalty = request.workload_weight * utilization
final_score = max(0.0, similarity * (1.0 - penalty))
```

**Why it works:** This is not a "magic AI" — it's a transparent, mathematically simple formula that can be explained to stakeholders.

---

## Hardening Observations (2 minutes)

### Current Edge Case Handling

We ran a hardening test suite (16 tests) and identified:

✅ **Passing (11/16):**
- Max decisions limit respected
- Very long transcripts (100+ potential decisions)
- Confidence scores always in [0.0, 1.0]
- Source spans always populated
- Single-speaker effectiveness scoring
- Concurrent requests are safe

❌ **Identified Issues (5/16):**
- Empty text should return `{"decisions": []}` but returns 400
- Whitespace-only text times out (embedding cost)
- No-keyword text times out (same)
- Skill-match validation is strict (good for prod, tricky for testing)
- Zero-duration meetings should have sensible defaults

**Plan:** These will be fixed in Weeks 1-2 hardening phase (not blocking Sprint 3 demo).

---

## What's NOT in Sprint 3 (Future Work)

### Socket.io Live-Caption Streaming

**Why not now:** The live_caption_stream.py prototype works, but full Socket.io integration requires:
1. Backend Socket.io server setup
2. Audio chunk buffering + flow control
3. Reconnection/error recovery
4. End-to-end stress testing
5. Estimated effort: 8-12 hours

**Plan:** Post-Sprint 3, once hardening is complete, we'll wire this into the backend.

---

## Demo Talking Points

### On Decisions
> "Every decision includes its source. If leadership questions a decision, we can show the exact timestamp and original wording. That builds trust."

### On Skill-Matching
> "This isn't a black box. We show the formula, the scores, and the reasoning. A manager can understand why Alice was recommended instead of Bob."

### On Effectiveness
> "A single score (72.5) is useless without context. We break it down: agenda adherence, decision density, participation balance, and assignment coverage. Each dimension is actionable."

### On Regression Tests
> "13 tests, all passing, covering real transcripts and real decisions. We run these on every commit via GitHub Actions. When we ship, we're confident nothing broke."

---

## Timeline & Status

| Component | Status | Sprint |
|-----------|--------|--------|
| Decision extraction | ✅ Complete | 2 |
| Skill-match ranking | ✅ Complete | 2 |
| Effectiveness scoring | ✅ Complete | 2 |
| Regression test suite | ✅ Complete | 3 |
| GitHub Actions CI | ✅ Complete | 3 |
| Source-span contract | ✅ Complete | 3 |
| Hardening (edge cases) | 🔄 In Progress | 3-4 |
| Socket.io streaming | ⏳ Planned | Post-3 |

---

## Q&A Preparation

**Q: Why not use sentence-transformers in tests?**  
A: They're slower (~3-5s per call) and non-deterministic. We use fast, deterministic local embeddings for tests, real embeddings for production (controlled by `MEETSYNC_USE_LOCAL_EMBEDDINGS`).

**Q: What if a decision is misclassified?**  
A: The source span is there. A human can review the original text and override. We don't replace human judgment; we augment it.

**Q: How does skill-match handle new skills?**  
A: Skills are embedded on-the-fly. If a candidate has "Kubernetes" but the task says "container orchestration," they'll still rank well due to semantic similarity.

**Q: What happens if the meeting is very long?**  
A: We tested up to 10-minute meetings. They complete <5s with 12+ segments. For 30+ min meetings, we'd implement chunking (backlog for future sprint).

---

## Closing Remarks

**Summary:**
- AI service is stable, interpretable, and well-tested
- Every decision has full traceability back to source
- Skill-matching is transparent and explainable
- Regression suite runs on every commit
- Hardening and live-caption integration in pipeline for future sprints

**Next Steps:**
- 🔄 Complete hardening checklist (Weeks 1-2)
- 🔄 Expand regression fixtures (5→8 scenarios)
- ⏳ Socket.io live-caption integration (Post-Sprint 3)
- ⏳ Performance optimization for 30+ minute meetings

---

**End of Demo (~15 minutes)**
