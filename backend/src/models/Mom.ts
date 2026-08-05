import { Schema, model, Document, Types } from 'mongoose';

export interface IMom extends Document {
  meetingId: Types.ObjectId;
  agenda: string[];
  discussionPoints: { speaker: string; point: string }[];
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const momSchema = new Schema<IMom>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
    },
    agenda: { type: [String], default: [] },
    discussionPoints: [{ speaker: String, point: String }],
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

export const Mom = model<IMom>('Mom', momSchema);
