import axios, { type AxiosInstance, type AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';

// ── Retry policy ─────────────────────────────────────────────────────────────
// 3 attempts, exponential back-off, only on network errors or 5xx responses

const RETRY_COUNT = 3;

function applyRetry(instance: AxiosInstance): void {
  axiosRetry(instance, {
    retries: RETRY_COUNT,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (err: AxiosError) =>
      axiosRetry.isNetworkError(err) ||
      axiosRetry.isRetryableError(err) ||
      (err.response?.status !== undefined && err.response.status >= 500),
  });
}

// ── Axios instances ───────────────────────────────────────────────────────────

function makeInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  });
  applyRetry(instance);
  return instance;
}

// ── Circuit breaker factory ───────────────────────────────────────────────────
// One breaker per service so AI-2 failures never trip AI-1's breaker

const BREAKER_OPTIONS: CircuitBreaker.Options = {
  timeout: 30_000, // call must complete within 30 s
  errorThresholdPercentage: 50, // open after 50 % failures in the rolling window
  resetTimeout: 30_000, // half-open probe after 30 s
  volumeThreshold: 3, // need at least 3 calls before tripping
};

function makeBreaker(
  name: string
): CircuitBreaker<[() => Promise<unknown>], unknown> {
  const fn = (thunk: () => Promise<unknown>) => thunk();
  const breaker = new CircuitBreaker(fn, { ...BREAKER_OPTIONS, name });

  breaker.on('open', () => console.warn(`[circuit] ${name} OPEN`));
  breaker.on('halfOpen', () => console.info(`[circuit] ${name} HALF-OPEN`));
  breaker.on('close', () => console.info(`[circuit] ${name} CLOSED`));

  return breaker;
}

// ── Exported instances ────────────────────────────────────────────────────────

export const ai1 = makeInstance(
  process.env['AI_SERVICE_1_URL'] ?? 'http://localhost:8001'
);
export const ai2 = makeInstance(
  process.env['AI_SERVICE_2_URL'] ?? 'http://localhost:8002'
);

export const breaker1 = makeBreaker('ai-1');
export const breaker2 = makeBreaker('ai-2');

/** Fire a call through the AI-1 circuit breaker */
export async function withAi1<T>(thunk: () => Promise<T>): Promise<T> {
  return breaker1.fire(thunk as () => Promise<unknown>) as Promise<T>;
}

/** Fire a call through the AI-2 circuit breaker */
export async function withAi2<T>(thunk: () => Promise<T>): Promise<T> {
  return breaker2.fire(thunk as () => Promise<unknown>) as Promise<T>;
}
