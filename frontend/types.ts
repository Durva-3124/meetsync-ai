export interface Speaker {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  department: string;
  color: string;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  isKeyDecision?: boolean;
  sentiment?: 'positive' | 'neutral' | 'skeptical';
  confidenceScore?: number;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  assigneeAvatar?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  originTimestamp?: number;
  relatedDecisionId?: string;
}

export interface MeetingDecision {
  id: string;
  code: string; // e.g. "DEC-104"
  statement: string;
  confidenceScore: number; // 0 - 100
  ragDistance: number; // e.g. 0.12 cosine distance
  citationSegmentId: string;
  citationTimestamp: number;
  citationQuote: string;
  status: 'verified' | 'disputed' | 'superseded';
  category: 'Architecture' | 'Product' | 'Go-to-Market' | 'Resource Allocation';
  consensus: Record<string, 'Approved' | 'Proposed' | 'Neutral' | 'Dissented'>;
  impactedSystems: string[];
}

export interface SentimentDataPoint {
  timeLabel: string;
  minute: number;
  positive: number;
  neutral: number;
  skeptical: number;
}

export interface SpeakerAirtime {
  name: string;
  percentage: number;
  durationSeconds: number;
  color: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  durationSeconds: number;
  organizer: string;
  department: string;
  status: 'Processing' | 'Ready for Review' | 'Approved' | 'Archived';
  attendees: Speaker[];
  summary: string;
  keyTakeaways: string[];
  transcript: TranscriptSegment[];
  actionItems: ActionItem[];
  decisions: MeetingDecision[];
  mediaThumbnailUrl: string;
  sentimentTimeline: SentimentDataPoint[];
  speakerAirtime: SpeakerAirtime[];
}

export type ActiveTab = 'dashboard' | 'mom-editor' | 'traceability' | 'settings';
