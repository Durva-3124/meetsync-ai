# MeetSync Backend — Setup Guide

## Prerequisites

Install the following before proceeding:

- [Node.js v18+](https://nodejs.org) — verify with `node -v`
- [Docker Desktop](https://www.docker.com/products/docker-desktop) — for Redis

---

## 1. Clone the repo and navigate to backend

```bash
cd meetsync-ai/backend
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Set up environment variables

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://Meetsync-AI:<password>@ac-zqzqtbr-shard-00-00.eglimi4.mongodb.net:27017,ac-zqzqtbr-shard-00-01.eglimi4.mongodb.net:27017,ac-zqzqtbr-shard-00-02.eglimi4.mongodb.net:27017/meetsync?ssl=true&replicaSet=atlas-301bwj-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=<generate one — see below>
REDIS_URL=redis://localhost:6379
AI_SERVICE_1_URL=http://localhost:8001
AI_SERVICE_2_URL=http://localhost:8002
AI_USE_MOCKS=true
ALLOWED_ORIGINS=http://localhost:3000
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MeetSync <no-reply@meetsync.local>
```

**To generate a JWT_SECRET**, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as the value for `JWT_SECRET`.

> The `MONGO_URI` is shared — get it from the team lead. Do NOT commit `.env` to git.

---

## 4. Start Redis via Docker

Make sure Docker Desktop is open and running, then:

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

This only needs to be done once. After that, to start/stop Redis:

```bash
docker start redis   # start
docker stop redis    # stop
```

---

## 5. Run the backend

```bash
npm run dev
```

You should see:
```
🍃 MongoDB Connected: ...
Backend running on http://localhost:5000
```

---

## Troubleshooting

**`MONGO_URI` or `JWT_SECRET` errors on startup**
- Make sure your `.env` file exists in the `backend/` folder
- Make sure there are no quotes or extra spaces around values

**`ECONNREFUSED 127.0.0.1:6379` (Redis error)**
- Docker is not running — open Docker Desktop and wait for "Engine running"
- Then run `docker start redis`

**`querySrv ECONNREFUSED` (MongoDB error)**
- Your network may be blocking MongoDB Atlas DNS (common on college/office networks)
- Switch to a mobile hotspot and try again

**Port 5000 already in use**
- Change `PORT=5001` in `.env` and restart

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm test` | Run unit tests |
| `npm run lint` | Lint the codebase |
| `npm run format` | Format code with Prettier |
