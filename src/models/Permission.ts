import { Document, Schema, Types, model } from 'mongoose';

export interface IPermission extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  groupKey: string;
  groupName: string;
  description: string;
  status: 'active' | 'inactive';
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
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
    groupKey: { type: String, required: true, trim: true, lowercase: true, index: true },
    groupName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<IPermission>('Permission', permissionSchema);
