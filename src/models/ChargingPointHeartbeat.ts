import { Document, Schema, Types, model } from 'mongoose';

export interface IChargingPointHeartbeat extends Document {
  _id: Types.ObjectId;
  chargingPoint: Types.ObjectId;
  station: Types.ObjectId;
  receivedAt: Date;
  deviceAt: Date | null;
  firmware: string;
  ipAddress: string;
  online: boolean;
  metadata: Record<string, unknown>;
}

const schema = new Schema<IChargingPointHeartbeat>({
  chargingPoint: { type: Schema.Types.ObjectId, ref: 'ChargingPoint', required: true, index: true },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  receivedAt: { type: Date, default: Date.now, index: true }, deviceAt: { type: Date, default: null },
  firmware: { type: String, default: '' }, ipAddress: { type: String, default: '' },
  online: { type: Boolean, default: true }, metadata: { type: Schema.Types.Mixed, default: {} },
});

export default model<IChargingPointHeartbeat>('ChargingPointHeartbeat', schema);
