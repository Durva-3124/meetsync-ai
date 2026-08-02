export class AiServiceError extends Error {
  constructor(
    public readonly service: 'ai-1' | 'ai-2',
    public readonly endpoint: string,
    public readonly statusCode: number | null,
    public readonly circuitOpen: boolean,
    cause?: unknown,
  ) {
    const reason = circuitOpen
      ? 'circuit open'
      : `HTTP ${statusCode ?? 'network error'}`;
    super(`[${service}] ${endpoint} failed — ${reason}`);
    this.name = 'AiServiceError';
    if (cause instanceof Error) this.cause = cause;
  }
}

/** Normalise any thrown value into an AiServiceError */
export function toAiError(
  service: 'ai-1' | 'ai-2',
  endpoint: string,
  err: unknown,
): AiServiceError {
  if (err instanceof AiServiceError) return err;

  // opossum wraps the rejection message as a plain Error when the circuit is open
  if (err instanceof Error && err.message.includes('Breaker is open')) {
    return new AiServiceError(service, endpoint, null, true, err);
  }

  const status =
    typeof err === 'object' && err !== null && 'response' in err
      ? (err as { response?: { status?: number } }).response?.status ?? null
      : null;

  return new AiServiceError(service, endpoint, status, false, err);
}
