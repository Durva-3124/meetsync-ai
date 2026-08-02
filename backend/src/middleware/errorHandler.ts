import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { env } from '../config/env.js';

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // CORS rejection
  if (err.message.startsWith('CORS:')) {
    res.status(403).json({ code: 'CORS_REJECTED', message: err.message });
    return;
  }

  // Mongoose CastError (invalid ObjectId etc.)
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ code: 'INVALID_ID', message: `Invalid value for field: ${err.path}` });
    return;
  }

  // Mongoose ValidationError
  if (err instanceof MongooseError.ValidationError) {
    const fields = Object.keys(err.errors);
    res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      fields: Object.fromEntries(fields.map((f) => [f, err.errors[f].message])),
    });
    return;
  }

  // MongoDB duplicate key (E11000)
  const mongoErr = err as MongoServerError;
  if (mongoErr.code === 11000) {
    res.status(409).json({
      code: 'DUPLICATE_KEY',
      message: 'A record with this value already exists',
      ...(mongoErr.keyValue ? { fields: mongoErr.keyValue } : {}),
    });
    return;
  }

  const status = (err as MongoServerError & { status?: number }).status ?? 500;
  console.error(`[error] ${req.method} ${req.url} →`, err.message);

  res.status(status).json({
    code: status < 500 ? 'REQUEST_ERROR' : 'INTERNAL_ERROR',
    message: status < 500 ? err.message : 'Internal server error',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
