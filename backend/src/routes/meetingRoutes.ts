import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Meeting } from '../models/Meeting.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { audioUpload } from '../middleware/upload.js';
import { processAudioTranscription } from '../services/transcriptionService.js';
import {
  cacheGet,
  cacheSet,
  cacheDelPattern,
  cacheDel,
} from '../services/redisClient.js';
import { scoreCacheKey } from './scoreRoutes.js';

const router = Router();

const createMeetingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  participants: z.array(z.string()).optional().default([]),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

const LIST_TTL = 60; // seconds

/** Cache key for a paginated meeting list — scoped per user+query so employees
 *  never see each other's data from cache. */
function listCacheKey(
  userId: string,
  role: string,
  page: number,
  limit: number,
  status?: string
) {
  return `meetings:${role}:${userId}:${page}:${limit}:${status ?? 'all'}`;
}

/** Bust all list cache entries for a user (any page/limit/status combo) */
async function bustListCache(userId: string, role: string) {
  await cacheDelPattern(`meetings:${role}:${userId}:*`);
  // Admins/reviewers see all meetings — also bust their wildcard
  if (role === 'employee') {
    await cacheDelPattern(`meetings:reviewer:*`);
    await cacheDelPattern(`meetings:admin:*`);
  }
}

// ── POST /api/meetings ────────────────────────────────────────────────────────

router.post(
  '/',
  requireAuth,
  validateBody(createMeetingSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, scheduledAt, participants } = req.body;

      const meeting = await Meeting.create({
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        participants,
        createdBy: req.user!.sub,
      });

      // Invalidate list cache for this user and all reviewer/admin caches
      await bustListCache(req.user!.sub, req.user!.role);

      res.status(201).json({ meeting });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/meetings ─────────────────────────────────────────────────────────

router.get(
  '/',
  requireAuth,
  validateQuery(listQuerySchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status } = res.locals['parsedQuery'] as z.infer<
        typeof listQuerySchema
      >;
      const uid = req.user!.sub;
      const role = req.user!.role;

      // ── Cache check ─────────────────────────────────────────────────────────
      const cacheKey = listCacheKey(uid, role, page, limit, status);
      const cached = await cacheGet<object>(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT').json(cached);
        return;
      }

      const filter: Record<string, unknown> = {};
      if (role === 'employee') {
        filter['$or'] = [{ createdBy: uid }, { participants: uid }];
      }
      if (status) filter['processingStatus'] = status;

      const [meetings, total] = await Promise.all([
        Meeting.find(filter)
          .sort({ scheduledAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('createdBy', 'name email')
          .populate('participants', 'name email'),
        Meeting.countDocuments(filter),
      ]);

      const payload = {
        meetings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      await cacheSet(cacheKey, payload, LIST_TTL);
      res.set('X-Cache', 'MISS').json(payload);
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/meetings/:id ─────────────────────────────────────────────────────

router.get(
  '/:id',
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await Meeting.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('participants', 'name email');

      if (!meeting) {
        res
          .status(404)
          .json({ code: 'MEETING_NOT_FOUND', message: 'Meeting not found' });
        return;
      }

      if (req.user!.role === 'employee') {
        const userId = req.user!.sub;
        const isParticipant = meeting.participants.some(
          (p) => p._id.toString() === userId
        );
        const isCreator = meeting.createdBy._id.toString() === userId;
        if (!isParticipant && !isCreator) {
          res
            .status(403)
            .json({ code: 'ACCESS_DENIED', message: 'Access denied' });
          return;
        }
      }

      res.json({ meeting });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/meetings/:id/audio ──────────────────────────────────────────────

router.post(
  '/:id/audio',
  requireAuth,
  audioUpload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await Meeting.findById(req.params.id);

      if (!meeting) {
        res
          .status(404)
          .json({ code: 'MEETING_NOT_FOUND', message: 'Meeting not found' });
        return;
      }

      if (
        req.user!.role === 'employee' &&
        meeting.createdBy.toString() !== req.user!.sub
      ) {
        res
          .status(403)
          .json({ code: 'ACCESS_DENIED', message: 'Access denied' });
        return;
      }

      if (meeting.processingStatus === 'processing') {
        res.status(409).json({
          code: 'ALREADY_PROCESSING',
          message: 'Audio is already being processed',
        });
        return;
      }

      if (!req.file) {
        res
          .status(400)
          .json({ code: 'FILE_REQUIRED', message: 'Audio file is required' });
        return;
      }

      // Invalidate score cache (will be regenerated) and list cache
      await Promise.all([
        cacheDel(scoreCacheKey(meeting._id.toString())),
        bustListCache(req.user!.sub, req.user!.role),
      ]);

      res.status(202).json({
        message: 'Audio accepted, transcription started',
        meetingId: meeting._id,
        processingStatus: 'processing',
      });

      processAudioTranscription(
        meeting._id.toString(),
        req.file.buffer,
        req.file.mimetype
      ).catch(() => undefined);
    } catch (err) {
      next(err);
    }
  },
  // Multer error handler — catches fileFilter rejections
  (err: Error, _req: AuthRequest, res: Response, _next: NextFunction) => {
    res.status(400).json({ code: 'INVALID_FILE', message: err.message });
  }
);

export default router;
