import { Document, Schema, Types, model } from 'mongoose';

export interface IDeviceType extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  manufacturer: string;
  description: string;
  image: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const deviceTypeSchema = new Schema<IDeviceType>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    manufacturer: { type: String, default: '', trim: true, index: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<IDeviceType>('DeviceType', deviceTypeSchema);
