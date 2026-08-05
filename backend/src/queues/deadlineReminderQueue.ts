import { Queue, Worker, Job, JobScheduler } from 'bullmq';
import { env } from '../config/env.js';
import { Deadline } from '../models/Deadline.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';
import { sendDeadlineReminder } from '../services/emailService.js';

export const DEADLINE_REMINDER_QUEUE = 'deadlineReminder';
export const DEADLINE_REMINDER_JOB = 'checkDeadlines';

const connection = { url: env.REDIS_URL };

// Lazy singleton — not instantiated at import time so tests don't hang
let _queue: Queue | null = null;
export function getDeadlineReminderQueue(): Queue {
  if (!_queue) _queue = new Queue(DEADLINE_REMINDER_QUEUE, { connection });
  return _queue;
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
// Call once at server boot. Upserts a daily repeatable job via JobScheduler
// (BullMQ v5 API — replaces the deprecated repeat option on Queue.add).

export async function scheduleDeadlineReminders(): Promise<void> {
  const scheduler = new JobScheduler(DEADLINE_REMINDER_QUEUE, { connection });
  await scheduler.upsertJobScheduler(
    DEADLINE_REMINDER_JOB,
    { pattern: '0 8 * * *' }, // every day at 08:00
    DEADLINE_REMINDER_JOB, // jobName
    {}, // jobData
    {}, // opts
    { override: false } // don't reset if already scheduled
  );
  await scheduler.close();
}

// ── Worker ────────────────────────────────────────────────────────────────────

export function startDeadlineReminderWorker() {
  const worker = new Worker(
    DEADLINE_REMINDER_QUEUE,
    async (_job: Job) => {
      const now = new Date();
      const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000); // next 48 h

      // Find all deadlines due within the next 48 hours
      const upcoming = await Deadline.find({
        deadline: { $gte: now, $lte: cutoff },
      });

      if (!upcoming.length) return;

      // Batch-load meetings and users referenced by these deadlines
      const meetingIds = [
        ...new Set(upcoming.map((d) => d.meetingId.toString())),
      ];
      const meetings = await Meeting.find({ _id: { $in: meetingIds } }).select(
        'title participants createdBy'
      );

      const meetingMap = new Map(meetings.map((m) => [m._id.toString(), m]));

      // Collect all user IDs from meeting participants + createdBy
      const userIds = new Set<string>();
      meetings.forEach((m) => {
        userIds.add(m.createdBy.toString());
        m.participants.forEach((p) => userIds.add(p.toString()));
      });

      const users = await User.find({ _id: { $in: [...userIds] } }).select(
        'name email'
      );
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));

      // Send one reminder per deadline to the matched user (by assignee name match)
      const sends = upcoming.map(async (dl) => {
        const meeting = meetingMap.get(dl.meetingId.toString());
        if (!meeting) return;

        // Find a user whose name matches the assignee (case-insensitive)
        const assigneeLower = dl.assignee.toLowerCase();
        const user = [...userMap.values()].find(
          (u) => u.name.toLowerCase() === assigneeLower
        );
        if (!user) return; // no matched user — skip silently

        try {
          await sendDeadlineReminder({
            toEmail: user.email,
            toName: user.name,
            description: dl.description,
            assignee: dl.assignee,
            deadline: dl.deadline,
            meetingTitle: meeting.title,
            meetingId: dl.meetingId.toString(),
          });
        } catch (err) {
          console.error(
            `[deadline-reminder] failed for deadline ${dl._id}:`,
            err
          );
        }
      });

      await Promise.allSettled(sends);
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error(
      `[deadline-reminder-worker] job ${job?.id} failed:`,
      err.message
    );
  });

  return worker;
}
