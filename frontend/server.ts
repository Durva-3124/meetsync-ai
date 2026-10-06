import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { PRIMARY_MEETING, RECENT_MEETINGS } from './src/mockData';
import { Meeting, ActionItem, MeetingDecision } from './src/lib/api/types';

const app = express();
app.use(express.json());

// In-memory backend database store
const meetingsDb: Map<string, Meeting> = new Map();

// Seed initial backend data
for (const meeting of RECENT_MEETINGS) {
  meetingsDb.set(meeting.id, JSON.parse(JSON.stringify(meeting)));
}
if (!meetingsDb.has(PRIMARY_MEETING.id)) {
  meetingsDb.set(PRIMARY_MEETING.id, JSON.parse(JSON.stringify(PRIMARY_MEETING)));
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// 2. GET /api/meetings - List all meetings
app.get('/api/meetings', (_req: Request, res: Response) => {
  const meetings = Array.from(meetingsDb.values());
  res.json(meetings);
});

// 3. GET /api/meetings/:id - Get single meeting details
app.get('/api/meetings/:id', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({
      error: `Meeting with ID '${req.params.id}' was not found`,
      code: 'NOT_FOUND',
    });
    return;
  }
  res.json(meeting);
});

// 4. PUT /api/meetings/:id - Update meeting
app.put('/api/meetings/:id', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const updatedMeeting: Meeting = { ...meeting, ...req.body };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.json(updatedMeeting);
});

// 5. PATCH /api/meetings/:id/transcript/:segmentId - Update speech turn
app.patch('/api/meetings/:id/transcript/:segmentId', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const { segmentId } = req.params;
  const { text, speakerId, speakerName } = req.body;

  const segmentIndex = meeting.transcript.findIndex((s) => s.id === segmentId);
  if (segmentIndex === -1) {
    res.status(404).json({ error: `Transcript segment '${segmentId}' not found` });
    return;
  }

  const updatedTranscript = [...meeting.transcript];
  updatedTranscript[segmentIndex] = {
    ...updatedTranscript[segmentIndex],
    ...(text !== undefined ? { text } : {}),
    ...(speakerId !== undefined ? { speakerId } : {}),
    ...(speakerName !== undefined ? { speakerName } : {}),
  };

  const updatedMeeting: Meeting = { ...meeting, transcript: updatedTranscript };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.json(updatedMeeting);
});

// 6. POST /api/meetings/:id/action-items - Add action item
app.post('/api/meetings/:id/action-items', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const itemData: Omit<ActionItem, 'id'> = req.body;
  const newItem: ActionItem = {
    ...itemData,
    id: `act-${Date.now()}`,
  };

  const updatedMeeting: Meeting = {
    ...meeting,
    actionItems: [newItem, ...meeting.actionItems],
  };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.status(201).json(updatedMeeting);
});

// 7. PATCH /api/meetings/:id/action-items/:itemId/toggle - Toggle action item
app.patch('/api/meetings/:id/action-items/:itemId/toggle', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const { itemId } = req.params;
  const updatedActionItems = meeting.actionItems.map((item) =>
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );

  const updatedMeeting: Meeting = { ...meeting, actionItems: updatedActionItems };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.json(updatedMeeting);
});

// 8. DELETE /api/meetings/:id/action-items/:itemId - Delete action item
app.delete('/api/meetings/:id/action-items/:itemId', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const { itemId } = req.params;
  const updatedActionItems = meeting.actionItems.filter((item) => item.id !== itemId);

  const updatedMeeting: Meeting = { ...meeting, actionItems: updatedActionItems };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.json(updatedMeeting);
});

// 9. POST /api/meetings/:id/decisions - Add decision
app.post('/api/meetings/:id/decisions', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const decision: MeetingDecision = req.body;
  const updatedMeeting: Meeting = {
    ...meeting,
    decisions: [decision, ...meeting.decisions],
  };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.status(201).json(updatedMeeting);
});

// 10. PATCH /api/meetings/:id/decisions/:decisionId/status - Update decision status
app.patch('/api/meetings/:id/decisions/:decisionId/status', (req: Request, res: Response) => {
  const meeting = meetingsDb.get(req.params.id);
  if (!meeting) {
    res.status(404).json({ error: `Meeting '${req.params.id}' not found` });
    return;
  }
  const { decisionId } = req.params;
  const { status } = req.body;

  const updatedDecisions = meeting.decisions.map((dec) =>
    dec.id === decisionId ? { ...dec, status } : dec
  );

  const updatedMeeting: Meeting = { ...meeting, decisions: updatedDecisions };
  meetingsDb.set(req.params.id, updatedMeeting);
  res.json(updatedMeeting);
});

// ----------------------------------------------------
// VITE MIDDLEWARE SETUP
// ----------------------------------------------------
async function bootstrap() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MeetSync AI API] Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
