import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export interface AuthUserPayload {
  sub: string;
  email: string;
  role: 'employee' | 'reviewer' | 'admin';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const createTokenPair = (payload: AuthUserPayload): TokenPair => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL },
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (
  token: string,
  expectedType: 'access' | 'refresh' = 'access',
): AuthUserPayload & JwtPayload => {
  const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload & AuthUserPayload;

  if (expectedType === 'refresh' && payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  if (expectedType === 'access' && payload.type === 'refresh') {
    throw new Error('Invalid access token');
  }

  return payload;
};
