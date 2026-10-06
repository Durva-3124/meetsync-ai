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
