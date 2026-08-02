import { Redis } from 'ioredis';
import { env } from '../config/env.js';

// Never open a Redis connection during tests — keeps the event loop clean
// so the test process can exit naturally.
const REDIS_ENABLED = env.NODE_ENV !== 'test';

let _client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!_client) {
    _client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    _client.on('error', (err: Error) => {
      console.error('[redis]', err.message);
    });
  }
  return _client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!REDIS_ENABLED) return null;
  try {
    const raw = await getRedisClient().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  if (!REDIS_ENABLED) return;
  try {
    await getRedisClient().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // best-effort
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!REDIS_ENABLED) return;
  try {
    if (keys.length) await getRedisClient().del(...keys);
  } catch {
    // best-effort
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!REDIS_ENABLED) return;
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
  } catch {
    // best-effort
  }
}
