import { Schema, model, Document, Types } from 'mongoose';

export interface IDecision extends Document {
  meetingId: Types.ObjectId;
  decision: string;
  madeBy: string;
  rationale?: string;
  createdAt: Date;
  updatedAt: Date;
}

const decisionSchema = new Schema<IDecision>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    decision: { type: String, required: true },
    madeBy: { type: String, required: true },
    rationale: { type: String },
  },
  { timestamps: true }
);

decisionSchema.index({ meetingId: 1 });

export const Decision = model<IDecision>('Decision', decisionSchema);
