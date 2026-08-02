import assert from 'node:assert/strict';
import { describe, it, before, after, beforeEach } from 'node:test';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { breaker1, breaker2 } from './ai/resilience.js';
import { AiServiceError } from './ai/aiError.js';
import { EffectivenessScore } from '../models/EffectivenessScore.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/auth.js';

// ── helpers ───────────────────────────────────────────────────────────────────

async function createTestMeeting(): Promise<string> {
  const user = await User.create({
    name: 'Test',
    email: `u${Date.now()}@test.com`,
    passwordHash: await hashPassword('pass1234'),
    role: 'admin',
  });
  const meeting = await Meeting.create({
    title: 'Isolation Test Meeting',
    scheduledAt: new Date(),
    createdBy: user._id,
    participants: [],
  });
  return meeting._id.toString();
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe('AI resilience — circuit breaker isolation', async () => {
  before(async () => {
    process.env['MONGO_URI'] = 'mongodb://127.0.0.1:27017/meetsync_test';
    process.env['AI_USE_MOCKS'] = 'false'; // we control calls manually in these tests
    await connectDB();
    const db = mongoose.connection.db!;
    const cols = await db.listCollections().toArray();
    await Promise.all(cols.map((c) => db.collection(c.name).deleteMany({})));
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(() => {
    // Reset both breakers to closed state before each test
    breaker1.close();
    breaker2.close();
  });

  // 1. AiServiceError shape ────────────────────────────────────────────────────

  it('AiServiceError carries service, endpoint, statusCode, circuitOpen', () => {
    const err = new AiServiceError('ai-2', '/internal/ai/insights', 503, false);
    assert.equal(err.service, 'ai-2');
    assert.equal(err.endpoint, '/internal/ai/insights');
    assert.equal(err.statusCode, 503);
    assert.equal(err.circuitOpen, false);
    assert.ok(err instanceof Error);
    assert.ok(err instanceof AiServiceError);
    assert.match(err.message, /ai-2/);
    assert.match(err.message, /503/);
  });

  it('AiServiceError marks circuitOpen=true when breaker is open', () => {
    const err = new AiServiceError(
      'ai-2',
      '/internal/ai/skill-match',
      null,
      true
    );
    assert.equal(err.circuitOpen, true);
    assert.equal(err.statusCode, null);
    assert.match(err.message, /circuit open/);
  });

  // 2. Breaker independence ────────────────────────────────────────────────────

  it('breaker1 and breaker2 are separate instances', () => {
    assert.notEqual(breaker1, breaker2);
    assert.equal(breaker1.name, 'ai-1');
    assert.equal(breaker2.name, 'ai-2');
  });

  it('opening breaker2 does not affect breaker1', async () => {
    // Force breaker2 open by firing enough failures
    const failingThunk = () => Promise.reject(new Error('ai-2 down'));

    // Fire volumeThreshold failures to trip the breaker
    const attempts = Array.from({ length: 5 }, () =>
      breaker2.fire(failingThunk).catch(() => null)
    );
    await Promise.all(attempts);

    // breaker2 should now be open
    assert.equal(breaker2.opened, true);

    // breaker1 must still be closed
    assert.equal(breaker1.opened, false);

    // breaker1 can still execute successfully
    const result = await breaker1.fire(() => Promise.resolve('ai-1 ok'));
    assert.equal(result, 'ai-1 ok');
  });

  it('opening breaker1 does not affect breaker2', async () => {
    const failingThunk = () => Promise.reject(new Error('ai-1 down'));
    const attempts = Array.from({ length: 5 }, () =>
      breaker1.fire(failingThunk).catch(() => null)
    );
    await Promise.all(attempts);

    assert.equal(breaker1.opened, true);
    assert.equal(breaker2.opened, false);

    const result = await breaker2.fire(() => Promise.resolve('ai-2 ok'));
    assert.equal(result, 'ai-2 ok');
  });

  // 3. AI-2 down never blocks AI-1 persisted results ───────────────────────────

  it('AI-2 down: AI-1 results (MoM, Decisions, Deadlines) are still persisted', async () => {
    // Force breaker2 open
    const failingThunk = () => Promise.reject(new Error('ai-2 down'));
    await Promise.all(
      Array.from({ length: 5 }, () =>
        breaker2.fire(failingThunk).catch(() => null)
      )
    );
    assert.equal(breaker2.opened, true);

    const meetingId = await createTestMeeting();

    // Simulate what transcriptionService does: run Phase 1 with AI-2 calls failing
    const { Mom: MomModel } = await import('../models/Mom.js');
    const { Decision: DecisionModel } = await import('../models/Decision.js');
    const { Deadline: DeadlineModel } = await import('../models/Deadline.js');

    // AI-1 calls succeed (mocked directly)
    const momData = {
      agenda: ['item1'],
      discussionPoints: [],
      summary: 'test summary',
    };
    const decisionsData = [{ decision: 'Use Redis', madeBy: 'SPEAKER_00' }];
    const deadlinesData = [
      {
        description: 'Submit PR',
        assignee: 'Alice',
        deadline: new Date().toISOString(),
        rawText: 'raw',
      },
    ];

    // Persist AI-1 results
    await MomModel.findOneAndUpdate(
      { meetingId },
      { meetingId, ...momData },
      { upsert: true, returnDocument: 'after' }
    );
    await DecisionModel.deleteMany({ meetingId });
    await DecisionModel.insertMany(
      decisionsData.map((d) => ({ ...d, meetingId }))
    );
    await DeadlineModel.deleteMany({ meetingId });
    await DeadlineModel.insertMany(
      deadlinesData.map((d) => ({
        ...d,
        meetingId,
        deadline: new Date(d.deadline),
      }))
    );

    // AI-2 calls fail (breaker open) — simulate what Promise.allSettled does
    const ai2Result = await breaker2.fire(failingThunk).catch((e: Error) => e);
    assert.ok(ai2Result instanceof Error);

    // Verify AI-1 results are fully persisted despite AI-2 being down
    const mom = await MomModel.findOne({ meetingId });
    assert.ok(mom, 'MoM should be persisted');
    assert.equal(mom!.summary, 'test summary');
    assert.deepEqual(mom!.agenda, ['item1']);

    const decisions = await DecisionModel.find({ meetingId });
    assert.equal(decisions.length, 1);
    assert.equal(decisions[0].decision, 'Use Redis');

    const deadlines = await DeadlineModel.find({ meetingId });
    assert.equal(deadlines.length, 1);
    assert.equal(deadlines[0].assignee, 'Alice');

    // EffectivenessScore and Tasks should NOT exist (AI-2 dependent)
    const score = await EffectivenessScore.findOne({ meetingId });
    assert.equal(score, null, 'Score should not exist when AI-2 is down');
  });

  // 4. Error envelope standardization ─────────────────────────────────────────

  it('toAiError wraps a plain network error into AiServiceError', async () => {
    const { toAiError } = await import('./ai/aiError.js');
    const networkErr = new Error('connect ECONNREFUSED');
    const wrapped = toAiError('ai-2', '/internal/ai/sentiment', networkErr);
    assert.ok(wrapped instanceof AiServiceError);
    assert.equal(wrapped.service, 'ai-2');
    assert.equal(wrapped.statusCode, null);
    assert.equal(wrapped.circuitOpen, false);
  });

  it('toAiError wraps an axios 503 response into AiServiceError with statusCode', async () => {
    const { toAiError } = await import('./ai/aiError.js');
    const axiosErr = Object.assign(new Error('Service Unavailable'), {
      response: { status: 503 },
    });
    const wrapped = toAiError('ai-1', '/internal/ai/transcribe', axiosErr);
    assert.equal(wrapped.statusCode, 503);
    assert.equal(wrapped.circuitOpen, false);
  });

  it('toAiError detects open circuit from opossum message', async () => {
    const { toAiError } = await import('./ai/aiError.js');
    const opossumErr = new Error('Breaker is open');
    const wrapped = toAiError('ai-2', '/internal/ai/insights', opossumErr);
    assert.equal(wrapped.circuitOpen, true);
    assert.equal(wrapped.statusCode, null);
  });
});
