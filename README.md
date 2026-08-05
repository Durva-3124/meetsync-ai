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
