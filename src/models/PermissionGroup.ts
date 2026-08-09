import { Document, Schema, Types, model } from 'mongoose';

export interface IPermissionGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: 'active' | 'inactive';
  parentGroupId: Types.ObjectId | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const permissionGroupSchema = new Schema<IPermissionGroup>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: { type: String, default: '' },
    permissions: {
      type: [String],
      default: [],
    },
    parentGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'PermissionGroup',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<IPermissionGroup>('PermissionGroup', permissionGroupSchema);
