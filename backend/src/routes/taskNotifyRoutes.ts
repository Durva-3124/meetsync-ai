import { Router, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';
import { sendTaskNotification } from '../services/emailService.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/tasks/:id/notify
router.post('/:id/notify', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params['id'] as string);
    if (!task) {
      res.status(404).json({ code: 'TASK_NOT_FOUND', message: 'Task not found' });
      return;
    }

    if (!task.matchedUserId) {
      res.status(422).json({
        code: 'NO_MATCHED_USER',
        message: 'Task has no matched user — cannot send notification',
      });
      return;
    }

    const meeting = await Meeting.findById(task.meetingId).select('title createdBy participants');
    if (!meeting) {
      res.status(404).json({ code: 'MEETING_NOT_FOUND', message: 'Meeting not found' });
      return;
    }

    if (req.user!.role === 'employee') {
      const uid = req.user!.sub;
      const allowed =
        meeting.createdBy.toString() === uid ||
        meeting.participants.some((p) => p.toString() === uid);
      if (!allowed) {
        res.status(403).json({ code: 'ACCESS_DENIED', message: 'Access denied' });
        return;
      }
    }

    const recipient = await User.findById(task.matchedUserId).select('name email');
    if (!recipient) {
      res.status(422).json({ code: 'USER_NOT_FOUND', message: 'Matched user no longer exists' });
      return;
    }

    await sendTaskNotification({
      toEmail: recipient.email,
      toName: recipient.name,
      taskDescription: task.task,
      assignee: task.assignee,
      dueDate: task.dueDate,
      meetingTitle: meeting.title,
      meetingId: task.meetingId.toString(),
      taskId: task._id.toString(),
      sourceSpan: task.sourceSpan,
    });

    res.json({
      message: 'Notification sent',
      to: recipient.email,
      taskId: task._id,
      sourceSpan: task.sourceSpan ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
