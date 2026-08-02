import test from 'node:test';
import assert from 'node:assert/strict';
import { createTokenPair, verifyToken } from './auth.js';

test('creates and verifies access and refresh tokens', () => {
  const tokens = createTokenPair({
    sub: 'user-1',
    email: 'user@example.com',
    role: 'reviewer',
  });

  assert.ok(tokens.accessToken);
  assert.ok(tokens.refreshToken);

  const accessPayload = verifyToken(tokens.accessToken, 'access');
  const refreshPayload = verifyToken(tokens.refreshToken, 'refresh');

  assert.equal(accessPayload.sub, 'user-1');
  assert.equal(accessPayload.role, 'reviewer');
  assert.equal(refreshPayload.sub, 'user-1');
  assert.equal(refreshPayload.role, 'reviewer');
});
