import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Meeting } from '../models/Meeting.js';
import { Mom } from '../models/Mom.js';
import { Decision } from '../models/Decision.js';
import { ReviewVersion, type ReviewedField } from '../models/ReviewVersion.js';
import {
  requireAuth,
  requireRole,
  AuthRequest,
} from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { diffStrings, diffArrays } from '../utils/diff.js';

const router = Router({ mergeParams: true });

// ── Zod schema ────────────────────────────────────────────────────────────────

const reviewFieldSchema = z.object({
  field: z.string().min(1),
  edited: z.string(),
});

const patchReviewSchema = z.object({
  fields: z.array(reviewFieldSchema).min(1),
  lock: z.boolean().optional().default(false),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resolveOriginal(
  meetingId: string,
  field: string
): Promise<string | null> {
  if (field === 'summary') {
    const mom = await Mom.findOne({ meetingId });
    return mom?.summary ?? null;
  }
  if (field === 'agenda') {
    const mom = await Mom.findOne({ meetingId });
    return mom ? JSON.stringify(mom.agenda) : null;
  }
  const decisionMatch = field.match(/^decisions\[(\d+)\]\.(\w+)$/);
  if (decisionMatch) {
    const idx = parseInt(decisionMatch[1], 10);
    const prop = decisionMatch[2] as 'decision' | 'rationale';
    const decisions = await Decision.find({ meetingId }).sort({ createdAt: 1 });
    const doc = decisions[idx];
    return doc ? (doc[prop] ?? '') : null;
  }
  return null;
}

function computeDiff(field: string, original: string, edited: string) {
  if (field === 'agenda') {
    try {
      return diffArrays(
        JSON.parse(original) as string[],
        JSON.parse(edited) as string[]
      );
    } catch {
      return diffStrings(original, edited);
    }
  }
  return diffStrings(original, edited);
}

// ── PATCH /api/meetings/:id/review ────────────────────────────────────────────

router.patch(
  '/',
  requireAuth,
  requireRole('reviewer', 'admin'),
  validateBody(patchReviewSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meetingId = req.params['id'] as string;
      const { fields: incomingFields, lock } = req.body as z.infer<
        typeof patchReviewSchema
      >;

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        res
          .status(404)
          .json({ code: 'MEETING_NOT_FOUND', message: 'Meeting not found' });
        return;
      }
      if (meeting.processingStatus !== 'completed') {
        res.status(409).json({
          code: 'PROCESSING_INCOMPLETE',
          message: 'Meeting processing not complete',
          processingStatus: meeting.processingStatus,
        });
        return;
      }

      const latest = await ReviewVersion.findOne({ meetingId }).sort({
        version: -1,
      });
      if (latest?.locked) {
        res.status(423).json({
          code: 'REVIEW_LOCKED',
          message: 'Review is locked and cannot be modified',
          lockedAt: latest.lockedAt,
          lockedBy: latest.lockedBy,
        });
        return;
      }

      const nextVersion = (latest?.version ?? 0) + 1;
      const reviewedFields: ReviewedField[] = [];

      for (const { field, edited } of incomingFields) {
        const original = await resolveOriginal(meetingId, field);
        if (original === null) {
          res.status(400).json({
            code: 'UNKNOWN_FIELD',
            message: `Unknown or unavailable field: ${field}`,
            field,
          });
          return;
        }
        const source = original === edited ? 'ai' : 'manual';
        reviewedFields.push({
          field,
          source,
          original,
          edited,
          diff: computeDiff(field, original, edited),
        });
      }

      const reviewVersion = await ReviewVersion.create({
        meetingId,
        version: nextVersion,
        reviewedBy: req.user!.sub,
        fields: reviewedFields,
        locked: lock,
        ...(lock ? { lockedAt: new Date(), lockedBy: req.user!.sub } : {}),
      });

      res.status(201).json({ reviewVersion });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/meetings/:id/review ──────────────────────────────────────────────

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

      const versions = await ReviewVersion.find({ meetingId })
        .sort({ version: -1 })
        .populate('reviewedBy', 'name email')
        .populate('lockedBy', 'name email');

      res.json({ versions });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
