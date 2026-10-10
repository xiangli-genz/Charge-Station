import { Document, Schema, Types, model } from 'mongoose';

export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'completed';

export interface IRefund extends Document {
  _id: Types.ObjectId;
  invoice: Types.ObjectId;
  transaction: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  reason: string;
  status: RefundStatus;
  providerReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IRefund>({
  invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 }, reason: { type: String, default: '' },
  status: { type: String, enum: ['requested', 'approved', 'rejected', 'completed'], default: 'requested' },
  providerReference: { type: String, default: null },
}, { timestamps: true });

export default model<IRefund>('Refund', schema);
