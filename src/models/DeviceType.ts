import { Document, Schema, Types, model } from 'mongoose';

export interface IDeviceType extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  manufacturer: string;
  category: string;
  vehicleTypes: string[];
  connectorTypes: string[];
  currentTypes: string[];
  protocols: string[];
  powerMinKw: number;
  powerMaxKw: number;
  active: boolean;
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
    category: { type: String, default: 'CHARGING_STATION', trim: true, index: true },
    vehicleTypes: { type: [String], default: [] },
    connectorTypes: { type: [String], default: [] },
    currentTypes: { type: [String], default: [] },
    protocols: { type: [String], default: [] },
    powerMinKw: { type: Number, default: 0, min: 0 },
    powerMaxKw: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true, index: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    createdById: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

export default model<IDeviceType>('DeviceType', deviceTypeSchema);
