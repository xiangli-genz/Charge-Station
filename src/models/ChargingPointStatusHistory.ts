import { Document, Schema, Types, model } from 'mongoose';
import { ChargingPointStatus } from './ChargingPoint';

export interface IChargingPointStatusHistory extends Document {
  _id: Types.ObjectId;
  chargingPoint: Types.ObjectId;
  station: Types.ObjectId;
  fromStatus: ChargingPointStatus | null;
  toStatus: ChargingPointStatus;
  source: string;
  reason: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
}

const schema = new Schema<IChargingPointStatusHistory>({
  chargingPoint: { type: Schema.Types.ObjectId, ref: 'ChargingPoint', required: true, index: true },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  fromStatus: { type: String, enum: ['available', 'occupied', 'reserved', 'maintenance', null], default: null },
  toStatus: { type: String, enum: ['available', 'occupied', 'reserved', 'maintenance'], required: true },
  source: { type: String, default: 'system', trim: true },
  reason: { type: String, default: '', trim: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  occurredAt: { type: Date, default: Date.now, index: true },
});

export default model<IChargingPointStatusHistory>('ChargingPointStatusHistory', schema);
