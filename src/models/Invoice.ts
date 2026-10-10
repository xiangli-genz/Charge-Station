import { Document, Schema, Types, model } from 'mongoose';

export type InvoiceStatus = 'issued' | 'paid' | 'void' | 'refunded';

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  user: Types.ObjectId;
  session: Types.ObjectId | null;
  transaction: Types.ObjectId | null;
  subtotal: number;
  vat: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: Date;
  paidAt: Date | null;
}

const schema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  session: { type: Schema.Types.ObjectId, ref: 'ChargingSession', default: null, unique: true, sparse: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction', default: null },
  subtotal: { type: Number, required: true, min: 0 }, vat: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 }, currency: { type: String, default: 'VND' },
  status: { type: String, enum: ['issued', 'paid', 'void', 'refunded'], default: 'issued' },
  issuedAt: { type: Date, default: Date.now }, paidAt: { type: Date, default: null },
}, { timestamps: true });

export default model<IInvoice>('Invoice', schema);
