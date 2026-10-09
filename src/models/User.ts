import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'customer' | 'admin' | 'superadmin';
export type ManagedUserStatus = 'active' | 'inactive';
export type VehicleType = 'motorbike' | 'car' | 'truck' | 'other';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  pinHash?: string;
  pinEnabled: boolean;
  registrationVerified: boolean;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleImageUrl: string;
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
    pinHash: { type: String, default: '' },
    pinEnabled: { type: Boolean, default: false },
    registrationVerified: { type: Boolean, default: true },
  emailVerifiedAt: { type: Date, default: null },
  phoneVerifiedAt: { type: Date, default: null },
  vehicleType: {
    type: String,
    enum: ['motorbike', 'car', 'truck', 'other'],
    default: 'motorbike',
  },
  vehicleName: { type: String, default: '', trim: true },
  vehicleImageUrl: { type: String, default: '', trim: true },
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
