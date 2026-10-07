import { Schema, model, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: string;
  jti: string;
  tokenHash: string;
  revokedAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: String, required: true, index: true },
    jti: { type: String, required: true, index: true, unique: true },
    tokenHash: { type: String, required: true },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// TTL cleanup so stale refresh tokens are removed automatically.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);
