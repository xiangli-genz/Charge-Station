import { Schema, model, Document, Types } from 'mongoose';

export type TransactionType = 'topup' | 'charging_payment';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  session: Types.ObjectId | null;
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
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['topup', 'charging_payment'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default model<ITransaction>('Transaction', transactionSchema);
