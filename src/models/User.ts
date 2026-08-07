import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'customer' | 'admin' | 'superadmin';
export type ManagedUserStatus = 'active' | 'inactive';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  walletBalance: number;
  role: UserRole;
  status: ManagedUserStatus;
  userType: string;
  description: string;
  address: string;
  landingPage: string;
  permissionGroupId: Types.ObjectId | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    walletBalance: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    userType: { type: String, default: 'Nguoi dung', trim: true },
    description: { type: String, default: '' },
    address: { type: String, default: '' },
    landingPage: { type: String, default: 'map', trim: true },
    permissionGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'PermissionGroup',
      default: null,
    },
    createdById: { type: String, default: null, index: true },
    role: {
      type: String,
      enum: ['customer', 'admin', 'superadmin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);
