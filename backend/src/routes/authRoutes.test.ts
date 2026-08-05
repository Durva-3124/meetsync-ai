import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import authRoutes from './authRoutes.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createTokenPair } from '../utils/auth.js';

test('GET /me requires a valid access token', async () => {
  const app = express();
  app.use(express.json());
  app.get('/me', requireAuth, (_req, res) => {
    res.json({ ok: true });
  });

  const res = await request(app).get('/me');
  assert.equal(res.status, 401);

  const tokens = createTokenPair({
    sub: 'user-1',
    email: 'user@example.com',
    role: 'employee',
  });

  const authed = await request(app)
    .get('/me')
    .set('Authorization', `Bearer ${tokens.accessToken}`);
  assert.equal(authed.status, 200);
});

test('auth routes are mounted', async () => {
  const app = express();
  app.use('/api/auth', authRoutes);

  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});
