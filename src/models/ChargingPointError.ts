import { Document, Schema, Types, model } from 'mongoose';

export type ChargingPointErrorStatus = 'open' | 'acknowledged' | 'resolved';

export interface IChargingPointError extends Document {
  _id: Types.ObjectId;
  chargingPoint: Types.ObjectId;
  station: Types.ObjectId;
  session: Types.ObjectId | null;
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  status: ChargingPointErrorStatus;
  occurredAt: Date;
  resolvedAt: Date | null;
}

const schema = new Schema<IChargingPointError>({
  chargingPoint: { type: Schema.Types.ObjectId, ref: 'ChargingPoint', required: true, index: true },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  session: { type: Schema.Types.ObjectId, ref: 'ChargingSession', default: null },
  code: { type: String, required: true, trim: true }, message: { type: String, default: '' },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'warning' },
  status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open', index: true },
  occurredAt: { type: Date, default: Date.now, index: true }, resolvedAt: { type: Date, default: null },
});

export default model<IChargingPointError>('ChargingPointError', schema);
