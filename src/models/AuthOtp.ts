import { Schema, model, Document, Types } from 'mongoose';

export type AuthOtpPurpose =
  | 'register_email'
  | 'register_phone'
  | 'reset_pin_email'
  | 'reset_pin_phone';

export interface IAuthOtp extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | null;
  target: string;
  channel: 'email' | 'phone';
  purpose: AuthOtpPurpose;
  codeHash: string;
  expiresAt: Date;
  consumedAt?: Date | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const authOtpSchema = new Schema<IAuthOtp>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    target: { type: String, required: true, trim: true, lowercase: true },
    channel: { type: String, enum: ['email', 'phone'], required: true },
    purpose: {
      type: String,
      enum: ['register_email', 'register_phone', 'reset_pin_email', 'reset_pin_phone'],
      required: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

authOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authOtpSchema.index({ target: 1, purpose: 1, createdAt: -1 });

export default model<IAuthOtp>('AuthOtp', authOtpSchema);
