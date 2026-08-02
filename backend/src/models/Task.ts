import { Schema, model, Document, Types } from 'mongoose';

export const TASK_STATUSES = ['draft', 'assigned', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface ITask extends Document {
  meetingId: Types.ObjectId;
  assignee: string;
  task: string;
  dueDate?: string;
  deadline?: Date;
  matchedUserId?: Types.ObjectId;
  requiredSkills: string[];
  status: TaskStatus;
  sourceSpan?: { start: number; end: number; text: string };
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
    assignee: { type: String, required: true },
    task: { type: String, required: true },
    dueDate: { type: String },
    deadline: { type: Date },
    matchedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    requiredSkills: { type: [String], default: [] },
    status: { type: String, enum: TASK_STATUSES, default: 'draft' },
    sourceSpan: {
      type: {
        start: { type: Number, required: true },
        end:   { type: Number, required: true },
        text:  { type: String, required: true },
      },
      default: undefined,
    },
  },
  { timestamps: true },
);

taskSchema.index({ meetingId: 1 });
taskSchema.index({ matchedUserId: 1 });

export const Task = model<ITask>('Task', taskSchema);
