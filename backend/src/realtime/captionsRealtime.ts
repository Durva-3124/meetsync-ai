import type { Server as SocketIOServer, Socket } from 'socket.io';

import { verifyToken } from '../utils/auth.js';
import { Meeting } from '../models/Meeting.js';

import type { TranscriptSegment } from '../integrations/ai/aiClient.js';

type CaptionSegmentPayload = {
  meetingId: string;
  index: number;
  segment: TranscriptSegment;
  emittedAt: string;
};

type CaptionsReadyPayload = {
  meetingId: string;
  processingStatus: string;
  hasTranscript: boolean;
};

type CaptionsDonePayload = {
  meetingId: string;
  total: number;
  doneAt: string;
};

type SocketData = {
  user?: {
    sub: string;
    email: string;
    role: 'employee' | 'reviewer' | 'admin';
  };
  meetingId?: string;
};

let io: SocketIOServer | null = null;

function getMeetingIdFromNamespace(namespaceName: string): string | null {
  // namespaceName like: /ws/captions/<meetingId>
  const parts = namespaceName.split('/').filter(Boolean);
  if (parts.length < 3) return null;
  return parts[2] ?? null;
}

function isAuthorizedEmployeeForMeeting(meeting: any, userId: string): boolean {
  const meetingCreatorId = meeting.createdBy?.toString?.() ?? String(meeting.createdBy);
  const participantIds: string[] = Array.isArray(meeting.participants)
    ? meeting.participants.map((p: any) => p?.toString?.() ?? String(p))
    : [];

  const isParticipant = participantIds.includes(userId);
  const isCreator = meetingCreatorId === userId;
  return isParticipant || isCreator;
}

export function initCaptions(ioServer: SocketIOServer): void {
  io = ioServer;

  // Regex namespaces allow us to treat "/ws/captions/:meetingId" as a namespace.
  // Socket.IO will create a namespace per match.
  const nsp = io.of(/^\/ws\/captions\/(.+)$/);

  nsp.use(async (socket: Socket<unknown, any, unknown, SocketData>, next) => {
    try {
      const meetingId = getMeetingIdFromNamespace(socket.nsp.name);
      if (!meetingId) return next(new Error('MEETING_NOT_FOUND'));

      const token =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        (typeof socket.handshake.query === 'object' && socket.handshake.query
          ? (socket.handshake.query as any).token
          : undefined);

      if (!token || typeof token !== 'string') {
        return next(new Error('UNAUTHORIZED'));
      }

      const payload = verifyToken(token, 'access');

      const meeting = await Meeting.findById(meetingId).select('participants createdBy processingStatus transcript');
      if (!meeting) return next(new Error('MEETING_NOT_FOUND'));

      if (payload.role === 'employee') {
        const allowed = isAuthorizedEmployeeForMeeting(meeting, payload.sub);
        if (!allowed) return next(new Error('ACCESS_DENIED'));
      }

      socket.data.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      socket.data.meetingId = meetingId;

      return next();
    } catch (err) {
      return next(new Error('UNAUTHORIZED'));
    }
  });

  nsp.on('connection', async (socket: Socket<unknown, any, unknown, SocketData>) => {
    const meetingId = socket.data.meetingId!;

    socket.join(meetingId);

    const meeting = await Meeting.findById(meetingId).select('processingStatus transcript');
    const processingStatus = meeting?.processingStatus ?? 'pending';
    const transcript = (meeting?.transcript ?? []) as TranscriptSegment[];

    const ready: CaptionsReadyPayload = {
      meetingId,
      processingStatus,
      hasTranscript: Array.isArray(transcript) && transcript.length > 0,
    };

    socket.emit('captions:ready', ready);

    // If the meeting is already completed (or transcript exists), replay transcript so the UI can render.
    if (transcript.length > 0) {
      transcript.forEach((segment, index) => {
        const payload: CaptionSegmentPayload = {
          meetingId,
          index,
          segment,
          emittedAt: new Date().toISOString(),
        };
        socket.emit('captions:segment', payload);
      });

      const donePayload: CaptionsDonePayload = {
        meetingId,
        total: transcript.length,
        doneAt: new Date().toISOString(),
      };
      socket.emit('captions:done', donePayload);
    }

    socket.on('disconnect', () => {
      // no-op
    });
  });
}

export async function streamCaptionsToRoom(
  meetingId: string,
  transcript: TranscriptSegment[],
  opts?: { delayMs?: number; emitDone?: boolean }
): Promise<void> {
  const delayMs = opts?.delayMs ?? 180;
  const emitDone = opts?.emitDone ?? true;

  if (!io) return;
  if (!Array.isArray(transcript) || transcript.length === 0) {
    if (emitDone) {
      const donePayload: CaptionsDonePayload = {
        meetingId,
        total: 0,
        doneAt: new Date().toISOString(),
      };
      io.to(meetingId).emit('captions:done', donePayload);
    }
    return;
  }

  // Emit sequentially so the frontend can animate line-by-line.
  for (let i = 0; i < transcript.length; i++) {
    const segment = transcript[i];

    const payload: CaptionSegmentPayload = {
      meetingId,
      index: i,
      segment,
      emittedAt: new Date().toISOString(),
    };

    io.to(meetingId).emit('captions:segment', payload);
    await new Promise((r) => setTimeout(r, delayMs));
  }

  if (emitDone) {
    const donePayload: CaptionsDonePayload = {
      meetingId,
      total: transcript.length,
      doneAt: new Date().toISOString(),
    };
    io.to(meetingId).emit('captions:done', donePayload);
  }
}
