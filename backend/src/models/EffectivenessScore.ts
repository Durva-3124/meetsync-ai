import { Schema, model, Document, Types } from 'mongoose';

export interface IEffectivenessScore extends Document {
  meetingId: Types.ObjectId;
  score: number;
  breakdown: {
    decisionsScore: number;
    keyPointsCoverage: number;
    participationBalance: number;
  };
  suggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const effectivenessScoreSchema = new Schema<IEffectivenessScore>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      unique: true,
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    breakdown: {
      decisionsScore: { type: Number, required: true },
      keyPointsCoverage: { type: Number, required: true },
      participationBalance: { type: Number, required: true },
    },
    suggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const EffectivenessScore = model<IEffectivenessScore>(
  'EffectivenessScore',
  effectivenessScoreSchema
);
