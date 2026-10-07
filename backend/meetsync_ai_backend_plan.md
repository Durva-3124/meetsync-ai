# MEETSYNC AI
## Backend Development & Implementation Document
**Node.js + TypeScript + Express + MongoDB + Socket.IO — Production-Ready Backend Architecture & 30-Day Build Plan**

*Companion document: MeetSync AI — Software Architecture & Implementation Document (v2) · Project Execution Plan · Frontend Development Plan · Student 1 & Student 2 Microservices Plans*  
**Owner:** Member A — Backend & Platform Lead  
**Duration:** Monday, 3 August – Monday, 31 August (30 calendar days / ~21 working days), synchronized with the same four-sprint calendar as the rest of the team.  
**Scope:** 5 P0 (Must-Have) + 4 P1 (Should-Have) reduced-scope features — the Core Backend layer coordinating Frontend, AI Microservice 1 (Speech & Language Intelligence), AI Microservice 2 (Decision Intelligence), MongoDB, Authentication and Real-Time Communication.

---

## 1. Executive Summary

The Core Backend is the single gateway of MeetSync AI: it is the only service the frontend ever calls, the only service that writes to MongoDB, and the only client of both AI microservices. This document supersedes the backend sections of the Software Architecture & Implementation Document (v2) with implementation-grade detail — exact folder structure, exact schemas, a locked API contract with Student 1's `speech-intelligence-service` and Student 2's `decision-intelligence-service`, and a day-by-day build plan synchronized with Frontend, AI-1, and AI-2.

Three deliberate improvements are made over the original scope in Section 3.2 of the architecture document, each justified below rather than silently introduced:

1. **TypeScript instead of plain JavaScript on the Node/Express layer** — the frontend already committed to TypeScript (Section 4 of the Frontend Plan); sharing a typed contract (types generated from the same Zod schemas that validate requests) turns a class of integration bugs into compile-time errors instead of demo-day surprises, at near-zero added build time for a 4-person team.
2. **A layered Controller → Service → Repository architecture instead of routes calling Mongoose directly** — this is the single highest-leverage change for testability: services can be unit-tested with a mocked repository, with no MongoDB connection required, which is exactly what a hackathon's compressed test-writing time needs.
3. **Redis added as a lightweight, single dependency doing three jobs at once** (BullMQ queue backend, rate-limit store, response cache) rather than three separate mechanisms — one more container in docker-compose buys queued notifications, resilient rate limiting, and cheap caching together.

Everything else — the Node.js + Express core, MongoDB as the single primary store, Socket.io for live captions, JWT auth, and the internal-only `/internal/ai/*` boundary — is kept exactly as scoped in the architecture document, because that split is what already lets four people build in parallel without blocking each other.

---

## 2. Responsibilities & Ownership

### 2.1 What Backend owns
* **Full ownership:** The Node.js/Express/TypeScript API, all MongoDB schemas and data access, JWT authentication and RBAC, the Socket.io real-time layer, the internal AI-client integration layer, background jobs, file-upload handling, and Docker/CI/CD for this service.
* **Shared ownership:** The public `/api/*` REST contract (locked jointly with Member C on Day 1-2, exactly as Section 6 of the Frontend Plan requires) and the `/internal/ai/*` contract (locked jointly with Student 1 and Student 2 on Day 1, exactly as Section 4 of their plans requires).
* **Not Backend's responsibility:** The React frontend's client-side state/rendering, either AI microservice's model pipeline (Whisper, pyannote, embeddings, LLM prompts), or any ML/NLP logic — Backend orchestrates and persists; it never computes AI output itself.

### 2.2 Ownership boundary (why this split)
The architecture's Section 3.5 data flow is: audio in → AI-1's diarized transcript → AI-1's MOM/deadlines and AI-2's decisions/skill-match/effectiveness-score → Core Backend persistence → Frontend rendering. Backend sits in the middle of every arrow in that diagram — it is the only component with a live connection to MongoDB, the only component that calls either AI microservice, and the only component the frontend is allowed to call. This means Backend has the widest ownership surface on the team, and the highest integration risk if the contract with any of the other three tracks drifts — which is why Section 9 of this document treats the contract as versioned and change-managed, not a one-time agreement.

| Area | Owner | Notes |
| :--- | :--- | :--- |
| Auth (register/login/refresh), RBAC | Backend (Member A) | JWT + bcrypt; employee / reviewer / admin scopes |
| Meeting / Task CRUD & persistence | Backend (Member A) | Single source of truth in MongoDB |
| Audio ingestion → AI-1 orchestration | Backend (Member A) | Multer upload, streamed to AI-1 |
| MOM / deadlines generation | AI-1 (Student 1) | Backend calls it, persists the result |
| Decisions / skill-match / score | AI-2 (Student 2) | Backend calls it, persists the result |
| Review diff, lock, docx/pdf export | Backend (Member A) | No AI dependency at this stage |
| Live-caption relay (Socket.io) | Backend (Member A) | Relays AI-1's streaming output |
| Screens, client state, rendering | Frontend (Member C) | Not in Backend's scope |

---

## 3. Backend Modules to Build

Mirroring the "Modules/Microservices to Build" structure already used in the Frontend, Student 1, and Student 2 documents, the backend is organized into independently testable modules sharing one Express app, one MongoDB connection, and one auth/session boundary.

| Module | What it does | Key building blocks |
| :--- | :--- | :--- |
| **3.1 Auth & RBAC Module** | Registration, login, refresh-token rotation, role-aware route guarding. | JWT, bcrypt, `auth.middleware.ts`, `rbac.middleware.ts` |
| **3.2 Meeting & Task Module** | Meeting/task CRUD, processing-status state machine, pagination. | `meetingController/Service/Repository`, `taskController/Service/Repository` |
| **3.3 Audio & AI Orchestration Module** | Receives audio, orchestrates all 6 `/internal/ai/*` calls in the correct dependency order, persists every result. | `aiClient.ts`, `aiOrchestrationService.ts`, circuit breaker, retry |
| **3.4 Review & Export Module** | Diff/version-stamp reviewer edits, lock the record, generate .docx/.pdf. | `reviewService.ts`, `exportService.ts`, docx/Puppeteer, BullMQ worker |
| **3.5 Real-Time Module** | Live-caption relay over Socket.io, connection/status/error events. | `sockets/captionNamespace.ts`, room-per-meetingId |
| **3.6 Notification Module** | Deadline reminder scheduling and delivery. | Nodemailer, BullMQ repeatable jobs |
| **3.7 Platform Module** | Config, logging, health checks, metrics, rate limiting, caching. | `config/`, `middleware/`, `utils/` |

---

## 4. Backend Architecture Overview

### 4.1 System context
Backend is the sole gateway between four surfaces: the React frontend (public REST + WebSocket), MongoDB (private, direct connection), AI Microservice 1 / speech-intelligence-service on port 8001, and AI Microservice 2 / decision-intelligence-service on port 8002 (both private, internal-only). Neither AI service, nor MongoDB, is ever reachable from the public internet in the target deployment — only Backend's public port is exposed.

```
                          ┌───────────────────────────┐
                Browser ── HTTPS ──▶ │        React Frontend      │
                          └─────────────┬─────────────┘
                                        │ REST + WebSocket (/api/*, /ws/captions)
                                        ▼
                          ┌───────────────────────────┐
                          │        CORE BACKEND       │
                          │   Node.js + Express + TS  │
                          │  Controllers→Services→Repos│
                          └───┬───────────┬───────────┘
                internal REST │           │ internal REST
              /internal/ai/*  │           │ /internal/ai/*
                              ▼           ▼
                 ┌─────────────────┐ ┌─────────────────┐
                 │ AI Microservice 1│ │ AI Microservice 2│
                 │ speech-intel-svc │ │ decision-intel-svc│
                 │ FastAPI :8001   │ │ FastAPI :8002   │
                 └─────────────────┘ └─────────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │  MongoDB (Atlas / local) │ ◀── Backend is the ONLY writer
                  └─────────────────────────┘
                               ▲
                               │
                  ┌─────────────────────────┐
                  │   Redis (cache/queue/   │
                  │   rate-limit/socket adap)│
                  └─────────────────────────┘
```
*Figure 4.1 — Backend as the single gateway. Neither AI microservice nor MongoDB is reachable from outside this boundary.*

### 4.2 Layered architecture
Every request flows through the same four layers, in the same order, with a strict one-directional dependency rule: a layer may only call the layer directly below it.

| Layer | Responsibility | Must NOT do |
| :--- | :--- | :--- |
| **Routes** | Bind an HTTP verb + path to a controller method; attach route-level middleware (`validate`, `auth`, `rbac`, `rateLimiter`). | Contain business logic or touch Mongoose models directly. |
| **Controllers** | Parse req → call one service method → shape the `ApiResponse`. Thin by design. | Contain multi-step business logic, DB queries, or AI-client calls directly. |
| **Services** | All business logic: orchestration, validation beyond schema shape, AI-client calls, diff/scoring logic, transaction boundaries. | Import Express req/res types — services must be callable from a script or a test with no HTTP context. |
| **Repositories** | The only layer that imports Mongoose models; translates domain calls (`findMeetingById`) into queries. | Contain business rules — a repository just fetches/persists. |
| **Models** | Mongoose schemas, indexes, virtuals, schema-level validation. | Contain business logic beyond field-level defaults/validators. |

#### 4.2.1 Middleware pipeline (applied in this order)
1. `requestLogger` — assigns a request ID, logs method/path/duration on completion (Pino).
2. `helmet`, `cors`, `express.json({limit})`, `express-mongo-sanitize`, `hpp` — security/normalization (Section 15).
3. `rateLimiter` — per-route limiter (global, auth-specific, AI-proxy-specific).
4. `auth` — verifies the JWT, attaches `req.user`, or passes through for public routes.
5. `rbac(...roles)` — route-declared allow-list, 403 if `req.user.role` is not included.
6. `validate(schema)` — Zod-parses `req.body/params/query`; 422 with field-level errors on failure.
7. `controller` — wrapped in `asyncHandler` so any thrown/rejected error reaches the centralized error handler.
8. `errorHandler` — the single place that turns any error (`ApiError` or unexpected) into the standard error envelope (Section 16).

---

## 5. Complete Technology Stack

| Layer | Technology | Why this exact choice |
| :--- | :--- | :--- |
| **Runtime** | Node.js 20 LTS | Non-blocking I/O suits many lightweight concurrent requests (dashboard polling, AI-proxy calls, live captions). |
| **Language** | TypeScript 5 | Shared typed contract with the already-TypeScript frontend; catches contract drift at compile time. |
| **Framework** | Express.js 4 | Minimal, well-understood, the only realistic choice for a 4-week build with three other services to integrate. |
| **ORM / ODM** | Mongoose 8 | Schema definition + validation + population for MongoDB's document model. |
| **Database** | MongoDB (Atlas free tier) | Nested, variable-length meeting data (transcripts, decisions) is naturally document-shaped. |
| **Cache / Queue / Rate-limit store** | Redis (ioredis) + BullMQ | One dependency doing three jobs: response cache, job queue backend, and a shared rate-limit store. |
| **Auth** | JWT (jsonwebtoken) + bcrypt | Lightweight, stateless auth suited to a small role-based system. |
| **Validation** | Zod | Same library the frontend already uses (Section 6.6 of the Frontend Plan) — schema intent stays consistent across the stack. |
| **Real-time** | Socket.io (+ `@socket.io/redis-adapter`, optional) | The only realistic option for the live-caption stretch feature; Redis adapter is a documented upgrade path if horizontally scaled. |
| **AI-client HTTP** | axios + axios-retry + opossum (circuit breaker) | Retries transient failures; the circuit breaker stops hammering a genuinely-down AI service mid-demo. |
| **File upload** | Multer | Streams multipart audio straight through to AI-1 without unnecessary disk writes. |
| **Background jobs** | BullMQ (Redis-backed) | Deadline reminders, export generation, and AI-retry jobs run off the request thread. |
| **Document export** | docx (npm) + Puppeteer | Directly produces the final reviewed .docx/.pdf — a hard requirement, not optional. |
| **Email** | Nodemailer (SMTP: Mailtrap/SendGrid free tier) | Single-channel notification tied to the deadline feature, per the architecture document's P1 scope. |
| **Logging** | Pino + pino-http | Structured JSON logs in production, pretty-printed in dev; far lower overhead than Winston at hackathon scale. |
| **Security middleware**| Helmet, cors, express-mongo-sanitize, hpp, express-rate-limit | Baseline OWASP hardening (Section 15). |
| **API docs** | swagger-jsdoc + swagger-ui-express | Auto-generated, always-current API reference served at `/api/docs`. |
| **Testing** | Jest + Supertest + mongodb-memory-server | Unit + API/integration tests with no external MongoDB dependency in CI. |
| **Containerization** | Docker (multi-stage) + docker-compose | Local dev parity across all four members; isolates Node's dependencies from the Python AI services. |
| **CI/CD** | GitHub Actions | Lint → typecheck → test → build → docker build on every PR; deploy on merge to main. |
| **Hosting** | Render / Railway | Free-tier hosting sufficient for a staging/demo deployment, consistent with the other three services. |

---

## 6. Project Folder Structure

Backend lives in its own top-level directory inside the shared monorepo, exactly as Section 6 of the architecture document lays out, with the internal layering from Section 4.2 made explicit.

```
meetsync-ai/
├── frontend/                        # React + TS (Member C — see Frontend Plan)
├── ai-service/
│   ├── app/speech/                  # Student 1 (see Student 1 Plan)
│   └── app/intelligence/            # Student 2 (see Student 2 Plan)
├── backend/                         # <-- THIS DOCUMENT
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                # Zod-validated environment schema
│   │   │   ├── db.ts                 # Mongoose connection
│   │   │   ├── redis.ts              # ioredis client
│   │   │   ├── logger.ts             # Pino instance
│   │   │   └── swagger.ts            # OpenAPI setup
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── meeting.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   ├── export.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── meeting.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   ├── export.controller.ts
│   │   │   └── notification.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── meeting.service.ts
│   │   │   ├── aiOrchestration.service.ts   # calls both AI microservices
│   │   │   ├── review.service.ts
│   │   │   ├── export.service.ts
│   │   │   └── notification.service.ts
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── meeting.repository.ts
│   │   │   ├── task.repository.ts
│   │   │   ├── decision.repository.ts
│   │   │   └── deadline.repository.ts
│   │   ├── models/                   # Mongoose schemas (Section 7)
│   │   │   ├── User.model.ts
│   │   │   ├── Meeting.model.ts
│   │   │   ├── Transcript.model.ts
│   │   │   ├── Mom.model.ts
│   │   │   ├── Decision.model.ts
│   │   │   ├── Task.model.ts
│   │   │   ├── Deadline.model.ts
│   │   │   ├── Score.model.ts
│   │   │   ├── ReviewVersion.model.ts
│   │   │   ├── Notification.model.ts
│   │   │   └── AuditLog.model.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rbac.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   ├── requestLogger.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── sockets/
│   │   │   ├── index.ts
│   │   │   ├── captionNamespace.ts
│   │   │   └── socketAuth.ts
│   │   ├── integrations/ai/
│   │   │   ├── aiClient.ts            # shared axios instances + retry/circuit-breaker
│   │   │   ├── speechServiceClient.ts # wraps AI-1's 3 endpoints
│   │   │   └── decisionServiceClient.ts # wraps AI-2's 3 endpoints
│   │   ├── jobs/
│   │   │   ├── queue.ts               # BullMQ queue definitions
│   │   │   ├── deadlineReminder.job.ts
│   │   │   ├── exportGeneration.job.ts
│   │   │   └── aiRetry.job.ts
│   │   ├── validators/                # Zod request schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── meeting.schema.ts
│   │   │   └── task.schema.ts
│   │   ├── utils/
│   │   │   ├── ApiError.ts
│   │   │   ├── ApiResponse.ts
│   │   │   ├── asyncHandler.ts
│   │   │   └── pagination.ts
│   │   ├── app.ts                     # Express app assembly
│   │   └── server.ts                  # HTTP + Socket.io bootstrap
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/                  # sample AI-1 / AI-2 response JSON
│   ├── postman/MeetSync-Backend.postman_collection.json
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml                 # node + ai-service(x2 routers) + mongo + redis
├── .github/workflows/ci.yml
└── docs/                              # this document + api-contract.md
```

---

## 7. Database Integration — MongoDB

MongoDB is the single primary store (Section 3.4 of the architecture document). Every collection below is owned exclusively by Backend — neither AI microservice nor the frontend ever opens a database connection.

### 7.1 Collections

| Collection | Key fields |
| :--- | :--- |
| **User** | `name`, `email` (unique, indexed), `passwordHash`, `role` (employee\|reviewer\|admin), `skills[String]`, `skillEmbedding[Number]` (cached from AI-2), `currentWorkload` (Number), `department`, `createdAt/updatedAt` |
| **RefreshToken** | `userId` (ref User), `tokenHash`, `expiresAt`, `revoked` (Boolean), `createdAt` |
| **Meeting** | `title`, `organizerId` (ref User), `attendees[ref User]`, `scheduledAt`, `durationMinutes`, `agendaItems[String]`, `processingStatus` (queued\|transcribing\|generating-insights\|ready\|failed), `audioRef`, `locked` (Boolean), `createdAt/updatedAt` |
| **Transcript** | `meetingId` (ref Meeting, unique index), `durationSec`, `segments[{speaker,start,end,text}]`, `talkTimeBySpeaker` (Map<String,Number>) |
| **Mom** | `meetingId` (unique index), `attendees[String]`, `summary`, `keyPoints[String]`, `draftActionItems[{text, ownerHint}]` |
| **Decision** | `meetingId` (indexed), `decisionText`, `reasoning`, `sourceSpan{start,end}`, `confidence` (Number) |
| **Task** | `meetingId` (indexed), `text`, `assigneeId` (ref User, nullable), `rankedCandidates[{employeeId, similarityScore, workloadScore, finalScore, rationale}]`, `status` (todo\|in-progress\|done), `deadlineId` (ref Deadline, nullable) |
| **Deadline** | `meetingId` (indexed), `taskRef`, `rawMention`, `normalizedDate` (Date), `confidence` (Number) |
| **Score** | `meetingId` (unique index), `score` (0-100), `breakdown{agendaAdherence, decisionDensity, talkTimeBalance}` |
| **ReviewVersion** | `meetingId` (indexed), `version` (Number), `editorUserId` (ref User), `diff[{origin: 'ai'\|'manual', field, oldValue, newValue}]`, `lockedAt` |
| **Notification** | `userId` (ref User), `taskId` (ref Task), `channel` ('email'), `status` (pending\|sent\|failed), `sentAt` |
| **AuditLog** | `actorId` (ref User), `action`, `entityType`, `entityId`, `metadata` (Mixed), `timestamp` (indexed, TTL-eligible) |

### 7.2 Indexing strategy
* `User.email` — unique index (login lookups).
* `Meeting.organizerId` + `Meeting.processingStatus` — compound index for the Dashboard list query.
* `Transcript.meetingId`, `Mom.meetingId`, `Score.meetingId` — unique indexes (one-to-one with Meeting).
* `Decision.meetingId`, `Task.meetingId`, `Deadline.meetingId` — single-field indexes (one-to-many, list queries).
* `AuditLog.timestamp` — TTL index (90-day retention) so audit data doesn't grow unbounded during development.

### 7.3 Repository pattern example

```typescript
// repositories/meeting.repository.ts
export class MeetingRepository {
  async create(data: CreateMeetingInput) { 
    return MeetingModel.create(data); 
  }
  
  async findById(id: string) { 
    return MeetingModel.findById(id).lean(); 
  }
  
  async listByOrganizer(organizerId: string, page: number, limit: number) {
    return MeetingModel.find({ organizerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }
  
  async updateStatus(id: string, processingStatus: ProcessingStatus) {
    return MeetingModel.findByIdAndUpdate(id, { processingStatus }, { new: true });
  }
}
```

---

## 8. Authentication & Authorization

### 8.1 JWT strategy
* **Access token:** 15-minute expiry, signed HS256, carries `{sub: userId, role}`. Sent as `Authorization: Bearer <token>`.
* **Refresh token:** 7-day expiry, stored hashed in the `RefreshToken` collection so it can be revoked server-side (not a pure stateless refresh); rotated on every use (old token revoked, new one issued) to limit replay risk.
* `POST /api/auth/refresh` exchanges a valid refresh token for a new access/refresh pair; a revoked or expired refresh token returns 401 and forces re-login.
* Passwords hashed with bcrypt (cost factor 12); never logged, never returned in any response body, never stored in plaintext.

### 8.2 Role-Based Access Control
Three roles, exactly as scoped in the architecture document: `employee`, `reviewer`, `admin`. Every mutating route declares its allowed roles explicitly in the route definition — there is no implicit default-allow.

| Role | Can do | Cannot do |
| :--- | :--- | :--- |
| **employee** | View meetings they're an attendee of; view/update their own assigned tasks; trigger their own notification preferences. | Lock/export a meeting review; view meetings they aren't attending; manage other users. |
| **reviewer** | Everything employee can, plus: `PATCH /review` (edit/lock), `GET /export`, re-trigger AI orchestration on a failed stage. | Manage users or roles. |
| **admin** | Everything above, plus: user management, viewing AuditLog, org-wide meeting visibility. | — (superset) |

### 8.3 Middleware implementation

```typescript
// middleware/rbac.middleware.ts
export const rbac = (...allowed: Role[]) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'UNAUTHENTICATED'));
    if (!allowed.includes(req.user.role)) return next(new ApiError(403, 'FORBIDDEN'));
    next();
  };

// routes/meeting.routes.ts
router.patch('/:id/review', auth, rbac('reviewer','admin'), validate(reviewSchema), meetingController.review);
```

---

## 9. REST API Design — Public Endpoints

All external-facing endpoints live on the Core Backend. This table extends the architecture document's Section 5 with every field the Frontend Plan's Section 6 already expects — including its two proposed contract additions (`processingStatus` and an aggregate `/summary` endpoint), both accepted and implemented here.

| Method & Path | Auth / Roles | Purpose |
| :--- | :--- | :--- |
| `POST /api/auth/register` | public | Create a user account. |
| `POST /api/auth/login` | public | Authenticate; returns `{ token, refreshToken, user }`. |
| `POST /api/auth/refresh` | public (valid refresh token) | Rotate access/refresh token pair. |
| `GET /api/auth/me` | any authenticated role | Session bootstrap on app load. |
| `POST /api/meetings` | employee+ | Create a meeting record. |
| `GET /api/meetings` | employee+ | Paginated list, filterable by status. |
| `GET /api/meetings/:id` | attendee or admin | Full meeting header + `processingStatus`. |
| `GET /api/meetings/:id/summary` | attendee or admin | Aggregate transcript+mom+decisions+deadlines+score in one payload (initial paint only). |
| `POST /api/meetings/:id/audio` | reviewer/admin (multipart) | Upload audio; triggers the AI orchestration chain (Section 10). |
| `GET /api/meetings/:id/transcript` | attendee or admin | Diarized transcript + talk-time totals. |
| `GET /api/meetings/:id/mom` | attendee or admin | Structured MOM. |
| `GET /api/meetings/:id/decisions` | attendee or admin | Decision log with reasoning + source spans. |
| `GET /api/meetings/:id/deadlines` | attendee or admin | Normalized deadline list. |
| `GET /api/meetings/:id/score` | attendee or admin | Effectiveness Score + breakdown (Redis-cached, 60s). |
| `PATCH /api/meetings/:id/review` | reviewer/admin | Save/lock reviewer edits; diffed and version-stamped. |
| `GET /api/meetings/:id/export?format=` | reviewer/admin | Generate/return .docx or .pdf. |
| `GET /api/tasks?meetingId=` | attendee or admin | Ranked, skill-matched tasks for a meeting. |
| `PATCH /api/tasks/:id` | assignee, reviewer or admin | Update task status. |
| `POST /api/tasks/:id/notify` | reviewer/admin | Send a deadline reminder immediately. |
| `WS /ws/captions/:meetingId` | JWT in handshake | Live caption + speaker-tag events. |
| `GET /api/health` | public | Liveness/readiness probe. |
| `GET /api/docs` | public | Swagger UI. |

### 9.1 Example payloads

#### `POST /api/auth/login`
```json
// Request
{ 
  "email": "priya@meetsync.dev", 
  "password": "•••••••" 
}

// Response 200
{
  "token": "eyJhbGciOi...",
  "refreshToken": "8f2c1a...",
  "user": { 
    "id": "662f...", 
    "name": "Priya", 
    "role": "reviewer" 
  }
}
```

#### `PATCH /api/meetings/:id/review`
```json
// Request
{
  "edits": [
    { "field": "mom.summary", "newValue": "..." },
    { "field": "mom.keyPoints", "op": "append", "newValue": "Also agreed to revisit pricing" }
  ],
  "lock": true
}

// Response 200
{
  "meetingId": "662f...",
  "version": 3,
  "diff": [
    { "origin": "manual", "field": "mom.keyPoints", "newValue": "Also agreed to revisit pricing" }
  ],
  "locked": true
}
```

---

## 10. Communication with AI Microservices — Contracts, Retries & Error Handling

These six endpoints, exactly as specified in Section 4 of the Student 1 and Student 2 Microservices Plans, are the entire contract between Backend and the AI layer. Backend is the only caller of either service; neither AI service ever talks to the other directly, and neither writes to MongoDB — Backend persists everything.

| Endpoint | Owner | Called from |
| :--- | :--- | :--- |
| `POST /internal/ai/transcribe` | AI-1 :8001 | `aiOrchestration.service.ts`, on audio upload |
| `POST /internal/ai/mom` | AI-1 :8001 | after transcript persists |
| `POST /internal/ai/deadlines` | AI-1 :8001 | after transcript persists (parallel with mom) |
| `POST /internal/ai/decisions` | AI-2 :8002 | after transcript persists (parallel with mom/deadlines) |
| `POST /internal/ai/skill-match` | AI-2 :8002 | once per `mom.draft_action_items` entry |
| `POST /internal/ai/effectiveness-score` | AI-2 :8002 | once decisions + mom + talk-time are all persisted |

### 10.1 Orchestration sequence

```
Client        Backend                 AI-1 (speech)         AI-2 (decision)      MongoDB
  │              │                          │                      │                │
  │ POST audio   │                          │                      │                │
  ├─────────────▶│                          │                      │                │
  │              │ POST /transcribe         │                      │                │
  │              ├─────────────────────────▶│                      │                │
  │              │◀── segments ─────────────┤                      │                │
  │              ├──────────────────────────┼──────────────────────┼── persist ────▶│
  │              │                          │                      │   Transcript   │
  │              │ POST /mom                │                      │                │
  │              ├─────────────────────────▶│                      │                │
  │              │ POST /deadlines          │                      │                │
  │              ├─────────────────────────▶│                      │                │
  │              │ POST /decisions          │                      │                │
  │              ├──────────────────────────┼─────────────────────▶│                │
  │              │◀── mom ──────────────────┤                      │                │
  │              │◀── deadlines ────────────┤                      │                │
  │              │◀── decisions ────────────┼──────────────────────┤                │
  │              ├──────────────────────────┼──────────────────────┼── persist ────▶│
  │              │                          │                      │   Mom/Dead/Dec │
  │              │ for each draft_action_item:                     │                │
  │              │   POST /skill-match      │                      │                │
  │              ├──────────────────────────┼─────────────────────▶│                │
  │              │◀── ranked_candidates ────┼──────────────────────┤                │
  │              ├──────────────────────────┼──────────────────────┼── persist ────▶│
  │              │                          │                      │   Tasks        │
  │              │ POST /effectiveness-score│                      │                │
  │              │ (agenda, key_points,     │                      │                │
  │              │  decision_count,         │                      │                │
  │              │  talk_time_by_speaker)   │                      │                │
  │              ├──────────────────────────┼─────────────────────▶│                │
  │              │◀── score, breakdown ─────┼──────────────────────┤                │
  │              ├──────────────────────────┼──────────────────────┼── persist ────▶│
  │              │                          │                      │   Score        │
  │◀── 202 ──────┤                          │                      │   status=ready │
```
*Figure 10.1 — Full orchestration sequence.*

### 10.2 Request/response contract (verbatim from Student 1 & Student 2 Section 4)

#### `POST /internal/ai/transcribe` (AI-1)
```json
// Request
{ 
  "meeting_id": "string", 
  "audio_url": "string", 
  "language_hint": "en" 
}

// Response 200
{
  "meeting_id": "string", 
  "duration_sec": 1423,
  "segments": [
    { "speaker": "SPEAKER_00", "start": 0.0, "end": 4.2, "text": "..." }
  ]
}
```

#### `POST /internal/ai/decisions` (AI-2)
```json
// Request
{ 
  "meeting_id": "string", 
  "segments": [ /* from AI-1 */ ] 
}

// Response 200
{
  "decisions": [
    { 
      "decision_text": "string", 
      "reasoning": "string",
      "source_span": { "start": 812.4, "end": 828.9 }, 
      "confidence": 0.91 
    }
  ]
}
```

*The remaining four endpoints (`/mom`, `/deadlines`, `/skill-match`, `/effectiveness-score`) are implemented Backend-side exactly as specified in Sections 4.2-4.3 of Student 1's plan and Sections 4.2-4.3 of Student 2's plan — see those documents for the full request/response bodies; they are not restated here to avoid a second source of truth drifting from the original.*

### 10.3 aiClient design — retries, timeouts, circuit breaker
* Two axios instances, one per service (AI-1 base URL, AI-2 base URL), each with its own timeout: 120s for `/transcribe` (long-running, per Student 1 Section 4.4's async-or-generous-timeout rule), 15s for every other call.
* `axios-retry`: 3 attempts, exponential backoff (300ms / 900ms / 2700ms), retrying only on network errors and 5xx — never on 4xx, since a 4xx means the request itself is malformed and retrying won't help.
* `opossum` circuit breaker per service: opens after 5 consecutive failures within 30s, half-opens after a 20s cooldown. While open, calls fail fast with `AI_SERVICE_UNAVAILABLE` instead of queuing behind a dead service.
* Every response is validated against a Zod schema mirroring the Student 1/2 contract before being persisted — a malformed AI response is caught and logged as `AI_SERVICE_INVALID_RESPONSE` rather than silently corrupting a MongoDB document.
* Partial-failure isolation: `/mom`, `/deadlines`, and `/decisions` are dispatched via `Promise.allSettled` — if AI-2's `/decisions` call fails, AI-1's `/mom` and `/deadlines` results are still persisted and rendered; a failed stage is retried in the background via the `aiRetryQueue` (Section 14) rather than failing the whole meeting.
* Every outbound call and its response is logged with the `meeting_id` and a correlation ID, so a failure during the demo can be traced to the exact AI call that failed.

```typescript
// integrations/ai/aiClient.ts
const speechClient = axios.create({ baseURL: env.AI1_URL, timeout: 15_000 });

axiosRetry(speechClient, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (e) => axiosRetry.isNetworkOrIdempotentRequestError(e) || (e.response?.status ?? 0) >= 500 
});

const speechBreaker = new CircuitBreaker(
  (path: string, body: unknown, opts?: { timeout?: number }) =>
    speechClient.post(path, body, { timeout: opts?.timeout }),
  { timeout: 120_000, errorThresholdPercentage: 50, resetTimeout: 20_000 }
);
```

---

## 11. WebSocket / Socket.IO Architecture

Live captioning is the single P1 feature requiring a persistent connection (per the architecture document's Section 4 and the P1 risk gate on Wed 19 Aug). Everything else stays request/response.

* **Namespace:** `/captions`. **Room-per-meeting:** clients join room `meeting:<id>` after a JWT-authenticated handshake (token passed in the socket.io auth payload, verified by `socketAuth.ts` middleware before the connection is accepted).
* **Server → client events:** `caption:segment` (`{speaker, start, end, text}`), `caption:status` (`{state: 'connecting'|'live'|'ended'}`), `caption:error` (`{code, message}`).
* Backend relays AI-1's faster-whisper streaming chunks (received over an internal streaming connection or short-poll, per Student 1's Section 7 Day-13/18 plan) straight into the room — Backend does no transcription itself.
* **Reconnection:** client-side capped exponential backoff (max 5 attempts, matching the Frontend Plan's Section 16 mitigation); server-side, a disconnected socket's room membership is cleared after 30s of no reconnect.
* **Horizontal-scale note (documented, not built for the hackathon):** `@socket.io/redis-adapter` is a one-line addition if the service is ever run on more than one instance — captured here so re-adding it later needs no restructuring.

```typescript
// sockets/captionNamespace.ts
captionNsp.use(socketAuth);

captionNsp.on('connection', (socket) => {
  const meetingId = socket.handshake.query.meetingId as string;
  socket.join(`meeting:${meetingId}`);
  socket.emit('caption:status', { state: 'connecting' });
});

// called by the AI-1 streaming relay
export function broadcastCaption(meetingId: string, segment: CaptionSegment) {
  io.of('/captions').to(`meeting:${meetingId}`).emit('caption:segment', segment);
}
```

---

## 12. Validation, Logging, Caching, Rate Limiting, Monitoring & Configuration

### 12.1 Validation
Every mutating route runs a Zod schema through the `validate` middleware before it reaches the controller; 422 with a field-level error array on failure. Schemas live in `validators/` and are the same schemas referenced when generating the OpenAPI spec, so validation logic and documentation never drift apart.

### 12.2 Logging
* Pino structured JSON logs in production; `pino-pretty` in development.
* `pino-http` assigns a request ID to every inbound request; the same ID is attached to any outbound AI-client call log line for full traceability.
* **Log levels:** `error` (unhandled exceptions, `AI_SERVICE_UNAVAILABLE`), `warn` (validation failures, retried AI calls), `info` (request completion, job completion), `debug` (AI request/response bodies — dev only, never in production to avoid logging transcript content).

### 12.3 Caching (Redis)
* `GET /api/meetings/:id/score` — 60s TTL, invalidated on a new effectiveness-score write.
* `GET /api/meetings` (list) — 15s TTL, invalidated on any create/update to reduce Dashboard polling load.
* AI-2 skill-embeddings for frequently-assigned employees may be cached to avoid recomputing on every skill-match call within the same session (optional, time-permitting).

### 12.4 Rate limiting

| Scope | Limit | Store |
| :--- | :--- | :--- |
| **Global `/api/*`** | 100 requests / minute / IP | Redis (`rate-limit-redis`) |
| **`POST /api/auth/login`** | 5 requests / minute / IP | Redis — brute-force protection |
| **`/internal/ai/*` proxy triggers** (audio upload, manual re-run) | 10 requests / minute / user | Redis — protects LLM API budget during repeated demo runs |

### 12.5 Monitoring
* `GET /api/health` — liveness probe (process up); `GET /api/health/ready` — readiness probe (MongoDB + Redis + both AI services reachable).
* `prom-client` exposes `GET /metrics` (request duration histogram, AI-call success/failure counters, queue depth) for a Prometheus/Grafana pass if time allows; otherwise the same counters are visible via structured logs.
* Optional Sentry DSN for uncaught-exception reporting during the staging/demo window.

### 12.6 Configuration management
All configuration is environment-variable driven and validated at process boot via a Zod schema in `config/env.ts` — the process refuses to start with a missing or malformed required variable, rather than failing on the first request that needs it.

```typescript
// config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development','test','staging','production']),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  AI1_URL: z.string().url(),
  AI2_URL: z.string().url(),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  CORS_ORIGIN: z.string(),
});

export const env = envSchema.parse(process.env); // throws & exits on boot if invalid
```

---

## 13. Error Handling Strategy

A single `ApiError` class and a single error-handling middleware are the only places an HTTP error status is decided — no route or service writes to `res` directly on failure.

| Error code | HTTP status | Meaning |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 422 | Zod schema failure; body includes a field-level errors array. |
| `UNAUTHENTICATED` | 401 | Missing/invalid/expired JWT. |
| `FORBIDDEN` | 403 | Valid JWT, insufficient role. |
| `NOT_FOUND` | 404 | Resource does not exist or the user cannot see it. |
| `CONFLICT` | 409 | e.g. attempting to edit a locked meeting. |
| `AI_SERVICE_TIMEOUT` | 504 | An AI call exceeded its timeout after retries. |
| `AI_SERVICE_UNAVAILABLE` | 503 | Circuit breaker open for that AI service. |
| `AI_SERVICE_INVALID_RESPONSE` | 502 | AI response failed contract-schema validation. |
| `RATE_LIMITED` | 429 | Section 12.4 limits exceeded. |
| `INTERNAL_ERROR` | 500 | Unexpected/unhandled exception — logged with full stack, never leaked to the client. |

#### Standard error envelope
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_TIMEOUT",
    "message": "The speech-intelligence-service did not respond in time.",
    "details": { 
      "meetingId": "662f...", 
      "endpoint": "/internal/ai/transcribe" 
    }
  }
}
```

---

## 14. File Upload & Storage Architecture

* Multer memory storage, not disk — audio is held in memory only long enough to stream it to AI-1's `/internal/ai/transcribe`; Backend does not persist raw audio as its default behavior, per the architecture document's Section 10 retention rule.
* **Allowlist:** `audio/wav`, `audio/mpeg`, `audio/mp4`, `audio/x-m4a`; hard cap 100 MB / ~60 minutes, matching the AI-1 CPU-only demo constraint documented in Student 1's Section 13.
* **Optional GridFS storage (P1, opt-in)** for teams that want a 'replay original audio' convenience feature — if enabled, a TTL index auto-purges the GridFS bucket 48 hours after transcript generation, keeping the sensitive-audio retention rule enforced automatically rather than by manual cleanup.
* Export files (.docx/.pdf) are generated on demand by `exportGenerationQueue` and streamed back in the response, not persisted server-side — regenerating from the locked `ReviewVersion` is cheap and avoids managing a growing file store.

---

## 15. Security Best Practices

### 15.1 OWASP-aligned controls

| OWASP concern | Backend control |
| :--- | :--- |
| **Broken access control** | RBAC middleware on every mutating route; ownership checks (attendee/organizer) on every meeting-scoped GET. |
| **Injection (NoSQL)** | `express-mongo-sanitize` strips `$/.` operators from `req.body/query/params` before they reach Mongoose. |
| **Cryptographic failures** | `bcrypt` for passwords; HTTPS enforced at the platform level; JWT secrets ≥32 chars, never committed. |
| **Insecure design** | Layered architecture (Section 4.2) keeps business rules out of routes/controllers, reducing ad-hoc security holes. |
| **Security misconfiguration** | Helmet default headers; CORS allowlist (no wildcard origin in staging/production); verbose errors disabled outside development. |
| **Vulnerable components** | Dependabot/npm audit in CI; pinned versions in `package-lock.json`. |
| **Authentication failures** | Rate-limited login (Section 12.4); refresh-token rotation with server-side revocation. |
| **Data integrity failures** | Zod validation on every input; AI-response schema validation before persistence (Section 10.3). |
| **Logging/monitoring failures** | Structured request/error logging (Section 12.2); health/readiness probes. |
| **SSRF** | AI-client base URLs are fixed env-configured values, never built from user input. |

### 15.2 Additional controls
* `hpp` — HTTP parameter pollution protection on query strings.
* **Prompt-injection mitigation:** transcript content is treated as untrusted input and never interpolated unescaped into an AI prompt built server-side — this is enforced at the AI microservice layer per the architecture document, but Backend also strips control characters from any user-supplied text (meeting titles, agenda items) before it reaches an AI call.
* **Secrets:** JWT secrets, MongoDB URI, Redis URL, SMTP credentials live only in environment variables / the hosting platform's secret manager — `.env` is git-ignored, `.env.example` is committed with placeholder values only.
* **CORS:** explicit allowlist of the Vercel frontend origin(s) per environment; `credentials: true` only for the exact allowlisted origin, never `*`.

---

## 16. Background Jobs & Queues

Redis-backed BullMQ handles everything that shouldn't block a request/response cycle.

| Queue | Trigger | Job |
| :--- | :--- | :--- |
| `deadlineReminderQueue` | Repeatable, daily at 08:00 | Scans Deadline documents due within 48h, enqueues one `notificationQueue` job per assignee. |
| `notificationQueue` | Enqueued by the reminder scan or `POST /api/tasks/:id/notify` | Sends the email via Nodemailer; retries 3x with backoff on SMTP failure. |
| `exportGenerationQueue` | `GET /api/meetings/:id/export` | Runs the docx/Puppeteer generation off the request thread for large meetings; the route polls/awaits the job result. |
| `aiRetryQueue` | A `Promise.allSettled` failure in Section 10.3's orchestration | Re-attempts the failed AI call in the background and updates the record when it eventually succeeds. |

---

## 17. Environment Configuration

```bash
# backend/.env.example
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meetsync
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me-32-chars-minimum
JWT_REFRESH_SECRET=change-me-32-chars-minimum
AI1_URL=http://ai-service:8001
AI2_URL=http://ai-service:8002
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=xxxx
SMTP_PASS=xxxx
CORS_ORIGIN=http://localhost:5173
```
*Staging and production use the identical variable names with real values injected by Render/Railway's secret manager — never a second, diverging `.env` format.*

---

## 18. Testing Strategy

| Test type | Tool | Focus |
| :--- | :--- | :--- |
| **Unit** | Jest | Services with a mocked repository/aiClient — auth logic, RBAC checks, review-diff logic, orchestration branching. |
| **Integration / API** | Jest + Supertest + mongodb-memory-server | Full Express app against an in-memory MongoDB — every route, real middleware pipeline, no external network calls (AI client mocked via nock). |
| **Contract** | Fixture JSON from Student 1 & Student 2's Section 4 shapes, run in CI | Confirms aiClient's Zod validators accept the real contract shape and reject a deliberately malformed one. |
| **Manual / QA** | Postman collection (also run headlessly via Newman in CI) | End-to-end smoke test of the full P0 chain against a fixture recording. |
| **Load (light)** | autocannon or a simple script, 2-3 concurrent Socket.io clients | Confirms the live-caption channel doesn't degrade with a couple of simultaneous demo viewers. |

*Coverage target: ~80% on `services/`, `middleware/`, and `integrations/ai/` — the layers most likely to silently break; controllers and routes are covered indirectly through the integration suite.*

---

## 19. CI/CD & Deployment

### 19.1 CI pipeline (GitHub Actions)
1. **Lint** — ESLint + Prettier check.
2. **Typecheck** — `tsc --noEmit`.
3. **Unit tests** — Jest (services/middleware).
4. **Integration tests** — Jest + Supertest against `mongodb-memory-server` and a Redis service container.
5. **Build** — `tsc` build to `dist/`.
6. **Docker build** — multi-stage Dockerfile builds successfully (does not push on PR, only on merge to main).

*`main` is protected; merge is blocked until every step above is green (matching Section 5 of the Project Execution Plan).*

### 19.2 Deployment
* **Local dev parity:** `docker-compose up` brings up backend + ai-service (both routers) + mongo + redis with one command.
* Backend deployed to Render/Railway on merge to main; MongoDB Atlas free-tier cluster shared across staging and demo.
* **Health check** (`GET /api/health/ready`) configured as the platform's readiness probe so a cold-start deploy isn't marked live before MongoDB/Redis/both AI services are actually reachable.
* **Demo-day fallback:** the full docker-compose stack kept rehearsed and ready locally in case free-tier hosting has a cold start or outage during judging.

```dockerfile
# Dockerfile (multi-stage)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
CMD ["node", "dist/server.js"]
```

---

## 20. Git Workflow & Branching Strategy

* Trunk-based development off `main`, exactly as Section 5 of the Project Execution Plan defines; `main` is protected — PR + 1 review + green CI to merge.
* **Branch naming:** `be-feature/<short-description>` (e.g. `be-feature/jwt-auth`, `be-feature/ai-orchestration`, `be-feature/socket-captions`).
* Small, same-day PRs preferred over large ones; `backend/src/`'s layered structure (Section 4.2) already keeps most changes non-overlapping.
* Conventional Commits (`feat(backend): ...`, `fix(backend): ...`, `test(backend): ...`, `docs(backend): ...`) squash-merged to main.
* Any PR that changes the `/internal/ai/*` or `/api/*` contract is tagged for review by Member D (Integration & QA Lead, per Section 5 of the execution plan) and announced in the shared channel before merge, not discovered in review.
* Rebase (or merge main in) at the start of each day, before stand-up.

---

## 21. Coding Standards & Best Practices

* ESLint (`typescript-eslint`, `airbnb-base` ruleset) + Prettier, enforced in CI — not just pre-commit.
* **Thin controllers, fat services:** a controller method should be readable as roughly *parse → call service → respond*, in 5-10 lines.
* Services never import Express types (`Request`/`Response`) — every service function is callable and testable from a plain script or a test, with no HTTP context.
* Only the repository layer imports a Mongoose model — this is enforced by an ESLint import-boundary rule, not just convention.
* Async/await only; no `.then()` chains. Every controller is wrapped in a shared `asyncHandler` so a rejected promise reaches `errorHandler` automatically.
* Every non-trivial exported function carries a one-line TSDoc comment stating what it does and any non-obvious constraint (e.g. *'throws AI_SERVICE_UNAVAILABLE if the circuit breaker is open'*).
* No `any` in exported function signatures; internal implementation details may use it sparingly with a comment explaining why.
* Consistent response shape via `ApiResponse`/`ApiError` helpers everywhere — no route hand-rolls its own JSON shape.

---

## 22. Required Tools, Libraries, Postman & Docker Setup

### 22.1 Accounts & tools
* GitHub org/repo with branch protection on `main` (shared with the whole team).
* MongoDB Atlas free-tier cluster; Redis (local via docker-compose, or a free-tier Upstash/Redis Cloud instance for staging).
* Docker Desktop; Render or Railway account; Postman or Insomnia workspace shared with the whole team.
* SMTP credentials (Mailtrap for dev, SendGrid free tier for staging/demo).

### 22.2 Recommended VS Code extensions
* ESLint, Prettier — Code formatter
* MongoDB for VS Code
* Docker
* GitLens
* Error Lens
* DotENV
* Thunder Client (optional lightweight alternative to Postman for quick checks)

### 22.3 Postman collection
`postman/MeetSync-Backend.postman_collection.json` ships with a folder per module (Auth, Meetings, Audio/AI Orchestration, Tasks, Export, Notifications) and a companion environment file with `{{baseUrl}}`, `{{accessToken}}` variables auto-populated by a login pre-request script. The same collection is run headlessly via Newman in CI (Section 19.1) so it never drifts from what the API actually returns.

### 22.4 Key package.json dependencies

```json
{
  "dependencies": {
    "express": "^4.19.0",
    "mongoose": "^8.3.0",
    "ioredis": "^5.4.0",
    "bullmq": "^5.7.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.23.0",
    "socket.io": "^4.7.0",
    "@socket.io/redis-adapter": "^8.3.0",
    "axios": "^1.6.0",
    "axios-retry": "^4.0.0",
    "opossum": "^8.1.0",
    "multer": "^1.4.5-lts.1",
    "docx": "^8.5.0",
    "puppeteer": "^22.6.0",
    "nodemailer": "^6.9.0",
    "pino": "^8.20.0",
    "pino-http": "^9.0.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-mongo-sanitize": "^2.2.0",
    "hpp": "^0.2.3",
    "express-rate-limit": "^7.2.0",
    "rate-limit-redis": "^4.2.0",
    "swagger-jsdoc": "^6.2.0",
    "swagger-ui-express": "^5.0.0",
    "prom-client": "^15.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "ts-node-dev": "^2.0.0",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "mongodb-memory-server": "^9.1.0",
    "nock": "^13.5.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 23. 30-Day Day-Wise Implementation Plan (Synchronized with All 4 Members)

This calendar is identical to the one locked in the Project Execution Plan (Mon 3 - Fri 28 Aug, buffer Sat 29-Sun 30, Demo Day Mon 31), and to the calendar the Frontend, Student 1, and Student 2 plans already build against. Each entry below is Member A's (Backend's) day, stated against the folder structure and contracts defined above, with explicit dependencies on Frontend, AI Microservice 1, and AI Microservice 2, and the integration checkpoint and expected output for that day.

### 23.1 Sprint 1 — Foundation (Mon 3 – Fri 7 Aug)
**Sprint goal (Backend slice):** all 3 services scaffolded, MongoDB connected, JWT auth + Meeting CRUD live, Node↔Python API contract locked by Tuesday.

| Day / Date | Backend (Member A) Tasks | Dependencies (FE / AI-Svc-1 / AI-Svc-2) | Integration Checkpoint | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| **Mon 3 Aug** | Create monorepo (`backend/`, `frontend/`, `ai-service/`, `docker-compose.yml`, `.github/workflows/`); scaffold `backend/` with Node 20 + TypeScript + Express; ESLint/Prettier/tsconfig; `GET /api/health` returns `{status:'ok'}`. | FE: none yet.<br>AI-1: none yet.<br>AI-2: none yet. | **Day-0 kickoff** (10:00-12:00, all 4) — agree repo layout & port plan (Backend 5000, AI-1 8001, AI-2 8002, FE 5173). | Backend boots locally; `/api/health` returns 200 inside docker-compose. |
| **Tue 4 Aug** | Mongoose connection + `config/env.ts` (Zod-validated env); DRAFT and CIRCULATE the Node↔Python API contract v1 (Section 9 of this document) covering all 6 `/internal/ai/*` endpoints, synced with Student 1 & Student 2's Section 4 shapes; scaffold User model + auth route stubs. | FE: needs contract v1 draft by EOD to unblock LoginPage/types.ts.<br>AI-1: needs contract locked before building real /transcribe, /mom, /deadlines.<br>AI-2: needs contract locked before building /decisions, /skill-match, /effectiveness-score. | **HARD MILESTONE** — all-hands contract-lock session, EOD Tue 4 Aug. | `/docs/api-contract.md` v1 committed and shared; User schema created. |
| **Wed 5 Aug** | Implement JWT auth: `POST /api/auth/register`, `/login`, `/me`; bcrypt password hashing; access token (15 min) + refresh token (7 days) rotation; RBAC middleware (employee / reviewer / admin). | FE: builds LoginPage/RegisterPage against these routes today.<br>AI-1 / AI-2: not blocking. | Pairing session with Member C to confirm `{token,user}` login response shape matches types.ts. | Auth endpoints verified in Postman; JWT + RBAC middleware unit-tested. |
| **Thu 6 Aug** | Meeting CRUD: `POST/GET /api/meetings`, `GET /api/meetings/:id`; Meeting Mongoose schema incl. `processingStatus` enum (`queued\|transcribing\|generating-insights\|ready\|failed`); Zod validation middleware; pagination on list. | FE: wires Dashboard list/create against these routes.<br>AI-1 / AI-2: not blocking. | None blocking — async Slack check-in only. | Meeting CRUD passes Postman collection v1; `processingStatus` field live for FE's Section 6.5 request. |
| **Fri 7 Aug** | Scaffold `integrations/ai/aiClient.ts` (axios instances for AI-1:8001 / AI-2:8002, timeouts, base retry config) built against MOCKED fixture responses shaped exactly per the locked contract; docker-compose validated with node+mongo+redis. | FE: demos Dashboard CRUD live against real backend.<br>AI-1 / AI-2: still skeleton FastAPI apps (per their Day 1-2) — Backend codes against contract fixtures, not live calls yet. | **Weekly Sprint Review**, 4:00-5:00 PM — demo auth + Dashboard CRUD live. | **WEEK 1 MILESTONE:** auth + Meeting CRUD live; aiClient stubbed against contract fixtures; API contract locked. |

---

### 23.2 Sprint 2 — Core AI Pipeline, P0 (Mon 10 – Fri 14 Aug)
**Sprint goal (Backend slice):** the full audio → transcript → MOM → decisions → deadlines → skill-matched tasks → effectiveness-score chain orchestrated end-to-end and resilient to partial AI failure.

| Day / Date | Backend (Member A) Tasks | Dependencies (FE / AI-Svc-1 / AI-Svc-2) | Integration Checkpoint | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| **Mon 10 Aug** | Implement `POST /api/meetings/:id/audio` (Multer multipart, streamed to AI-1); orchestration service calls REAL `POST /internal/ai/transcribe`; persist Transcript document on success; flip `processingStatus` to transcribing then generating-insights. | FE: builds TranscriptPanel against `GET /api/meetings/:id/transcript`.<br>AI-1: must have `/internal/ai/transcribe` live on a sample clip (their Week-1 milestone).<br>AI-2: not yet called this stage. | Confirm transcript segment field names (`speaker`/`start`/`end`/`text`) are byte-identical to Student 1's Section 4.1 shape — zero client-side remapping on either side. | Audio upload → real diarized transcript persisted end-to-end on a fixture recording. |
| **Tue 11 Aug** | Orchestrate `POST /internal/ai/mom` and `POST /internal/ai/decisions` in parallel (`Promise.allSettled`) once the transcript persists; persist Mom + Decision documents; expose `GET /api/meetings/:id/mom` and `/decisions`. | FE: wires MomPanel + DecisionLogPanel.<br>AI-1: ships `/internal/ai/mom`.<br>AI-2: ships `/internal/ai/decisions`. | **Mid-week Integration Checkpoint** — confirm processingStatus transitions and that a failed AI-2 call does not block AI-1's MOM result from rendering. | MOM and decision-log endpoints returning real, AI-generated, schema-valid data. |
| **Wed 12 Aug** | Orchestrate `POST /internal/ai/deadlines`; extend Task model; for each `mom.draft_action_items` entry call `POST /internal/ai/skill-match` and persist ranked candidates; expose `GET /api/meetings/:id/deadlines` and `GET /api/tasks?meetingId=`. | FE: wires DeadlineTimeline + TaskListPanel.<br>AI-1: ships `/internal/ai/deadlines`.<br>AI-2: ships `/internal/ai/skill-match`. | Field-shape confirmation only — no blocking session. | Normalized deadlines and ranked, justified task assignments persisted and queryable. |
| **Thu 13 Aug** | Orchestrate `POST /internal/ai/effectiveness-score` once decisions + `mom.key_points` + `talk_time_by_speaker` are all available; expose `GET /api/meetings/:id/score`; join Member D's full P0 end-to-end test. | FE: joins the same E2E test session.<br>AI-1: talk-time totals already available from Transcript.<br>AI-2: ships `/internal/ai/effectiveness-score`. | Member D's full P0 end-to-end test on the fixture recording — every backend endpoint checked for zero type/console errors. | Full P0 chain (audio → transcript → MOM → decisions → deadlines → tasks → score) working end-to-end via API. |
| **Fri 14 Aug** | Add `axios-retry` (exponential backoff, 3 attempts) + `opossum` circuit breaker to all 6 internal AI calls; standardize AI-service error envelope; verify a down AI-2 never blocks AI-1's already-persisted results. | FE: none blocking.<br>AI-1 / AI-2: none blocking. | **Weekly Sprint Review** — demo the full P0 pipeline live (Postman + UI). | **WEEK 2 MILESTONE:** AI orchestration resilient to partial failure; full P0 pipeline demoable end-to-end. |

---

### 23.3 Sprint 3 — Review, Export & P1 Stretch (Mon 17 – Fri 21 Aug)
**Sprint goal (Backend slice):** review/lock/export shipped, notifications live, and — gated by the Wed 19 Aug Go/No-Go decision — live captioning or a full security hardening pass.

| Day / Date | Backend (Member A) Tasks | Dependencies (FE / AI-Svc-1 / AI-Svc-2) | Integration Checkpoint | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| **Mon 17 Aug** | Build `PATCH /api/meetings/:id/review` — diff engine tagging AI-drafted vs. manually-added content, version-stamped ReviewVersion documents, lock flag that freezes further edits. | FE: builds ReviewEditorPage against this route today.<br>AI-1 / AI-2: not involved in review/export. | Contract-first pairing session with Member C on the exact diff/version JSON shape before either side commits code. | Review save/lock endpoint verified in Postman with sample AI-vs-manual diffs. |
| **Tue 18 Aug** | Build `GET /api/meetings/:id/export?format=docx\|pdf` using docx (npm) and Puppeteer, offloaded to an `exportGenerationQueue` (BullMQ) worker so large meetings don't block the request thread; embed the manually-added audit markers in the export. | FE: wires ExportButtons/file download.<br>AI-1 / AI-2: not involved. | Confirm `Content-Type` / `Content-Disposition` download headers with Member C. | Valid, correctly formatted .docx and .pdf generated end-to-end from a locked review. |
| **Wed 19 Aug — GO/NO-GO GATE** | Attend the 15-min gate.<br>**IF GO:** build the Socket.io `/ws/captions/:meetingId` namespace — JWT-authenticated handshake, one room per meetingId, relay of AI-1's faster-whisper streaming chunks as `caption:segment` / `caption:status` / `caption:error` events.<br>**IF NO-GO:** run a security hardening pass (helmet, CORS allowlist, express-mongo-sanitize, hpp) across every route instead. | FE: builds LiveCaptionPanel only if GO.<br>AI-1: must have the faster-whisper streaming path ready if GO.<br>AI-2: not involved. | **9:30 AM stand-up Go/No-Go decision** — determines the rest of the week's backend scope for this feature. | **EITHER:** live-caption WebSocket channel working end-to-end, **OR:** a completed OWASP hardening pass. |
| **Thu 20 Aug** | Nodemailer email-notification service + `POST /api/tasks/:id/notify`; BullMQ `deadlineReminderQueue` (daily repeatable job scanning upcoming Deadline documents, auto-enqueues reminder emails); verify decision/MOM responses pass `source_span` through untouched for FE's Explainable-AI panel. | FE: builds NotificationSettingsPage + wires the 'View Source' jump.<br>AI-1 / AI-2: not involved (`source_span` already produced by AI-2's decisions payload). | Mid-week code review with Member D on the notification + export PRs. | Test email reminders sending on sample deadline data; `source_span` verified reaching the UI unmodified. |
| **Fri 21 Aug** | Redis-cache `GET /api/meetings/:id/score` (60s TTL) and the meeting list; polish error responses across the review/export/notification routes; Sprint 3 demo. | FE: none blocking.<br>AI-1 / AI-2: none blocking. | **Weekly Sprint Review** — demo the full P0 + P1 (as scoped) product end-to-end. | **WEEK 3 MILESTONE:** Review → Export flow, notifications, and (conditionally) live captions shipped. |

---

### 23.4 Sprint 4 — Hardening, Testing & Deployment (Mon 24 – Fri 28 Aug)
**Sprint goal (Backend slice):** OWASP hardening complete, test coverage at target, CI green, staging deployment stable, Section 24 checklist signed off.

| Day / Date | Backend (Member A) Tasks | Dependencies (FE / AI-Svc-1 / AI-Svc-2) | Integration Checkpoint | Expected Output |
| :--- | :--- | :--- | :--- | :--- |
| **Mon 24 Aug** | Full OWASP-aligned security pass: Helmet headers, CORS allowlist, express-mongo-sanitize, hpp, rate limiting audit (auth + `/internal/ai/*` proxy routes), input-validation coverage audit on every mutating route; secrets audit (no keys in git history). | FE / AI-1 / AI-2: participate in the shared smoke test only. | Full-stack smoke test with all four members. | Security checklist (Section 15) fully green; smoke test passing. |
| **Tue 25 Aug** | Bring Jest unit + Supertest integration coverage to target (~80% on services/middleware/aiClient); finalize GitHub Actions CI (lint → typecheck → unit → integration → docker build); finalize the Postman collection and wire it into CI via Newman. | FE / AI-1 / AI-2: none blocking. | None blocking. | CI green on every PR; Postman/Newman collection runnable headlessly in CI. |
| **Wed 26 Aug** | Finalize multi-stage Dockerfile; verify full docker-compose (node + ai-1 + ai-2 + mongo + redis) starts with one command; deploy backend to Render/Railway staging; publish staging env vars. | FE: needs the staging URL today to set VITE_API_URL / VITE_WS_URL.<br>AI-1 / AI-2: deploy alongside on the same staging pass. | Member D stands up the shared staging environment today — Backend points it at the deployed AI services. | Backend reachable on a public staging URL; one-command local docker-compose stack confirmed. |
| **Thu 27 Aug — SIGN-OFF** | Fix bugs surfaced on staging overnight; walk the Section 24 backend checklist line by line. | FE / AI-1 / AI-2: sign off their own sections in the same review. | **60-minute Checklist Sign-off Review** — Backend formally signs off its section. | Backend checklist fully green; no open P0/P1 backend defects. |
| **Fri 28 Aug** | Final polish; feature-freeze `be-feature/*` branches (merge or explicitly defer to the v2 backlog); light load test on the Socket.io caption channel with 2-3 simulated concurrent viewers. | FE / AI-1 / AI-2: none blocking. | Sprint Review + retrospective; final-week planning. | **WEEK 4 MILESTONE:** backend feature-frozen, staging stable and deployed. |

---

### 23.5 Buffer & Demo Day

| Day / Date | Backend activity |
| :--- | :--- |
| **Sat 29 - Sun 30 Aug** | Absorb any red items from Thursday's sign-off; otherwise verify staging uptime and rehearse the demo script's backend-visible steps (audio upload, processing status, export download) once more against staging, not localhost. |
| **Mon 31 Aug - Demo Day** | On-call for last-minute backend issues during the morning rehearsal; confirm the local docker-compose fallback stack works fully offline; final `GET /api/health` check on staging immediately before presenting. |

---

## 24. Weekly Milestones & Final Checklist

| Week | Backend deliverable | Exit criteria |
| :--- | :--- | :--- |
| **1 — Foundation** | Auth + Meeting CRUD live; API contract locked; aiClient stubbed against fixtures. | Login + Dashboard CRUD work live against the real backend. |
| **2 — Core AI Pipeline** | Full P0 orchestration chain (audio → score) working end-to-end. | Every P0 endpoint returns real, schema-valid data on a fixture recording. |
| **3 — Review, Export & P1** | Review/lock/export, notifications, and (conditionally) live captions shipped. | A reviewer can lock a meeting and download a correctly formatted .docx and .pdf. |
| **4 — Hardening & Deployment** | Security hardened, tests at target, staging deployed. | Section 24 checklist signed off; staging reachable and stable. |

### 24.1 Final Implementation Checklist

#### Setup
- [ ] Monorepo `backend/` scaffolded with the Section 6 folder structure
- [ ] docker-compose running node + ai-service(s) + mongo + redis locally
- [ ] API contract (Section 9-10) agreed and shared with all 4 members
- [ ] CI pipeline green (lint, typecheck, unit, integration, build)

#### Core backend
- [ ] JWT auth + refresh-token rotation + RBAC
- [ ] Meeting/task CRUD complete with pagination
- [ ] aiClient wired with retries, timeouts, and a circuit breaker per service
- [ ] Orchestration resilient to a single AI service's failure (`Promise.allSettled` + `aiRetryQueue`)

#### Review, export & real-time
- [ ] `PATCH /review` diffs and version-stamps AI-vs-manual content correctly
- [ ] .docx export generated correctly; .pdf export generated correctly
- [ ] Socket.io `/captions` namespace authenticated, room-scoped, and reconnect-safe (if shipped)
- [ ] Email notifications sending on test deadline data

#### Security & platform
- [ ] Helmet/CORS/mongo-sanitize/hpp/rate-limiting in place per Section 15
- [ ] Secrets only in environment variables, verified absent from git history
- [ ] Health/readiness probes live; structured logging in place
- [ ] Redis caching + BullMQ queues operational

#### Testing & deployment
- [ ] Unit + integration tests passing in CI at ~80% coverage on services/middleware/AI-client
- [ ] Postman/Newman collection green in CI
- [ ] Staging deployment reachable and stable on Render/Railway
- [ ] Local docker-compose fallback stack rehearsed as a backup

---

## 25. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **API contract drifts between Backend and either AI service mid-build** | Section 9-10 is treated as the single source of truth; any field change is announced in the shared channel before the PR is opened, per Section 20. |
| **An AI service is down or slow during a live demo** | Circuit breaker fails fast with a clear error (Section 10.3); orchestration persists whatever succeeded rather than failing the whole meeting; a pre-tested fixture recording is rehearsed as the primary demo path. |
| **LLM API rate limits or cost overrun from repeated demo runs** | Rate limiting on AI-proxy routes (Section 12.4); Redis caching of the effectiveness score; the team rehearses around one recorded fixture rather than re-running live transcription repeatedly. |
| **Live-caption Socket.io channel unstable on demo wifi** | Kept strictly P1 behind the Wed 19 Aug Go/No-Go gate; capped-backoff reconnect; a pre-recorded fallback clip is ready to substitute. |
| **Sensitive audio/transcript data mishandled** | Multer memory storage (no default disk persistence); optional GridFS retention is TTL-bound to 48 hours (Section 14). |
| **Feature scope creep back toward cut features under deadline pressure** | Section 2's frozen P0/P1 scope (per the architecture document) is treated as locked after Day 1 planning; any addition requires an explicit team decision. |

---

## 26. Closing Note

This document keeps Backend's public surface identical to what the Frontend Plan already builds against, and its internal AI contract identical to what Student 1 and Student 2 already ship — the only changes from the original architecture document are additive (TypeScript, the layered Controller/Service/Repository split, and Redis-backed resilience) and none of them require Frontend, AI-1, or AI-2 to change anything on their side. That is the point: a backend that gets more production-ready without moving anyone else's finish line.