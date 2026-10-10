import { Schema, model, Document, Types } from 'mongoose';

export type ConnectorType = 'AC_Type2' | 'CCS2' | 'CHAdeMO' | 'GB_T';
export type ChargingPointStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface IChargingPoint extends Document {
  _id: Types.ObjectId;
  station: Types.ObjectId;
  pricing: Types.ObjectId;
  code: string;
  connectorType: ConnectorType;
  outputCurrentType: string;
  inputSupply: string;
  maxOutputCurrentA?: number | null;
  description: string;
  powerKw: number;
  maxOutputVoltage: string;
  multiPortEnabled: boolean;
  positionLabel: string;
  status: ChargingPointStatus;
  online: boolean;
  lastHeartbeatAt: Date | null;
  lastErrorCode: string;
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
    outputCurrentType: { type: String, trim: true, default: '' },
    inputSupply: { type: String, trim: true, default: '' },
    maxOutputCurrentA: { type: Number, default: null },
    description: { type: String, trim: true, default: '' },
    powerKw: { type: Number, required: true },
    maxOutputVoltage: { type: String, trim: true, default: '' },
    multiPortEnabled: { type: Boolean, default: false },
    positionLabel: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    online: { type: Boolean, default: false, index: true },
    lastHeartbeatAt: { type: Date, default: null, index: true },
    lastErrorCode: { type: String, default: '' },
  },
  { timestamps: true }
);

export default model<IChargingPoint>('ChargingPoint', chargingPointSchema);
