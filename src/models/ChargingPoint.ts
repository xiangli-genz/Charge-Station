import { Schema, model, Document, Types } from 'mongoose';

export type ConnectorType = 'AC_Type2' | 'CCS2' | 'CHAdeMO' | 'GB_T';
export type ChargingPointStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface IChargingPoint extends Document {
  _id: Types.ObjectId;
  station: Types.ObjectId;
  pricing: Types.ObjectId;
  code: string;
  connectorType: ConnectorType;
  powerKw: number;
  status: ChargingPointStatus;
  createdAt: Date;
  updatedAt: Date;
}

const chargingPointSchema = new Schema<IChargingPoint>(
  {
    station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    pricing: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
    code: { type: String, required: true, unique: true },
    connectorType: {
      type: String,
      enum: ['AC_Type2', 'CCS2', 'CHAdeMO', 'GB_T'],
      required: true,
    },
    powerKw: { type: Number, required: true },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
  },
  { timestamps: true }
);

export default model<IChargingPoint>('ChargingPoint', chargingPointSchema);
