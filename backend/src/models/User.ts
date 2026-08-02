import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'employee' | 'reviewer' | 'admin';
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['employee', 'reviewer', 'admin'],
      default: 'employee',
    },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
