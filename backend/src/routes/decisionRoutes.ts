import { Router, Response } from 'express';
import { Meeting } from '../models/Meeting.js';
import { Decision } from '../models/Decision.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router({ mergeParams: true });

// GET /api/meetings/:id/decisions
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
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
    res.status(409).json({ message: 'Decisions not available yet', processingStatus: meeting.processingStatus });
    return;
  }

  const decisions = await Decision.find({ meetingId: req.params.id }).sort({ createdAt: 1 });

  res.json({ decisions });
});

export default router;
