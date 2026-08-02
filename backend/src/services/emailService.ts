import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Lazy singleton — transporter created on first use so tests that never send
// email don't open SMTP connections.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
  }
  return _transporter;
}

export interface TaskNotificationPayload {
  toEmail: string;
  toName: string;
  taskDescription: string;
  assignee: string;
  dueDate?: string;
  meetingTitle: string;
  meetingId: string;
  taskId: string;
  // source_span passed through untouched for FE Explainable-AI panel
  sourceSpan?: { start: number; end: number; text: string };
}

export interface DeadlineReminderPayload {
  toEmail: string;
  toName: string;
  description: string;
  assignee: string;
  deadline: Date;
  meetingTitle: string;
  meetingId: string;
}

export async function sendTaskNotification(
  p: TaskNotificationPayload
): Promise<void> {
  const spanNote = p.sourceSpan
    ? `\n\nSource excerpt (${p.sourceSpan.start}s–${p.sourceSpan.end}s): "${p.sourceSpan.text}"`
    : '';

  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: `${p.toName} <${p.toEmail}>`,
    subject: `Action item assigned: ${p.taskDescription}`,
    text: [
      `Hi ${p.toName},`,
      ``,
      `You have been assigned a task from the meeting "${p.meetingTitle}":`,
      ``,
      `  Task    : ${p.taskDescription}`,
      `  Assignee: ${p.assignee}`,
      `  Due     : ${p.dueDate ?? 'Not specified'}`,
      `  Task ID : ${p.taskId}`,
      spanNote,
      ``,
      `Please log in to MeetSync to view full details.`,
    ].join('\n'),
    html: `
      <p>Hi ${p.toName},</p>
      <p>You have been assigned a task from the meeting <strong>${p.meetingTitle}</strong>:</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Task</strong></td><td>${p.taskDescription}</td></tr>
        <tr><td><strong>Assignee</strong></td><td>${p.assignee}</td></tr>
        <tr><td><strong>Due</strong></td><td>${p.dueDate ?? 'Not specified'}</td></tr>
        <tr><td><strong>Task ID</strong></td><td><code>${p.taskId}</code></td></tr>
        ${p.sourceSpan ? `<tr><td><strong>Source</strong></td><td><em>${p.sourceSpan.start}s–${p.sourceSpan.end}s:</em> "${p.sourceSpan.text}"</td></tr>` : ''}
      </table>
      <p>Please log in to MeetSync to view full details.</p>
    `,
  });
}

export async function sendDeadlineReminder(
  p: DeadlineReminderPayload
): Promise<void> {
  const daysLeft = Math.ceil(
    (p.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const dueStr = p.deadline.toISOString().slice(0, 10);

  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: `${p.toName} <${p.toEmail}>`,
    subject: `Deadline reminder: ${p.description} (due ${dueStr})`,
    text: [
      `Hi ${p.toName},`,
      ``,
      `This is a reminder that the following deadline is approaching:`,
      ``,
      `  Description: ${p.description}`,
      `  Assignee   : ${p.assignee}`,
      `  Due date   : ${dueStr} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} away)`,
      `  Meeting    : ${p.meetingTitle}`,
      ``,
      `Please log in to MeetSync to view full details.`,
    ].join('\n'),
    html: `
      <p>Hi ${p.toName},</p>
      <p>This is a reminder that the following deadline is approaching:</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Description</strong></td><td>${p.description}</td></tr>
        <tr><td><strong>Assignee</strong></td><td>${p.assignee}</td></tr>
        <tr><td><strong>Due date</strong></td><td>${dueStr} <em>(${daysLeft} day${daysLeft !== 1 ? 's' : ''} away)</em></td></tr>
        <tr><td><strong>Meeting</strong></td><td>${p.meetingTitle}</td></tr>
      </table>
      <p>Please log in to MeetSync to view full details.</p>
    `,
  });
}
