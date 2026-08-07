import { Schema, model, Document, Types } from 'mongoose';

export type StationStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface IStation extends Document {
  _id: Types.ObjectId;
  imei?: string;
  name: string;
  address: string;
  city: string;
  district: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  chargingType: string;
  currentType: string;
  isActivated: boolean;
  activatedAt?: Date | null;
  warrantyUntil?: Date | null;
  simType: string;
  simNumber: string;
  billingSimNumber: string;
  supportPhone: string;
  open24_7: boolean;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const stationSchema = new Schema<IStation>(
  {
    imei: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'closed'],
      default: 'active',
    },
    chargingType: { type: String, trim: true, default: '' },
    currentType: { type: String, trim: true, default: '' },
    isActivated: { type: Boolean, default: false },
    activatedAt: { type: Date, default: null },
    warrantyUntil: { type: Date, default: null },
    simType: { type: String, trim: true, default: '' },
    simNumber: { type: String, trim: true, default: '' },
    billingSimNumber: { type: String, trim: true, default: '' },
    supportPhone: { type: String, trim: true, default: '' },
    open24_7: { type: Boolean, default: false },
    amenities: { type: [String], default: [] },
  },
  { timestamps: true }
);

stationSchema.index({ imei: 1 });
stationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default model<IStation>('Station', stationSchema);
