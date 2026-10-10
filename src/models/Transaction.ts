import { Schema, model, Document, Types } from 'mongoose';

export type TransactionType = 'topup' | 'charging_payment' | 'refund';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  session: Types.ObjectId | null;
  invoice: Types.ObjectId | null;
  idempotencyKey: string | null;
  provider: string;
  providerReference: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'ChargingSession', default: null },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', default: null },
    idempotencyKey: { type: String, default: null, index: true },
    provider: { type: String, default: 'wallet' },
    providerReference: { type: String, default: null },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['topup', 'charging_payment', 'refund'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default model<ITransaction>('Transaction', transactionSchema);
