import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendee {
  userId: Types.ObjectId;
  name: string;
  role: 'organizer' | 'participant';
  speakingDuration?: number;
  turnsTaken?: number;
}

export interface IKeyPoint {
  _id: Types.ObjectId;
  source: 'ai' | 'manual';
  category: 'decision' | 'milestone' | 'blocker' | 'general';
  text: string;
  speaker?: string;
  timestamp?: number;
  relatedTaskIds?: Types.ObjectId[];
  citations?: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface IDraftActionItem {
  _id: Types.ObjectId;
  source: 'ai' | 'manual';
  task: string;
  assignee: string;
  assigneeUserId?: Types.ObjectId;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status: 'draft' | 'assigned' | 'in_progress' | 'done';
  requiredSkills?: string[];
  relatedDecisions?: Types.ObjectId[];
  citations?: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface IMom extends Document {
  meetingId: Types.ObjectId;
  title: string; // from Meeting.title
  attendees: IAttendee[];
  summary: string; // Rich text
  keyPoints: IKeyPoint[];
  draftActionItems: IDraftActionItem[];
  source: 'ai' | 'manual';
  version: number; // Incremented with ReviewVersion updates
  metrics?: {
    transcriptAccuracy?: number;
    summaryCoherence?: number;
    actionItemsExtraction?: number;
  };
  // Deprecated fields (kept for backwards compatibility during migration)
  agenda?: string[];
  discussionPoints?: { speaker: string; point: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const attendeeSchema = new Schema<IAttendee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['organizer', 'participant'], required: true },
    speakingDuration: { type: Number, min: 0 },
    turnsTaken: { type: Number, min: 0 },
  },
  { _id: false }
);

const citationSchema = new Schema<{ start: number; end: number; text: string }>(
  {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const keyPointSchema = new Schema<IKeyPoint>(
  {
    source: { type: String, enum: ['ai', 'manual'], required: true },
    category: {
      type: String,
      enum: ['decision', 'milestone', 'blocker', 'general'],
      required: true,
    },
    text: { type: String, required: true },
    speaker: { type: String },
    timestamp: { type: Number, min: 0 },
    relatedTaskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    citations: [citationSchema],
  },
  { timestamps: false }
);

const draftActionItemSchema = new Schema<IDraftActionItem>(
  {
    source: { type: String, enum: ['ai', 'manual'], required: true },
    task: { type: String, required: true },
    assignee: { type: String, required: true },
    assigneeUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: String },
    priority: { type: String, enum: ['high', 'medium', 'low'] },
    status: {
      type: String,
      enum: ['draft', 'assigned', 'in_progress', 'done'],
      default: 'draft',
    },
    requiredSkills: [String],
    relatedDecisions: [{ type: Schema.Types.ObjectId }], // refs to keyPoints._id
    citations: [citationSchema],
  },
  { timestamps: false }
);

const momSchema = new Schema<IMom>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    attendees: { type: [attendeeSchema], default: [] },
    summary: { type: String, required: true },
    keyPoints: { type: [keyPointSchema], default: [] },
    draftActionItems: { type: [draftActionItemSchema], default: [] },
    source: { type: String, enum: ['ai', 'manual'], default: 'ai' },
    version: { type: Number, default: 1 },
    metrics: {
      transcriptAccuracy: { type: Number, min: 0, max: 100 },
      summaryCoherence: { type: Number, min: 0, max: 100 },
      actionItemsExtraction: { type: Number, min: 0, max: 100 },
    },
    // Deprecated
    agenda: { type: [String], default: [] },
    discussionPoints: [{ speaker: String, point: String }],
  },
  { timestamps: true }
);

momSchema.index({ meetingId: 1 });

export const Mom = model<IMom>('Mom', momSchema);
