import mongoose from 'mongoose';
import Invoice from '../models/Invoice';
import Refund from '../models/Refund';
import Transaction from '../models/Transaction';

const invoiceNumber = () => `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const issueInvoice = async (input: { userId: string; sessionId?: string | null; transactionId?: string | null; subtotal: number; vat: number; total: number; paid: boolean }) => Invoice.create({
  invoiceNumber: invoiceNumber(), user: input.userId, session: input.sessionId || null, transaction: input.transactionId || null,
  subtotal: input.subtotal, vat: input.vat, total: input.total, status: input.paid ? 'paid' : 'issued', paidAt: input.paid ? new Date() : null,
});

export const requestRefund = async (userId: string, invoiceId: string, amount: number, reason: string) => {
  if (!mongoose.Types.ObjectId.isValid(invoiceId) || !Number.isFinite(amount) || amount <= 0) throw new Error('Thong tin hoan tien khong hop le');
  const invoice = await Invoice.findOne({ _id: invoiceId, user: userId });
  if (!invoice || invoice.status !== 'paid' || !invoice.transaction) throw new Error('Hoa don khong du dieu kien hoan tien');
  if (amount > invoice.total) throw new Error('So tien hoan vuot qua tong hoa don');
  return Refund.create({ invoice: invoice._id, transaction: invoice.transaction, user: userId, amount, reason: reason.trim() });
};

export const listInvoices = async (userId: string) => Invoice.find({ user: userId }).sort({ issuedAt: -1 }).populate('session', 'startedAt endedAt kwhConsumed').lean();

export const completeRefund = async (refundId: string, providerReference?: string) => {
  const refund = await Refund.findById(refundId);
  if (!refund || refund.status === 'completed') throw new Error('Yeu cau hoan tien khong hop le');
  const invoice = await Invoice.findById(refund.invoice);
  if (!invoice) throw new Error('Hoa don khong ton tai');
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      refund.status = 'completed';
      refund.providerReference = providerReference || null;
      await refund.save({ session });
      await Transaction.findByIdAndUpdate(refund.transaction, { status: 'refunded', providerReference: providerReference || null }, { session });
      await Invoice.findByIdAndUpdate(invoice._id, { status: 'refunded' }, { session });
      result = refund;
    });
    return result;
  } finally { await session.endSession(); }
};
