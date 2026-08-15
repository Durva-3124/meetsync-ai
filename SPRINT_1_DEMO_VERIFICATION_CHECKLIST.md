# Sprint 1 Demo - Pre-Demo Verification Checklist

> **Before the demo:** Run these commands in sequence to ensure all systems are operational.

---

## ✅ Step 1: Verify Unit Tests (Expected: 100% Pass Rate)

**From:** `ai-service/` directory

```powershell
cd ai-service
python -m pytest app/intelligence/tests/ -v --tb=short
```

**Expected Output:**
```
test_embeddings.py::test_embed_returns_empty_list_for_no_texts PASSED
test_embeddings.py::test_embed_returns_normalized_vectors_and_uses_cached_model PASSED
test_embeddings.py::test_rank_by_similarity_sorts_candidates_by_cosine_similarity PASSED
test_embeddings.py::test_rank_by_similarity_returns_empty_for_no_candidates PASSED
test_router_health.py::test_health_check PASSED
====== 5 passed in X.XXs ======
```

**What to verify:** All tests PASSED ✓

---

## ✅ Step 2: Clean Docker State (Fresh Start)

**From:** Project root (`meetsync-ai/`) directory

```powershell
# Remove existing containers and volumes
docker compose down -v

# Verify cleanup
docker ps -a
docker volume ls
```

**Expected:** No containers/volumes related to meetsync services

---

## ✅ Step 3: Bring Up Docker Compose (Build & Start Services)

**From:** Project root (`meetsync-ai/`) directory

```powershell
# Build and start all services
docker compose up --build
```

**What to watch for:**
- MongoDB initializing and passing health checks
- Redis initializing and passing health checks
- ai-1 service (port 8001) starting and passing health check
- ai-2 service (port 8002) starting and passing health check
- Backend service (port 5000) starting after dependencies are healthy

**Success indicators in logs:**
```
ai-1  | INFO:     Application startup complete
ai-2  | INFO:     Application startup complete
backend | INFO: AI services initialized
```

**⏱️ Expected time:** 60-90 seconds until services are healthy

---

## ✅ Step 4: Verify Service Health (In Separate Terminal)

**In a new terminal, from project root:**

```powershell
# Health check on AI service 1
curl http://localhost:8001/intelligence/health

# Health check on AI service 2
curl http://localhost:8002/intelligence/health

# Health check on Backend
curl http://localhost:5000/health
```

**Expected Output:**
```json
{"status":"ok"}
```

**All three endpoints should respond with 200 OK** ✓

---

## ✅ Step 5: Test Embedding API (Live Operational Proof)

**In terminal (services still running):**

```powershell
# Test embedding endpoint with sample texts
$body = @{
    texts = @(
        @{ segment_id = "1"; text = "Alice talked about the quarterly results" },
        @{ segment_id = "2"; text = "Bob mentioned revenue was up 20%" },
        @{ segment_id = "3"; text = "The weather is sunny today" }
    )
} | ConvertTo-Json

curl -X POST http://localhost:8001/intelligence/embed `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Output (truncated for readability):**
```json
{
  "model": "sentence-transformers/all-MiniLM-L6-v2",
  "dimension": 384,
  "embeddings": [
    {
      "segment_id": "1",
      "vector": [0.1234, -0.0567, ..., 0.0891]
    },
    {
      "segment_id": "2",
      "vector": [0.1567, -0.0234, ..., 0.0712]
    },
    {
      "segment_id": "3",
      "vector": [-0.0123, 0.2345, ..., -0.0456]
    }
  ]
}
```

**Success criteria:**
- ✓ HTTP 200 response
- ✓ All 3 embeddings returned
- ✓ Each embedding has 384 dimensions
- ✓ Vectors are normalized (L2 norm ≈ 1.0)

---

## ✅ Summary Checklist

Before going live:

- [ ] All 5 unit tests passed (100% pass rate)
- [ ] Docker cleaned (down -v executed)
- [ ] docker compose up --build completed successfully
- [ ] All services show "healthy" status
- [ ] Three /health endpoints respond 200 OK
- [ ] POST /intelligence/embed returns 200 with valid embeddings
- [ ] All logs show "Application startup complete"

**If all checks pass: You're ready for the demo!** 🚀

---

## 🔧 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Tests fail | Run `pip install -r requirements.txt` in `ai-service/` |
| Port already in use | `docker compose down`, then retry |
| Services not healthy | Check logs: `docker compose logs ai-1` (or ai-2/backend) |
| Embedding endpoint 500 error | Verify MongoDB is healthy: `docker compose logs mongo` |
| CUDA/GPU errors | Service defaults to CPU; add `DEVICE: cpu` env var if needed |
