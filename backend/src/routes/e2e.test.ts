import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { disconnectRedis } from '../services/redisClient.js';

async function pollStatus(
  meetingId: string,
  token: string,
  target: string,
  maxMs = 8000
): Promise<void> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}`)
      .set('Authorization', `Bearer ${token}`);
    if (
      (res.body as { meeting: { processingStatus: string } }).meeting
        ?.processingStatus === target
    )
      return;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Timed out waiting for processingStatus=${target}`);
}

function wavBuffer(): Buffer {
  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(44100, 24);
  buf.writeUInt32LE(88200, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(0, 40);
  return buf;
}

describe('P0 end-to-end pipeline', async () => {
  let accessToken = '';
  let refreshToken = '';
  let meetingId = '';

  before(async () => {
    await connectDB();
    const db = mongoose.connection.db!;
    const cols = await db.listCollections().toArray();
    await Promise.all(cols.map((c) => db.collection(c.name).deleteMany({})));
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await disconnectRedis();
  });

  // ── Health ──────────────────────────────────────────────────────────────────

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal((res.body as { status: string }).status, 'ok');
  });

  // ── Auth ────────────────────────────────────────────────────────────────────

  it('POST /api/auth/register creates user and returns tokens', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
    });
    assert.equal(res.status, 201);
    const body = res.body as { accessToken: string; refreshToken: string };
    assert.ok(body.accessToken);
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 409);
  });

  it('POST /api/auth/login returns tokens', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 200);
    const body = res.body as { accessToken: string; refreshToken: string };
    assert.ok(body.accessToken);
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    assert.equal(res.status, 401);
  });

  it('GET /api/auth/me returns current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    assert.equal(
      (res.body as { user: { email: string } }).user.email,
      'test@example.com'
    );
  });

  it('GET /api/auth/me rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });

  it('POST /api/auth/refresh issues new token pair', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    assert.equal(res.status, 200);
    const body = res.body as { accessToken: string };
    assert.ok(body.accessToken);
    accessToken = body.accessToken;
  });

  // ── Meetings ────────────────────────────────────────────────────────────────

  it('POST /api/meetings creates a meeting', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Sprint Review',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
    assert.equal(res.status, 201);
    assert.equal(
      (res.body as { meeting: { title: string } }).meeting.title,
      'Sprint Review'
    );
    meetingId = (res.body as { meeting: { _id: string } }).meeting._id;
  });

  it('POST /api/meetings rejects missing scheduledAt', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Bad Meeting' });
    assert.equal(res.status, 400);
  });

  it('GET /api/meetings/:id returns meeting', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    assert.equal(
      (res.body as { meeting: { _id: string } }).meeting._id,
      meetingId
    );
  });

  it('GET /api/meetings/:id returns 404 for unknown id', async () => {
    const res = await request(app)
      .get('/api/meetings/000000000000000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 404);
    assert.equal((res.body as { code: string }).code, 'MEETING_NOT_FOUND');
  });

  it('GET /api/meetings/:id/score returns 409 when meeting is pending', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/score`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 409);
    assert.equal((res.body as { code: string }).code, 'PROCESSING_INCOMPLETE');
  });

  // ── Audio pipeline ──────────────────────────────────────────────────────────

  it('POST /api/meetings/:id/audio rejects non-audio file', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/audio`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('not audio'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });
    assert.equal(res.status, 400);
  });

  it('POST /api/meetings/:id/audio accepts WAV and returns 202', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/audio`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', wavBuffer(), {
        filename: 'meeting.wav',
        contentType: 'audio/wav',
      });
    assert.equal(res.status, 202);
    assert.equal(
      (res.body as { processingStatus: string }).processingStatus,
      'processing'
    );
  });

  it('processingStatus flips to completed after audio upload', async () => {
    await pollStatus(meetingId, accessToken, 'completed');
    const res = await request(app)
      .get(`/api/meetings/${meetingId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(
      (res.body as { meeting: { processingStatus: string } }).meeting
        .processingStatus,
      'completed'
    );
  });

  // ── Derived resources ───────────────────────────────────────────────────────

  it('GET /api/meetings/:id/mom returns minutes of meeting', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/mom`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const mom = (res.body as { mom: { agenda: unknown[]; summary: string } })
      .mom;
    assert.ok(Array.isArray(mom.agenda));
    assert.ok(typeof mom.summary === 'string');
  });

  it('GET /api/meetings/:id/decisions returns decisions array', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/decisions`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const decisions = (res.body as { decisions: unknown[] }).decisions;
    assert.ok(Array.isArray(decisions));
    assert.ok(decisions.length > 0);
  });

  it('GET /api/meetings/:id/tasks returns tasks with requiredSkills', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/tasks`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const tasks = (
      res.body as { tasks: { requiredSkills: string[]; status: string }[] }
    ).tasks;
    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.length > 0);
    assert.ok(Array.isArray(tasks[0].requiredSkills));
    assert.equal(tasks[0].status, 'draft');
  });

  it('GET /api/meetings/:id/tasks?status=draft returns only draft tasks', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/tasks?status=draft`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const tasks = (res.body as { tasks: { status: string }[] }).tasks;
    assert.ok(tasks.every((t) => t.status === 'draft'));
  });

  it('GET /api/meetings/:id/deadlines returns sorted deadlines', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/deadlines`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const deadlines = (res.body as { deadlines: { assignee: string }[] })
      .deadlines;
    assert.ok(Array.isArray(deadlines));
    assert.ok(deadlines.length > 0);
  });

  it('GET /api/meetings/:id/score returns effectiveness score', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/score`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const score = (
      res.body as {
        score: { score: number; breakdown: object; suggestions: string[] };
      }
    ).score;
    assert.ok(typeof score.score === 'number');
    assert.ok(score.score >= 0 && score.score <= 100);
    assert.ok(typeof score.breakdown === 'object');
    assert.ok(Array.isArray(score.suggestions));
    // Cache header always present (MISS in test env, HIT in live env)
    assert.ok(['HIT', 'MISS'].includes(res.headers['x-cache'] as string));
  });

  it('GET /api/meetings returns paginated list with X-Cache header', async () => {
    const res = await request(app)
      .get('/api/meetings?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray((res.body as { meetings: unknown[] }).meetings));
    assert.ok(
      (res.body as { pagination: { total: number } }).pagination.total >= 1
    );
    assert.ok(['HIT', 'MISS'].includes(res.headers['x-cache'] as string));
  });

  // ── Review ──────────────────────────────────────────────────────────────────

  it('PATCH /api/meetings/:id/review creates v1 with ai-tagged unchanged field', async () => {
    // Fetch the real AI summary so we can send it back unchanged
    const momRes = await request(app)
      .get(`/api/meetings/${meetingId}/mom`)
      .set('Authorization', `Bearer ${accessToken}`);
    const aiSummary = (momRes.body as { mom: { summary: string } }).mom.summary;

    const res = await request(app)
      .patch(`/api/meetings/${meetingId}/review`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fields: [{ field: 'summary', edited: aiSummary }], lock: false });

    assert.equal(res.status, 201);
    const rv = (
      res.body as {
        reviewVersion: {
          version: number;
          locked: boolean;
          fields: { source: string; diff: { op: string }[] }[];
        };
      }
    ).reviewVersion;
    assert.equal(rv.version, 1);
    assert.equal(rv.locked, false);
    assert.equal(rv.fields[0].source, 'ai'); // unchanged → tagged ai
    assert.ok(
      rv.fields[0].diff.every((h: { op: string }) => h.op === 'unchanged')
    );
  });

  it('PATCH /api/meetings/:id/review creates v2 with manual-tagged edited field and diff hunks', async () => {
    const res = await request(app)
      .patch(`/api/meetings/${meetingId}/review`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fields: [
          {
            field: 'summary',
            edited: 'Manually revised summary for the sprint.',
          },
        ],
        lock: false,
      });

    assert.equal(res.status, 201);
    const rv = (
      res.body as {
        reviewVersion: {
          version: number;
          fields: { source: string; diff: { op: string }[] }[];
        };
      }
    ).reviewVersion;
    assert.equal(rv.version, 2);
    assert.equal(rv.fields[0].source, 'manual'); // edited → tagged manual
    assert.ok(
      rv.fields[0].diff.some(
        (h: { op: string }) => h.op === 'added' || h.op === 'removed'
      )
    );
  });

  it('PATCH /api/meetings/:id/review with lock=true locks the review', async () => {
    const momRes = await request(app)
      .get(`/api/meetings/${meetingId}/mom`)
      .set('Authorization', `Bearer ${accessToken}`);
    const aiSummary = (momRes.body as { mom: { summary: string } }).mom.summary;

    const res = await request(app)
      .patch(`/api/meetings/${meetingId}/review`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fields: [{ field: 'summary', edited: aiSummary }], lock: true });

    assert.equal(res.status, 201);
    const rv = (
      res.body as { reviewVersion: { locked: boolean; lockedAt: string } }
    ).reviewVersion;
    assert.equal(rv.locked, true);
    assert.ok(rv.lockedAt);
  });

  it('PATCH /api/meetings/:id/review returns 423 when locked', async () => {
    const res = await request(app)
      .patch(`/api/meetings/${meetingId}/review`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fields: [{ field: 'summary', edited: 'Attempt after lock' }] });
    assert.equal(res.status, 423);
    assert.equal((res.body as { code: string }).code, 'REVIEW_LOCKED');
  });

  it('GET /api/meetings/:id/review returns all versions newest-first', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/review`)
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    const versions = (
      res.body as { versions: { version: number; locked: boolean }[] }
    ).versions;
    assert.ok(Array.isArray(versions));
    assert.ok(versions.length >= 3);
    // newest first
    assert.ok(versions[0].version > versions[1].version);
    // latest is locked
    assert.equal(versions[0].locked, true);
  });

  it('PATCH /api/meetings/:id/review returns 403 for employee role', async () => {
    // Register an employee user
    const empRes = await request(app).post('/api/auth/register').send({
      name: 'Employee',
      email: 'emp@example.com',
      password: 'password123',
      role: 'employee',
    });
    const empToken = (empRes.body as { accessToken: string }).accessToken;

    const res = await request(app)
      .patch(`/api/meetings/${meetingId}/review`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({ fields: [{ field: 'summary', edited: 'Employee attempt' }] });
    assert.equal(res.status, 403);
  });

  it('PATCH /api/meetings/:id/review returns 400 for unknown field', async () => {
    // Create a fresh unlocked meeting to test unknown field
    const mRes = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Field Test',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });
    const fid = (mRes.body as { meeting: { _id: string } }).meeting._id;

    // Upload audio so it completes
    await request(app)
      .post(`/api/meetings/${fid}/audio`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', wavBuffer(), {
        filename: 'meeting.wav',
        contentType: 'audio/wav',
      });
    await pollStatus(fid, accessToken, 'completed');

    const res = await request(app)
      .patch(`/api/meetings/${fid}/review`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fields: [{ field: 'nonexistent_field', edited: 'value' }] });
    assert.equal(res.status, 400);
    assert.equal((res.body as { code: string }).code, 'UNKNOWN_FIELD');
  });
});
