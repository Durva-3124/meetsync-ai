# AI Service

This service provides FastAPI endpoints for intelligence and speech processing.

## Local setup

1. Create a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

3. Run the service locally:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Docker setup

Build the container:

```powershell
docker build -t meetsync-ai-service .
```

Run the container:

```powershell
docker run --rm -p 8000:8000 meetsync-ai-service
```


## Docker Compose

From the repository root, run:

```powershell
docker compose up --build
```

This uses `docker-compose.yml` and `docker-compose.override.yml` to build the AI service image and mount local source files for live editing.

## Endpoints

- `GET /health`
- `GET /speech/health`
- `POST /speech/transcribe`
- `GET /intelligence/health`
- `POST /intelligence/transcribe`
- `POST /intelligence/diarize`
- `POST /intelligence/embed`

## Notes

- `openai-whisper` and `pyannote.audio` are installed via `requirements.txt`.
- `ffmpeg` is required by Whisper and is installed in the Docker image.
