import { Schema, model, Document, Types } from 'mongoose';

export type ExportFormat = 'docx' | 'pdf';
export type ExportStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface IAuditMarker {
  field: string;
  source: 'ai' | 'manual';
  reviewVersion: number;
  reviewedBy: string;
}

export interface IExportJob extends Document {
  meetingId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  format: ExportFormat;
  status: ExportStatus;
  filePath?: string;
  errorMessage?: string;
  auditMarkers: IAuditMarker[];
  createdAt: Date;
  updatedAt: Date;
}

const auditMarkerSchema = new Schema<IAuditMarker>(
  {
    field: { type: String, required: true },
    source: { type: String, enum: ['ai', 'manual'], required: true },
    reviewVersion: { type: Number, required: true },
    reviewedBy: { type: String, required: true },
  },
  { _id: false }
);

const exportJobSchema = new Schema<IExportJob>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    format: { type: String, enum: ['docx', 'pdf'], required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    filePath: { type: String },
    errorMessage: { type: String },
    auditMarkers: { type: [auditMarkerSchema], default: [] },
  },
  { timestamps: true }
);

exportJobSchema.index({ meetingId: 1, requestedBy: 1 });

export const ExportJob = model<IExportJob>('ExportJob', exportJobSchema);
