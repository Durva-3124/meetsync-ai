import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMongoStartupError } from './db.js';

test('formats a clear MongoDB startup message', () => {
  const error = new Error('connect ECONNREFUSED 127.0.0.1:27017');
  const message = formatMongoStartupError(
    'mongodb://127.0.0.1:27017/meetsync',
    error
  );

  assert.match(message, /MongoDB startup failed/i);
  assert.match(message, /MongoDB is running/i);
  assert.match(message, /mongodb:\/\/127\.0\.0\.1:27017\/meetsync/i);
  assert.match(message, /ECONNREFUSED/i);
});
