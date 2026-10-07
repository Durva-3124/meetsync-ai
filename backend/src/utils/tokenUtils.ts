import crypto from 'node:crypto';

export function sha256Base64Url(input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest('base64');
  // base64url
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createJti(): string {
  return crypto.randomUUID();
}
