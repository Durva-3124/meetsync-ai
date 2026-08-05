import { Router, Response } from 'express';
import { z } from 'zod';
import { Meeting } from '../models/Meeting.js';
import { Task } from '../models/Task.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';
import { validateQuery } from '../middleware/validate.js';

const router = Router({ mergeParams: true });

const querySchema = z.object({
  status: z.enum(['draft', 'assigned', 'in_progress', 'done']).optional(),
});

// GET /api/meetings/:id/tasks
router.get(
  '/',
  requireAuth,
  validateQuery(querySchema),
  async (req: AuthRequest, res: Response) => {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }

    if (req.user!.role === 'employee') {
      const uid = req.user!.sub;
      const allowed =
        meeting.createdBy.toString() === uid ||
        meeting.participants.some((p) => p.toString() === uid);
      if (!allowed) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    if (meeting.processingStatus !== 'completed') {
      res.status(409).json({
        message: 'Tasks not available yet',
        processingStatus: meeting.processingStatus,
      });
      return;
    }

    const filter: Record<string, unknown> = { meetingId: req.params.id };
    const { status } = res.locals['parsedQuery'] as z.infer<typeof querySchema>;
    if (status) filter['status'] = status;

    const tasks = await Task.find(filter)
      .sort({ createdAt: 1 })
      .populate('matchedUserId', 'name email');

    res.json({ tasks });
  }
);

export default router;
