import { Router, Request, Response } from 'express';

import { env } from '../config/env.js';
import mongoose from 'mongoose';

const router = Router();

// Basic health
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Readiness probe for orchestrators/load balancers.
// We do a lightweight check by trying a DB connection and immediately
// disconnecting/letting mongoose manage pooling.
// If the app already connected at boot, this should be fast.
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const state = mongoose.connection.readyState;
    if (state === 0 || state === 3) {
      res.status(503).json({
        status: 'not_ready',
        message: 'MongoDB not connected',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!mongoose.connection.db) {
      res.status(503).json({
        status: 'not_ready',
        message: 'MongoDB database handle unavailable',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Ping admin to validate connection is healthy.
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'not_ready',
      message: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
