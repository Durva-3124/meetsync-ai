import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import momRoutes from './routes/momRoutes.js';
import decisionRoutes from './routes/decisionRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import taskNotifyRoutes from './routes/taskNotifyRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import {
  corsMiddleware,
  helmetMiddleware,
  globalRateLimit,
  authRateLimit,
  mongoSanitizeMiddleware,
} from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ── Security middleware (must come before routes) ─────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.options('/{*path}', corsMiddleware); // preflight
app.use(globalRateLimit);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(mongoSanitizeMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/meetings/:id/mom', momRoutes);
app.use('/api/meetings/:id/decisions', decisionRoutes);
app.use('/api/meetings/:id/tasks', taskRoutes);
app.use('/api/tasks', taskNotifyRoutes);
app.use('/api/meetings/:id/deadlines', deadlineRoutes);
app.use('/api/meetings/:id/score', scoreRoutes);
app.use('/api/meetings/:id/review', reviewRoutes);
app.use('/api/meetings/:id/export', exportRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Central error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
