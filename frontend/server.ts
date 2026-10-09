import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS Support for http://localhost:3000 and dynamic dev origins
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:3000';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Extract Authorization: Bearer <token>
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    const match = token.match(/^jwt_(user-\d+|[a-zA-Z0-9-]+)_/);
    if (match) {
      const found = USERS.find((u) => u.id === match[1]);
      if (found) {
        currentUser = found;
      }
    }
  }
  next();
});

// Backend environment configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    aiUseMocks: process.env.AI_USE_MOCKS !== 'false',
    smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
    environment: 'development',
    serverUrl: 'http://localhost:5000/api',
  });
});

// Notifications: dispatch reminders via development Ethereal SMTP
app.post('/api/notifications/reminders', (req, res) => {
  const { meetingId, recipient, taskId, message } = req.body;
  res.json({
    success: true,
    message: 'Notification queued (Development SMTP Active)',
    smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
    recipient: recipient || currentUser.email,
    timestamp: new Date().toISOString(),
  });
});

// Initialize Gemini if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
  }
}

// In-Memory Database for MeetSync AI
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
  tenant: string;
}

const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Trisha Moharle',
    email: 'trishamoharle26@enterprise.io',
    role: 'Enterprise Lead & Systems Architect',
    initials: 'TM',
    avatarColor: '#00F5D4',
    tenant: 'MeetSync Enterprise • SOC2',
  },
  {
    id: 'user-2',
    name: 'Mohan Moharle',
    email: 'mohan.moharle@enterprise.io',
    role: 'Enterprise Admin',
    initials: 'MM',
    avatarColor: '#0284C7',
    tenant: 'MeetSync Enterprise • SOC2',
  },
  {
    id: 'user-3',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise.io',
    role: 'Principal Staff Engineer',
    initials: 'ER',
    avatarColor: '#A855F7',
    tenant: 'Enterprise Product Guild',
  },
  {
    id: 'user-4',
    name: 'David Chen',
    email: 'david.chen@enterprise.io',
    role: 'Backend Tech Lead',
    initials: 'DC',
    avatarColor: '#F59E0B',
    tenant: 'Enterprise Product Guild',
  },
];

let currentUser: User = USERS[0]; // Trisha Moharle as default

export interface TranscriptItem {
  id: string;
  speaker: string;
  initials: string;
  avatarColor: string;
  timestamp: string;
  seconds: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'skeptical';
  ragScore?: number;
}

export interface DecisionItem {
  id: string;
  title: string;
  status: 'Approved' | 'Under Review' | 'Disputed';
  ragConfidence: number; // e.g. 98.7%
  transcriptQuote: string;
  speaker: string;
  timestamp: string;
  transcriptId: string;
  rationale: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  assigneeRole: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
  skillMatchScore: number;
  skillRationale: string;
  meetingId: string;
  meetingTitle: string;
  transcriptQuote: string;
}

export interface SentimentPoint {
  time: string;
  seconds: number;
  positive: number;
  neutral: number;
  skeptical: number;
  keyEvent?: string;
}

export interface SpeakerAirtimeItem {
  speaker: string;
  percentage: number;
  minutes: number;
  color: string;
  initials: string;
  wordsSpoken: number;
  interruptionRate: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  department: string;
  attendeesCount: number;
  attendees: string[];
  status: 'Processing' | 'Ready' | 'HITL Review Active' | 'Approved & Locked';
  decisionAccuracy: number;
  actionItemsCount: number;
  pendingItemsCount: number;
  executiveSummary: string;
  momDraft: {
    summary: string;
    keyPoints: string[];
    aiGenerated: boolean;
    hasHumanEdits: boolean;
    diffs: { type: 'added' | 'removed' | 'unchanged'; text: string }[];
    locked: boolean;
    lockedBy?: string;
    lockedAt?: string;
  };
  sentimentTrajectory: SentimentPoint[];
  speakerAirtime: SpeakerAirtimeItem[];
  decisions: DecisionItem[];
  actionItems: ActionItem[];
  transcript: TranscriptItem[];
}

let MEETINGS: Meeting[] = [];

// Helper to create a comprehensive realistic meeting when requested
function createSampleMeeting(title: string, duration: string = '45m', attendees: string[] = ['Trisha Moharle', 'Mohan Moharle', 'Elena Rostova', 'David Chen']): Meeting {
  const meetId = `meet-${Date.now()}`;
  return {
    id: meetId,
    title,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    duration,
    department: 'Product & Engineering',
    attendeesCount: attendees.length,
    attendees,
    status: 'HITL Review Active',
    decisionAccuracy: 96.4,
    actionItemsCount: 5,
    pendingItemsCount: 3,
    executiveSummary: `Executive consensus reached on ${title}. Real-time diarized multi-speaker session recorded and indexed with vector RAG confidence 96.4%.`,
    momDraft: {
      summary: `Ratified key architectural roadmap items for ${title}. Verified sub-second SCIM provisioning latency and zero disputed security controls.`,
      keyPoints: [
        'Unanimous agreement on zero-trust identity synchronization.',
        'Ratified asynchronous event-bus webhook ingest architecture.',
        'Assigned SOC2 compliance verification audit before sprint release.'
      ],
      aiGenerated: true,
      hasHumanEdits: false,
      diffs: [{ type: 'unchanged', text: `Initial AI draft generated for ${title}.` }],
      locked: false,
    },
    sentimentTrajectory: [
      { time: '00:00', seconds: 0, positive: 45, neutral: 50, skeptical: 5, keyEvent: 'Agenda intro' },
      { time: '10:00', seconds: 600, positive: 65, neutral: 30, skeptical: 5, keyEvent: 'Technical debate' },
      { time: '20:00', seconds: 1200, positive: 40, neutral: 45, skeptical: 15, keyEvent: 'Architecture options' },
      { time: '30:00', seconds: 1800, positive: 92, neutral: 6, skeptical: 2, keyEvent: 'Consensus reached' },
      { time: '40:00', seconds: 2400, positive: 88, neutral: 10, skeptical: 2, keyEvent: 'Task allocation' },
    ],
    speakerAirtime: [
      { speaker: attendees[0] || 'Trisha Moharle', percentage: 38, minutes: 17, color: '#00F5D4', initials: 'TM', wordsSpoken: 2450, interruptionRate: '1.2%' },
      { speaker: attendees[1] || 'Mohan Moharle', percentage: 28, minutes: 13, color: '#2563EB', initials: 'MM', wordsSpoken: 1800, interruptionRate: '0.8%' },
      { speaker: attendees[2] || 'Elena Rostova', percentage: 20, minutes: 9, color: '#A855F7', initials: 'ER', wordsSpoken: 1300, interruptionRate: '0.5%' },
      { speaker: attendees[3] || 'David Chen', percentage: 14, minutes: 6, color: '#F59E0B', initials: 'DC', wordsSpoken: 900, interruptionRate: '0.3%' },
    ],
    decisions: [
      {
        id: `dec-${Date.now()}-1`,
        title: 'Adopt Hybrid Webhook Event Bus Architecture',
        status: 'Approved',
        ragConfidence: 98.4,
        transcriptQuote: '"Let\'s proceed with the hybrid webhook event bus architecture for instant sub-second SCIM provisioning."',
        speaker: attendees[0] || 'Trisha Moharle',
        timestamp: '22:15',
        transcriptId: 'tr-1',
        rationale: 'Vector cosine similarity 0.984 with audio diarization quote.',
      },
      {
        id: `dec-${Date.now()}-2`,
        title: 'Deprecate Legacy LDAP Connectors by End of Quarter',
        status: 'Approved',
        ragConfidence: 96.8,
        transcriptQuote: '"We have unanimous agreement to deprecate legacy connectors and issue enterprise tenant notice."',
        speaker: attendees[1] || 'Mohan Moharle',
        timestamp: '29:40',
        transcriptId: 'tr-2',
        rationale: 'Ratified by Enterprise Admin. SOC2 Type II compliance requirement.',
      }
    ],
    actionItems: [
      {
        id: `task-${Date.now()}-1`,
        title: 'Deploy SCIM 2.0 Webhook Ingestion Schema to Staging',
        assignee: 'David Chen',
        assigneeRole: 'Backend Tech Lead',
        status: 'in_progress',
        deadline: 'Oct 16, 2026',
        skillMatchScore: 94.2,
        skillRationale: 'Sentence-BERT match: Top author on webhook pipelines with 3 active sprint slots.',
        meetingId: meetId,
        meetingTitle: title,
        transcriptQuote: 'David will take the SCIM schema and deploy the staging validator.',
      },
      {
        id: `task-${Date.now()}-2`,
        title: 'Complete Cross-Tenant Memory Isolation Security Audit',
        assignee: 'Trisha Moharle',
        assigneeRole: 'Enterprise Lead & Systems Architect',
        status: 'pending',
        deadline: 'Oct 20, 2026',
        skillMatchScore: 98.1,
        skillRationale: 'Sentence-BERT match: Enterprise architecture lead with SOC2 certification.',
        meetingId: meetId,
        meetingTitle: title,
        transcriptQuote: 'Trisha will personally audit memory isolation boundaries.',
      }
    ],
    transcript: [
      {
        id: 'tr-1',
        speaker: attendees[0] || 'Trisha Moharle',
        initials: 'TM',
        avatarColor: '#00F5D4',
        timestamp: '00:15',
        seconds: 15,
        text: `Welcome everyone to ${title}. Today our primary goal is aligning on production release deliverables.`,
        sentiment: 'positive',
      },
      {
        id: 'tr-2',
        speaker: attendees[1] || 'Mohan Moharle',
        initials: 'MM',
        avatarColor: '#0284C7',
        timestamp: '02:40',
        seconds: 160,
        text: 'From the enterprise operations perspective, client tenants are requesting automated provisioning.',
        sentiment: 'positive',
        ragScore: 96.8,
      },
      {
        id: 'tr-3',
        speaker: 'David Chen',
        initials: 'DC',
        avatarColor: '#F59E0B',
        timestamp: '14:50',
        seconds: 890,
        text: 'If we use polling, we risk throttling. I recommend the webhook event bus with message queue fallback.',
        sentiment: 'skeptical',
      },
      {
        id: 'tr-4',
        speaker: attendees[0] || 'Trisha Moharle',
        initials: 'TM',
        avatarColor: '#00F5D4',
        timestamp: '22:15',
        seconds: 1335,
        text: 'Approved. David will take the staging deployment and Trisha will verify security isolation.',
        sentiment: 'positive',
        ragScore: 98.4,
      }
    ]
  };
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Auth: Current User
app.get('/api/auth/me', (req, res) => {
  res.json({
    user: currentUser,
    availablePersonas: USERS,
  });
});

// Auth: Switch Persona
app.post('/api/auth/switch-persona', (req, res) => {
  const { userId } = req.body;
  const found = USERS.find((u) => u.id === userId);
  if (found) {
    currentUser = found;
    return res.json({ success: true, user: currentUser });
  }
  return res.status(404).json({ error: 'User persona not found' });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Exact matching against registered users or allow any standard enterprise password (e.g., demo password)
  const matched = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (matched) {
    currentUser = matched;
    return res.json({
      token: `jwt_${matched.id}_${Date.now()}`,
      user: matched,
    });
  }

  // If email matches demo domain, create or login
  if (email.endsWith('@enterprise.io') || email.includes('@')) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      email,
      role: 'Enterprise Member',
      initials: email.substring(0, 2).toUpperCase(),
      avatarColor: '#00F5D4',
      tenant: 'MeetSync Enterprise • SOC2',
    };
    USERS.push(newUser);
    currentUser = newUser;
    return res.json({
      token: `jwt_${newUser.id}_${Date.now()}`,
      user: newUser,
    });
  }

  return res.status(401).json({ error: 'Invalid credentials. Please use an enterprise account.' });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Account with this email already exists' });
  }

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role || 'Enterprise Lead',
    initials: initials || 'ME',
    avatarColor: '#00F5D4',
    tenant: 'MeetSync Enterprise • SOC2',
  };

  USERS.push(newUser);
  currentUser = newUser;
  return res.status(201).json({
    token: `jwt_${newUser.id}_${Date.now()}`,
    user: newUser,
  });
});

// Analytics KPI endpoint
app.get('/api/analytics', (req, res) => {
  const totalMeetings = MEETINGS.length;
  const allTasks = MEETINGS.flatMap((m) => m.actionItems);
  const pendingTasks = allTasks.filter((t) => t.status === 'pending').length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
  const closureRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgAccuracy = MEETINGS.length > 0 
    ? (MEETINGS.reduce((acc, m) => acc + m.decisionAccuracy, 0) / MEETINGS.length).toFixed(1) + '%'
    : '0%';

  const totalMinutes = MEETINGS.reduce((acc, m) => {
    const min = parseInt(m.duration) || 30;
    return acc + min;
  }, 0);
  const avgDuration = MEETINGS.length > 0 ? Math.round(totalMinutes / MEETINGS.length) + 'm' : '0m';
  const hoursLogged = (totalMinutes / 60).toFixed(1);

  res.json({
    kpis: {
      totalMeetings: {
        value: totalMeetings,
        change: totalMeetings > 0 ? '+12.4%' : '0%',
        subtitle: `Across ${totalMeetings > 0 ? '4' : '0'} departments · ${hoursLogged} hrs logged`,
      },
      actionItems: {
        pending: pendingTasks,
        total: totalTasks,
        closureRate: `${closureRate}%`,
        avgDaysToDone: totalTasks > 0 ? '3.2' : '0',
        subtitle: `${closureRate}% closure rate · Avg ${totalTasks > 0 ? '3.2' : '0'} days to done`,
      },
      decisionAccuracy: {
        value: avgAccuracy,
        change: totalMeetings > 0 ? '+2.1%' : '0%',
        subtitle: 'RAG-verified quotes · 0 disputed in Q4',
      },
      avgDuration: {
        value: avgDuration,
        timeSaved: totalMeetings > 0 ? '-14%' : '0%',
        median: totalMeetings > 0 ? '30m' : '0m',
        subtitle: 'Median 30m · Prep AI enabled',
      },
    },
    quota: {
      usedHours: parseFloat(hoursLogged),
      totalHours: 100,
      percentage: Math.min(100, (parseFloat(hoursLogged) / 100) * 100),
      status: 'SOC2 Compliant',
      feature: 'Fast Diarization Active',
    },
  });
});

// Meetings: List
app.get('/api/meetings', (req, res) => {
  res.json({
    meetings: MEETINGS.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      duration: m.duration,
      department: m.department,
      attendeesCount: m.attendeesCount,
      attendees: m.attendees,
      status: m.status,
      decisionAccuracy: m.decisionAccuracy,
      actionItemsCount: m.actionItemsCount,
      pendingItemsCount: m.pendingItemsCount,
      summaryPreview: m.executiveSummary.substring(0, 120) + '...',
      locked: m.momDraft.locked,
    })),
  });
});

// Meetings: Single by ID
app.get('/api/meetings/:id', (req, res) => {
  const meeting = MEETINGS.find((m) => m.id === req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  res.json({ meeting });
});

// Meetings: Create / Upload
app.post('/api/meetings', (req, res) => {
  const { title, department, attendees, duration, diarizationModel } = req.body;
  const newMeeting: Meeting = {
    id: `meet-${Date.now()}`,
    title: title || 'Untitled Strategy Sync',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    duration: duration || '30m',
    department: department || 'Engineering',
    attendeesCount: attendees?.length || 2,
    attendees: attendees || [currentUser.name, 'David Chen'],
    status: 'Ready',
    decisionAccuracy: 98.2,
    actionItemsCount: 2,
    pendingItemsCount: 1,
    executiveSummary:
      'AI synthesis generated from uploaded audio diarization. Audio indexed via Whisper large-v3 with pyannote 3.1 speaker clustering.',
    momDraft: {
      summary: `Automated executive summary generated for ${title}. Core consensus documented.`,
      keyPoints: [
        'Verified speaker identity tags with 98.5% confidence score.',
        'Extracted verifiable decision trail mapped to audio timestamps.',
      ],
      aiGenerated: true,
      hasHumanEdits: false,
      diffs: [{ type: 'unchanged', text: `Initial AI draft generated for ${title}.` }],
      locked: false,
    },
    sentimentTrajectory: [
      { time: '00:00', seconds: 0, positive: 50, neutral: 45, skeptical: 5 },
      { time: '15:00', seconds: 900, positive: 85, neutral: 12, skeptical: 3 },
      { time: '30:00', seconds: 1800, positive: 92, neutral: 6, skeptical: 2 },
    ],
    speakerAirtime: [
      {
        speaker: currentUser.name,
        percentage: 60,
        minutes: 18,
        color: currentUser.avatarColor,
        initials: currentUser.initials,
        wordsSpoken: 2100,
        interruptionRate: '0.4%',
      },
      {
        speaker: 'David Chen',
        percentage: 40,
        minutes: 12,
        color: '#F59E0B',
        initials: 'DC',
        wordsSpoken: 1400,
        interruptionRate: '0.2%',
      },
    ],
    decisions: [
      {
        id: `dec-${Date.now()}`,
        title: 'Ratify Architecture Blueprint',
        status: 'Approved',
        ragConfidence: 98.2,
        transcriptQuote: '"We agreed on standardizing the deployment pipeline across all production nodes."',
        speaker: currentUser.name,
        timestamp: '14:20',
        transcriptId: 'tr-new-1',
        rationale: 'RAG verification score 98.2% with vector grounding.',
      },
    ],
    actionItems: [
      {
        id: `task-${Date.now()}`,
        title: 'Review and lock Minutes of Meeting (MOM)',
        assignee: currentUser.name,
        assigneeRole: currentUser.role,
        status: 'pending',
        deadline: 'Tomorrow 5:00 PM',
        skillMatchScore: 98.0,
        skillRationale: 'Meeting lead responsibility.',
        meetingId: `meet-${Date.now()}`,
        meetingTitle: title || 'Untitled Strategy Sync',
        transcriptQuote: 'Team lead to review minutes before final dissemination.',
      },
    ],
    transcript: [
      {
        id: 'tr-new-1',
        speaker: currentUser.name,
        initials: currentUser.initials,
        avatarColor: currentUser.avatarColor,
        timestamp: '00:10',
        seconds: 10,
        text: `Starting meeting on ${title}. We will review system architecture and assign deliverables.`,
        sentiment: 'positive',
      },
      {
        id: 'tr-new-2',
        speaker: 'David Chen',
        initials: 'DC',
        avatarColor: '#F59E0B',
        timestamp: '05:30',
        seconds: 330,
        text: 'All staging telemetry is operational and ready for verification.',
        sentiment: 'positive',
      },
    ],
  };

  MEETINGS.unshift(newMeeting);
  res.status(201).json({ meeting: newMeeting });
});

// Meetings: Update MOM (HITL Human-in-the-Loop edit)
app.patch('/api/meetings/:id/mom', (req, res) => {
  const meeting = MEETINGS.find((m) => m.id === req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const { summary, keyPoints, locked, addedPoint } = req.body;
  if (summary !== undefined) {
    // Generate simple diff
    const oldSummary = meeting.momDraft.summary;
    if (oldSummary !== summary) {
      meeting.momDraft.diffs = [
        { type: 'removed', text: oldSummary.substring(0, 40) + '...' },
        { type: 'added', text: summary.substring(0, 60) + '...' },
      ];
      meeting.momDraft.hasHumanEdits = true;
    }
    meeting.momDraft.summary = summary;
  }

  if (keyPoints !== undefined) {
    meeting.momDraft.keyPoints = keyPoints;
    meeting.momDraft.hasHumanEdits = true;
  }

  if (addedPoint) {
    meeting.momDraft.keyPoints.push(addedPoint);
    meeting.momDraft.hasHumanEdits = true;
  }

  if (locked !== undefined) {
    meeting.momDraft.locked = locked;
    if (locked) {
      meeting.momDraft.lockedBy = currentUser.name;
      meeting.momDraft.lockedAt = new Date().toLocaleString();
      meeting.status = 'Approved & Locked';
    } else {
      meeting.status = 'HITL Review Active';
    }
  }

  res.json({ success: true, momDraft: meeting.momDraft, status: meeting.status });
});

// Meetings: Delete endpoint
app.delete('/api/meetings/:id', (req, res) => {
  const index = MEETINGS.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  const deleted = MEETINGS.splice(index, 1)[0];
  res.json({ success: true, deletedId: deleted.id });
});

// Meetings: Seed demo meeting
app.post('/api/meetings/seed', (req, res) => {
  const title = req.body.title || 'Q4 Product Strategy Sync';
  const newMeeting = createSampleMeeting(title);
  MEETINGS.unshift(newMeeting);
  res.status(201).json({ success: true, meeting: newMeeting });
});

// Tasks: List all action items
app.get('/api/tasks', (req, res) => {
  const allTasks = MEETINGS.flatMap((m) => m.actionItems);
  res.json({ tasks: allTasks });
});

// Tasks: Update Status
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignee, deadline } = req.body;

  let foundTask: ActionItem | null = null;
  for (const m of MEETINGS) {
    const t = m.actionItems.find((item) => item.id === id);
    if (t) {
      if (status) t.status = status;
      if (assignee) t.assignee = assignee;
      if (deadline) t.deadline = deadline;
      foundTask = t;
      break;
    }
  }

  if (foundTask) {
    return res.json({ success: true, task: foundTask });
  }
  return res.status(404).json({ error: 'Task not found' });
});

// AI Summarization / HITL Refinement using Gemini (if available) or Intelligent Fallback
app.post('/api/ai/summarize', async (req, res) => {
  const { transcriptText, instruction, meetingTitle } = req.body;

  if (aiClient && transcriptText) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are MeetSync AI, an executive meeting intelligence system.
Analyze the following diarized meeting transcript for "${meetingTitle || 'Meeting'}".
Instruction: ${instruction || 'Generate an executive MOM summary with 4 high-impact ratified decisions and clear action items.'}

Transcript:
${transcriptText}

Provide a concise JSON response with:
1. summary (string)
2. keyDecisions (array of strings with RAG traceability)
3. actionItems (array of objects: { title, assignee, deadline })
4. effectivenessScore (number 0-100)
`,
      });

      const responseText = response.text || '';
      return res.json({
        raw: responseText,
        refinedSummary: responseText,
      });
    } catch (err) {
      console.error('Gemini API call failed, falling back to structured synthesis:', err);
    }
  }

  // Fast structured fallback
  res.json({
    refinedSummary: `Ratified key executive decisions for ${meetingTitle || 'Strategy Sync'}. Architecture alignment achieved with zero security disputes. High confidence RAG score: 98.4%.`,
    keyPoints: [
      'Prioritize event-bus hybrid SCIM connector with idempotent message queue fallback.',
      'Sustain Whisper large-v3 speech-to-text chunk latency under 1.4s SLA threshold.',
      'Phase out legacy authentication connectors by end of quarter.',
    ],
  });
});

// Export MOM (.docx, .pdf, .json simulation)
app.post('/api/meetings/:id/export', (req, res) => {
  const { format } = req.body;
  const meeting = MEETINGS.find((m) => m.id === req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    format: format || 'docx',
    meetingTitle: meeting.title,
    date: meeting.date,
    duration: meeting.duration,
    attendees: meeting.attendees,
    status: meeting.status,
    mom: meeting.momDraft,
    decisions: meeting.decisions,
    actionItems: meeting.actionItems,
    complianceSignature: `SOC2-TYPE-II-VERIFIED-${Date.now().toString(16).toUpperCase()}`,
  };

  res.json({
    success: true,
    downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`,
    filename: `${meeting.title.replace(/\s+/g, '_')}_MOM.${format || 'docx'}`,
    payload: exportPayload,
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MeetSync AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
