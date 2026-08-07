import { Document, Schema, Types, model } from 'mongoose';

export type SwapStationStatus = 'active' | 'inactive' | 'maintenance' | 'closed';

export interface ISwapStation extends Document {
  _id: Types.ObjectId;
  name: string;
  address: string;
  provider: string;
  supportedVehicleModels: string[];
  location: {
    lat: number;
    lng: number;
  };
  totalBatterySlots: number;
  availableBatterySlots: number;
  status: SwapStationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const swapStationSchema = new Schema<ISwapStation>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true, default: 'VinFast' },
    supportedVehicleModels: {
      type: [String],
      default: [],
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    totalBatterySlots: { type: Number, default: 0, min: 0 },
    availableBatterySlots: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

swapStationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default model<ISwapStation>('SwapStation', swapStationSchema);
