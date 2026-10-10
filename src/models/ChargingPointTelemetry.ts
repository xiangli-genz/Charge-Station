import { Document, Schema, Types, model } from 'mongoose';

export interface IChargingPointTelemetry extends Document {
  _id: Types.ObjectId;
  chargingPoint: Types.ObjectId;
  station: Types.ObjectId;
  session: Types.ObjectId | null;
  voltageV: number | null;
  currentA: number | null;
  powerKw: number | null;
  energyKwh: number | null;
  temperatureC: number | null;
  status: string;
  measuredAt: Date;
  source: string;
}

const schema = new Schema<IChargingPointTelemetry>({
  chargingPoint: { type: Schema.Types.ObjectId, ref: 'ChargingPoint', required: true, index: true },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  session: { type: Schema.Types.ObjectId, ref: 'ChargingSession', default: null },
  voltageV: { type: Number, default: null }, currentA: { type: Number, default: null },
  powerKw: { type: Number, default: null }, energyKwh: { type: Number, default: null },
  temperatureC: { type: Number, default: null }, status: { type: String, default: '' },
  measuredAt: { type: Date, default: Date.now, index: true }, source: { type: String, default: 'device' },
}, { timestamps: true });

schema.index({ chargingPoint: 1, measuredAt: -1 });
export default model<IChargingPointTelemetry>('ChargingPointTelemetry', schema);
