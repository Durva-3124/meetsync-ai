# Sprint 1 Demo

## Completed

- Embedding + similarity ranking core with `app/intelligence/embeddings.py`
- Unit tests for `embed()` and `rank_by_similarity()`
- Dockerized AI service using `ai-service/Dockerfile`
- Workspace-level Docker Compose file with a local development override

## Run locally

From the repository root:

```powershell
docker compose up --build
```

Then visit:

```powershell
http://localhost:8000/health
```

## Run tests

```powershell
cd ai-service
.\.venv\Scripts\python.exe -m pytest -q
```

## Notes

- `docker compose up --build` will use `docker-compose.override.yml` to mount the local `ai-service/app` folder for live editing.
- `ai-service/.dockerignore` keeps the build context small by excluding caches and the local virtual environment.
