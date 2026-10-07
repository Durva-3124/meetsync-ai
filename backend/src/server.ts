import app from './app.js';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './config/db.js';
import { startExportWorker } from './queues/exportQueue.js';
import {
  startDeadlineReminderWorker,
  scheduleDeadlineReminders,
} from './queues/deadlineReminderQueue.js';

import { initCaptions } from './realtime/captionsRealtime.js';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initCaptions(io);

// Catch unhandled errors - don't crash on Redis connection issues
process.on('uncaughtException', (err) => {
  if (err.message?.includes('ECONNRESET') || err.message?.includes('Redis')) {
    return; // Ignore Redis connection errors
  }
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (msg.includes('ECONNRESET') || msg.includes('Redis')) {
    return; // Ignore Redis connection errors
  }
  console.error('Unhandled Rejection:', reason);
});

(async () => {
  try {
    await connectDB();

    // Start background workers (non-blocking)
    startExportWorker();
    startDeadlineReminderWorker();

    // Schedule deadline reminders (may fail if Redis unavailable)
    try {
      await Promise.race([
        scheduleDeadlineReminders(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis timeout')), 3000)
        ),
      ]);
    } catch (err) {
      console.warn('⚠️ Deadline scheduler skipped (Redis unavailable)');
    }

    httpServer.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();
