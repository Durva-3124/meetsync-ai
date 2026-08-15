# meetsync-ai

Repository for the Sprint 1 AI service and frontend/backend components.

## Sprint 1 demo

- Unit tests for the embedding and similarity ranking core
- Dockerized AI service with `ai-service/Dockerfile`
- Root `docker-compose.yml` for workspace-level service startup
- Local override for live development via `docker compose`

## Sprint 2 demo

- New internal AI endpoint `POST /internal/ai/skill-match`
- Ranked, justified candidate matching using skill embedding similarity plus workload penalty
- Integration coverage for decision extraction and skill matching against sample transcript data
- Demo-ready workflow for matching hiring and task assignment candidates from meeting decisions

## Sprint 3 demo

- ✅ Curated regression fixtures for decision extraction and skill-match ranking
- ✅ Human spot-check pass on the transcript-to-decision and skill-fit decisions
- ✅ Finalized Explainable-AI `View Source` contract with the Frontend lead using transcript span metadata
- ✅ Stable source-span linkage for decisions, action items, and task notifications
- ✅ Regression test suite: 13 tests, all passing (end-to-end pipeline validation)
- ✅ GitHub Actions CI integration with automated regression testing
- ✅ Audio fixture catalog: 5 scenarios from 1-second to 10-minute meetings
- ✅ Comprehensive documentation (regression strategy, hardening plan, demo script)
- ✅ Hardening test suite: 16 edge case tests identifying 5 areas for Week 1-2 stabilization
- ✅ Decision: Hardening over Socket.io integration (live-caption prototype complete, post-Sprint 3 integration)

## Documentation

- [REGRESSION_TESTING_STRATEGY.md](docs/REGRESSION_TESTING_STRATEGY.md) — Fixture organization, test coverage, and CI integration
- [HARDENING_PLAN_WEEKS_1_2.md](docs/HARDENING_PLAN_WEEKS_1_2.md) — Edge case handling, performance targets, and stabilization checklist
- [SPRINT_3_DEMO_SCRIPT.md](docs/SPRINT_3_DEMO_SCRIPT.md) — 15-minute demo flow with live commands and talking points
- [SPRINT_3_CODE_REVIEW.md](docs/SPRINT_3_CODE_REVIEW.md) — Comprehensive code quality assessment and recommendations

## Run with Docker Compose

From the repository root:

```powershell
docker compose up --build
```

If you need to stop the service, press `Ctrl+C`.

## Run unit tests

From `ai-service`:

```powershell
cd ai-service
.\.venv\Scripts\python.exe -m pytest -q
```

## Health check

```powershell
curl http://localhost:8000/health
```
