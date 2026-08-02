import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// ── CORS ──────────────────────────────────────────────────────────────────────

const allowedOrigins = new Set(
  env.ALLOWED_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow server-to-server / curl in non-production; always allow listed origins
    if (
      !origin ||
      allowedOrigins.has(origin) ||
      env.NODE_ENV !== 'production'
    ) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // preflight cache 24 h
});

// ── Helmet ────────────────────────────────────────────────────────────────────

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
});

// ── Rate limiters ─────────────────────────────────────────────────────────────

/** Global: 200 req / 15 min per IP */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

/** Auth endpoints: 20 req / 15 min per IP — brute-force guard */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts, please try again later',
  },
});

// ── Mongo sanitize ────────────────────────────────────────────────────────────
// express-mongo-sanitize writes to req.query which is getter-only in Express 5.
// We apply it manually to only body and params; query is protected by Zod validateQuery.
import { sanitize } from 'express-mongo-sanitize';

export const mongoSanitizeMiddleware: express.RequestHandler = (
  req,
  _res,
  next
) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params) as Record<string, string>;
  next();
};

// ── HPP ───────────────────────────────────────────────────────────────────────
// NOTE: hpp mutates req.query which is getter-only in Express 5.
// Query params are protected by Zod validateQuery middleware on every route,
// so hpp is not needed and is intentionally omitted.
