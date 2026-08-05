import { Schema, model, Document, Types } from 'mongoose';

export const PROCESSING_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;
export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export interface IMeeting extends Document {
  title: string;
  description?: string;
  scheduledAt: Date;
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  processingStatus: ProcessingStatus;
  audioFileUrl?: string;
  transcript?: { speaker: string; start: number; end: number; text: string }[];
  summary?: string;
  actionItems?: { assignee: string; task: string; dueDate?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    scheduledAt: { type: Date, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    processingStatus: {
      type: String,
      enum: PROCESSING_STATUSES,
      default: 'pending',
    },
    audioFileUrl: { type: String },
    transcript: [
      {
        speaker: String,
        start: Number,
        end: Number,
        text: String,
      },
    ],
    summary: { type: String },
    actionItems: [
      {
        assignee: String,
        task: String,
        dueDate: String,
      },
    ],
  },
  { timestamps: true }
);

export const Meeting = model<IMeeting>('Meeting', meetingSchema);
