import { Schema, model, Document, Types } from 'mongoose';

export type FieldSource = 'ai' | 'manual';

export interface DiffHunkDoc {
  op: 'unchanged' | 'removed' | 'added';
  value: string;
}

export interface ReviewedField {
  field: string; // e.g. "summary", "agenda", "decisions[0].rationale"
  source: FieldSource; // 'ai' = untouched AI draft, 'manual' = reviewer edited
  original: string; // AI-generated value (serialised to string)
  edited: string; // reviewer's value (same as original if untouched)
  diff: DiffHunkDoc[]; // word/element-level diff hunks
}

export interface IReviewVersion extends Document {
  meetingId: Types.ObjectId;
  version: number; // monotonically incrementing per meeting
  reviewedBy: Types.ObjectId; // User who submitted this review
  fields: ReviewedField[];
  locked: boolean; // true = no further edits allowed
  lockedAt?: Date;
  lockedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const diffHunkSchema = new Schema<DiffHunkDoc>(
  {
    op: {
      type: String,
      enum: ['unchanged', 'removed', 'added'],
      required: true,
    },
    value: { type: String, required: true },
  },
  { _id: false }
);

const reviewedFieldSchema = new Schema<ReviewedField>(
  {
    field: { type: String, required: true },
    source: { type: String, enum: ['ai', 'manual'], required: true },
    original: { type: String, required: true },
    edited: { type: String, required: true },
    diff: { type: [diffHunkSchema], default: [] },
  },
  { _id: false }
);

const reviewVersionSchema = new Schema<IReviewVersion>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    version: { type: Number, required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fields: { type: [reviewedFieldSchema], default: [] },
    locked: { type: Boolean, default: false },
    lockedAt: { type: Date },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reviewVersionSchema.index({ meetingId: 1, version: -1 });
// Enforce uniqueness of version per meeting
reviewVersionSchema.index({ meetingId: 1, version: 1 }, { unique: true });

export const ReviewVersion = model<IReviewVersion>(
  'ReviewVersion',
  reviewVersionSchema
);
