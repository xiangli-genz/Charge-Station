import { Schema, model, Document, Types } from 'mongoose';

export type StationStatus = 'active' | 'inactive' | 'maintenance';

export interface IStation extends Document {
  _id: Types.ObjectId;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const stationSchema = new Schema<IStation>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
  },
  { timestamps: true }
);

stationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default model<IStation>('Station', stationSchema);
