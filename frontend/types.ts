export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
  tenant: string;
}

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
  ragConfidence: number;
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

export interface MeetingSummaryItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  department: string;
  attendeesCount: number;
  attendees: string[];
  status: Meeting['status'];
  decisionAccuracy: number;
  actionItemsCount: number;
  pendingItemsCount: number;
  summaryPreview: string;
  locked: boolean;
}

export interface AnalyticsData {
  kpis: {
    totalMeetings: {
      value: number;
      change: string;
      subtitle: string;
    };
    actionItems: {
      pending: number;
      total: number;
      closureRate: string;
      avgDaysToDone: string;
      subtitle: string;
    };
    decisionAccuracy: {
      value: string;
      change: string;
      subtitle: string;
    };
    avgDuration: {
      value: string;
      timeSaved: string;
      median: string;
      subtitle: string;
    };
  };
  quota: {
    usedHours: number;
    totalHours: number;
    percentage: number;
    status: string;
    feature: string;
  };
}

export type ThemeMode = 'dark' | 'light';
export type ActiveTab = 'dashboard' | 'editor' | 'traceability' | 'settings' | 'landing';
