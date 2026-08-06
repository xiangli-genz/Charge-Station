import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  walletBalance: number;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    walletBalance: { type: Number, default: 0, min: 0 },
    role: {
      type: String,
      enum: ['customer', 'admin', 'superadmin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);
