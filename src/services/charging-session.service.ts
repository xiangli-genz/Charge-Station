import mongoose from 'mongoose';
import Booking from '../models/Booking';
import ChargingPoint, { IChargingPoint } from '../models/ChargingPoint';
import ChargingSession, { ChargingSessionStatus, IChargingSession } from '../models/ChargingSession';
import Pricing from '../models/Pricing';
import Station from '../models/Station';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { issueInvoice } from './billing.service';
import ChargingPointStatusHistory from '../models/ChargingPointStatusHistory';

export interface ChargingSessionResponse {
  id: string;
  bookingId: string | null;
  userId: string;
  chargingPoint: { id: string; code: string; station: { id: string; name: string } | null };
  startedAt: Date;
  endedAt: Date | null;
  durationMinutes: number;
  kwhConsumed: number;
  amount: number;
  status: ChargingSessionStatus;
  transactionStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type PopulatedPoint = IChargingPoint & { station?: { _id: mongoose.Types.ObjectId; name: string } | null };

const durationMinutes = (start: Date, end: Date | null): number => {
  const finish = end || new Date();
  return Math.max(0, Math.ceil((finish.getTime() - start.getTime()) / 60000));
};

const amountFor = (kwh: number, minutes: number, pricing: { pricePerKwh: number; pricePerMinute: number; parkingFee: number; vat: number }): number => {
  const subtotal = kwh * pricing.pricePerKwh + minutes * pricing.pricePerMinute + pricing.parkingFee;
  return Math.round((subtotal + subtotal * (pricing.vat / 100)) * 100) / 100;
};

const toResponse = async (session: IChargingSession): Promise<ChargingSessionResponse> => {
  const point = session.chargingPoint as unknown as PopulatedPoint;
  const end = session.endedAt;
  const pricing = point && (point as any).pricing;
  const amount = pricing
    ? amountFor(session.kwhConsumed, durationMinutes(session.startedAt, end), pricing)
    : 0;
  const transaction = await Transaction.findOne({ session: session._id }).sort({ createdAt: -1 });

  return {
    id: session._id.toString(),
    bookingId: session.booking ? session.booking.toString() : null,
    userId: session.user.toString(),
    chargingPoint: {
      id: point._id.toString(),
      code: point.code,
      station: point.station ? { id: point.station._id.toString(), name: point.station.name } : null,
    },
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    durationMinutes: durationMinutes(session.startedAt, end),
    kwhConsumed: session.kwhConsumed,
    amount,
    status: session.status,
    transactionStatus: transaction?.status || null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
};

const populateSession = (query: mongoose.Query<any, IChargingSession>) =>
  query.populate({
    path: 'chargingPoint',
    populate: [
      { path: 'station', select: 'name' },
      { path: 'pricing', select: 'pricePerKwh pricePerMinute parkingFee vat' },
    ],
  });

const findCustomer = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'customer' || user.status !== 'active') {
    throw new Error('Tai khoan nguoi dung khong hop le');
  }
  return user;
};

export const startChargingSession = async (userId: string, input: { chargingPointId: string; bookingId?: string }): Promise<ChargingSessionResponse> => {
  await findCustomer(userId);
  const point = await ChargingPoint.findById(input.chargingPointId).populate('station', 'name status').populate('pricing');
  if (!point) throw new Error('Cong sac khong ton tai');
  const station = point.station as any;
  if (!station || station.status !== 'active') throw new Error('Tram sac khong hoat dong');
  if (point.status === 'maintenance' || point.status === 'occupied') throw new Error('Cong sac khong san sang');

  let bookingId: mongoose.Types.ObjectId | null = null;
  if (input.bookingId) {
    if (!mongoose.Types.ObjectId.isValid(input.bookingId)) throw new Error('Booking khong hop le');
    const booking = await Booking.findOne({ _id: input.bookingId, user: userId, chargingPoint: point._id });
    if (!booking || !['pending', 'confirmed'].includes(booking.status)) throw new Error('Booking khong the bat dau');
    const now = Date.now();
    if (now < booking.startTime.getTime() - 15 * 60000 || now > booking.endTime.getTime()) throw new Error('Ngoai khung gio booking');
    bookingId = booking._id;
  } else if (point.status !== 'available') {
    throw new Error('Cong sac da duoc giu cho');
  }

  const active = await ChargingSession.findOne({ chargingPoint: point._id, status: 'charging' });
  if (active) throw new Error('Cong sac dang co phien sac khac');

  const session = await ChargingSession.create({ booking: bookingId, chargingPoint: point._id, user: userId, startedAt: new Date(), status: 'charging' });
  const previousPointStatus = point.status;
  point.status = 'occupied';
  await point.save();
  await ChargingPointStatusHistory.create({ chargingPoint: point._id, station: station._id, fromStatus: previousPointStatus, toStatus: 'occupied', source: 'charging_session', reason: 'Phien sac bat dau' });
  const populated = await populateSession(ChargingSession.findById(session._id));
  if (!populated) throw new Error('Khong the tai phien sac vua tao');
  return toResponse(populated);
};

export const finishChargingSession = async (userId: string, sessionId: string, kwhConsumed: number): Promise<ChargingSessionResponse> => {
  await findCustomer(userId);
  if (!mongoose.Types.ObjectId.isValid(sessionId)) throw new Error('Phien sac khong hop le');
  if (!Number.isFinite(kwhConsumed) || kwhConsumed < 0) throw new Error('San luong dien khong hop le');
  const session = await ChargingSession.findOne({ _id: sessionId, user: userId, status: 'charging' });
  if (!session) throw new Error('Phien sac dang hoat dong khong ton tai');
  const point = await ChargingPoint.findById(session.chargingPoint).populate('station', 'name').populate('pricing');
  if (!point) throw new Error('Cong sac khong ton tai');
  const endedAt = new Date();
  const pricing: any = point.pricing;
  const amount = pricing ? amountFor(kwhConsumed, durationMinutes(session.startedAt, endedAt), pricing) : 0;

  const previousPointStatus = point.status;
  session.endedAt = endedAt;
  session.kwhConsumed = kwhConsumed;
  session.status = 'completed';
  await session.save();
  point.status = 'available';
  await point.save();
  await ChargingPointStatusHistory.create({ chargingPoint: point._id, station: (point.station as any)._id || point.station, fromStatus: previousPointStatus, toStatus: 'available', source: 'charging_session', reason: 'Phien sac ket thuc' });
  if (session.booking) await Booking.findByIdAndUpdate(session.booking, { status: 'completed' });

  const user = await User.findById(userId);
  const paid = Boolean(user && user.walletBalance >= amount);
  const transaction = await Transaction.create({ user: userId, session: session._id, amount, type: 'charging_payment', status: paid ? 'success' : 'failed' });
  const subtotal = pricing ? kwhConsumed * pricing.pricePerKwh + durationMinutes(session.startedAt, endedAt) * pricing.pricePerMinute + pricing.parkingFee : amount;
  await issueInvoice({ userId, sessionId: session._id.toString(), transactionId: transaction._id.toString(), subtotal, vat: Math.max(0, amount - subtotal), total: amount, paid });
  if (paid && user) {
    user.walletBalance = Math.round((user.walletBalance - amount) * 100) / 100;
    await user.save();
  }
  const populated = await populateSession(ChargingSession.findById(session._id));
  if (!populated) throw new Error('Khong the tai phien sac sau khi ket thuc');
  return toResponse(populated);
};

export const listChargingSessions = async (params: { userId?: string; page: number; limit: number; status?: ChargingSessionStatus }) => {
  const filter: Record<string, unknown> = {};
  if (params.userId) filter.user = params.userId;
  if (params.status) filter.status = params.status;
  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    populateSession(ChargingSession.find(filter).sort({ startedAt: -1 }).skip(skip).limit(params.limit)),
    ChargingSession.countDocuments(filter),
  ]);
  return { items: await Promise.all(items.map(toResponse)), pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) || 1 } };
};

export const getChargingSession = async (userId: string, sessionId: string) => {
  const session = await populateSession(ChargingSession.findOne({ _id: sessionId, user: userId }));
  if (!session) throw new Error('Phien sac khong ton tai');
  return toResponse(session);
};
