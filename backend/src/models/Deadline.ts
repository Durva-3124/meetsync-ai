import { Schema, model, Document, Types } from 'mongoose';

export interface IDeadline extends Document {
  meetingId: Types.ObjectId;
  description: string;
  assignee: string;
  deadline: Date;
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
}

const deadlineSchema = new Schema<IDeadline>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    description: { type: String, required: true },
    assignee: { type: String, required: true },
    deadline: { type: Date, required: true },
    rawText: { type: String, required: true },
  },
  { timestamps: true },
);

deadlineSchema.index({ meetingId: 1 });

export const Deadline = model<IDeadline>('Deadline', deadlineSchema);
