import { Document, Schema, model } from 'mongoose';

export type IdempotencyState = 'pending' | 'completed';

export interface IIdempotencyKey extends Document {
  user: string;
  key: string;
  route: string;
  bodyHash: string;
  state: IdempotencyState;
  statusCode: number | null;
  response: Record<string, unknown> | null;
  expiresAt: Date;
}

const schema = new Schema<IIdempotencyKey>({
  user: { type: String, required: true }, key: { type: String, required: true }, route: { type: String, required: true },
  bodyHash: { type: String, required: true }, state: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  statusCode: { type: Number, default: null }, response: { type: Schema.Types.Mixed, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
schema.index({ user: 1, key: 1, route: 1 }, { unique: true });

export default model<IIdempotencyKey>('IdempotencyKey', schema);
