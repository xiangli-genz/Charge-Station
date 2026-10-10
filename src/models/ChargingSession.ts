import { Schema, model, Document, Types } from 'mongoose';

export type ChargingSessionStatus = 'charging' | 'completed' | 'error';

export interface IChargingSession extends Document {
  _id: Types.ObjectId;
  booking: Types.ObjectId | null;
  chargingPoint: Types.ObjectId;
  user: Types.ObjectId;
  startedAt: Date;
  endedAt: Date | null;
  kwhConsumed: number;
  status: ChargingSessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const chargingSessionSchema = new Schema<IChargingSession>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    chargingPoint: { type: Schema.Types.ObjectId, ref: 'ChargingPoint', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    kwhConsumed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['charging', 'completed', 'error'],
      default: 'charging',
    },
  },
  { timestamps: true }
);

chargingSessionSchema.index({ user: 1, startedAt: -1 });
chargingSessionSchema.index(
  { chargingPoint: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'charging' } }
);
chargingSessionSchema.index({ booking: 1 });

export default model<IChargingSession>('ChargingSession', chargingSessionSchema);
