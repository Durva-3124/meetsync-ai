import { Router, Response, NextFunction } from 'express';
import { Meeting } from '../models/Meeting.js';
import { EffectivenessScore } from '../models/EffectivenessScore.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';
import { cacheGet, cacheSet } from '../services/redisClient.js';

const router = Router({ mergeParams: true });

const SCORE_TTL = 60; // seconds
export const scoreCacheKey = (meetingId: string) => `score:${meetingId}`;

// GET /api/meetings/:id/score
router.get(
  '/',
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params['id'] as string;

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        res
          .status(404)
          .json({ code: 'MEETING_NOT_FOUND', message: 'Meeting not found' });
        return;
      }

      if (req.user!.role === 'employee') {
        const uid = req.user!.sub;
        const allowed =
          meeting.createdBy.toString() === uid ||
          meeting.participants.some((p) => p.toString() === uid);
        if (!allowed) {
          res
            .status(403)
            .json({ code: 'ACCESS_DENIED', message: 'Access denied' });
          return;
        }
      }

      if (meeting.processingStatus !== 'completed') {
        res.status(409).json({
          code: 'PROCESSING_INCOMPLETE',
          message: 'Score not available yet',
          processingStatus: meeting.processingStatus,
        });
        return;
      }

      // ── Cache check ───────────────────────────────────────────────────────────
      const cacheKey = scoreCacheKey(meetingId);
      const cached = await cacheGet<object>(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT').json({ score: cached });
        return;
      }

      const score = await EffectivenessScore.findOne({ meetingId });
      if (!score) {
        res.status(404).json({
          code: 'SCORE_NOT_FOUND',
          message: 'Effectiveness score not found',
        });
        return;
      }

      await cacheSet(cacheKey, score.toObject(), SCORE_TTL);
      res.set('X-Cache', 'MISS').json({ score });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
