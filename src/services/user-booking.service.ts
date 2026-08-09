import Booking, { BookingStatus, IBooking } from '../models/Booking';
import ChargingPoint, { IChargingPoint } from '../models/ChargingPoint';
import Pricing, { IPricing } from '../models/Pricing';
import Station, { IStation } from '../models/Station';
import User, { IUser } from '../models/User';
import {
  ensureBookingCanBeCancelled,
  ensureNoBookingConflict,
  ensureValidBookingWindow,
  findBookableChargingPoint,
} from './booking-core.service';

interface UserBookingChargingPointSummary {
  id: string;
  code: string;
  connectorType: string;
  powerKw: number;
  status: string;
  pricing: {
    id: string;
    name: string;
    pricePerKwh: number;
    pricePerMinute: number;
  } | null;
  station: {
    id: string;
    name: string;
    address: string;
  } | null;
}

export interface UserBookingResponse {
  id: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  chargingPoint: UserBookingChargingPointSummary;
  createdAt: Date;
  updatedAt: Date;
}

const ensureCustomerUser = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user || user.role !== 'customer') {
    throw new Error('Tai khoan nguoi dung khong ton tai');
  }

  return user;
};

const populateBookingQuery = (query: any) => {
  return query.populate({
    path: 'chargingPoint',
    populate: [
      { path: 'station', model: 'Station' },
      { path: 'pricing', model: 'Pricing' },
    ],
  });
};

const toBookingResponse = (booking: IBooking): UserBookingResponse => {
  const chargingPoint = (booking as unknown as {
    chargingPoint: IChargingPoint & { station?: IStation | null; pricing?: IPricing | null };
  }).chargingPoint;

  return {
    id: booking._id.toString(),
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    chargingPoint: {
      id: chargingPoint._id.toString(),
      code: chargingPoint.code,
      connectorType: chargingPoint.connectorType,
      powerKw: chargingPoint.powerKw,
      status: chargingPoint.status,
      pricing: chargingPoint.pricing
        ? {
            id: chargingPoint.pricing._id.toString(),
            name: chargingPoint.pricing.name,
            pricePerKwh: chargingPoint.pricing.pricePerKwh,
            pricePerMinute: chargingPoint.pricing.pricePerMinute,
          }
        : null,
      station: chargingPoint.station
        ? {
            id: chargingPoint.station._id.toString(),
            name: chargingPoint.station.name,
            address: chargingPoint.station.address,
          }
        : null,
    },
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};

export const listUserBookings = async (
  userId: string,
  params: { page: number; limit: number; status?: BookingStatus }
): Promise<{
  items: UserBookingResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  await ensureCustomerUser(userId);
  const filter: { user: string; status?: BookingStatus } = { user: userId };

  if (params.status) {
    filter.status = params.status;
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    populateBookingQuery(
      Booking.find(filter).sort({ startTime: -1, createdAt: -1 }).skip(skip).limit(params.limit)
    ),
    Booking.countDocuments(filter),
  ]);

  return {
    items: items.map(toBookingResponse),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};

export const getUserBookingById = async (
  userId: string,
  bookingId: string
): Promise<UserBookingResponse> => {
  await ensureCustomerUser(userId);
  const booking = await populateBookingQuery(Booking.findOne({ _id: bookingId, user: userId }));

  if (!booking) {
    throw new Error('Booking khong ton tai');
  }

  return toBookingResponse(booking);
};

export const createUserBooking = async (
  userId: string,
  payload: { chargingPointId: string; startTime: Date; endTime: Date }
): Promise<UserBookingResponse> => {
  await ensureCustomerUser(userId);
  ensureValidBookingWindow(payload.startTime, payload.endTime);
  const chargingPoint = await findBookableChargingPoint(payload.chargingPointId);

  await ensureNoBookingConflict({
    chargingPointId: chargingPoint._id.toString(),
    startTime: payload.startTime,
    endTime: payload.endTime,
  });

  const booking = await Booking.create({
    user: userId,
    chargingPoint: chargingPoint._id,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: 'confirmed',
  });

  const populated = await populateBookingQuery(Booking.findById(booking._id));

  if (!populated) {
    throw new Error('Khong the tai booking vua tao');
  }

  return toBookingResponse(populated);
};

export const cancelUserBooking = async (
  userId: string,
  bookingId: string
): Promise<UserBookingResponse> => {
  await ensureCustomerUser(userId);
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new Error('Booking khong ton tai');
  }

  ensureBookingCanBeCancelled(booking, new Date());
  booking.status = 'cancelled';
  await booking.save();

  const populated = await populateBookingQuery(Booking.findById(bookingId));

  if (!populated) {
    throw new Error('Khong the tai booking sau khi huy');
  }

  return toBookingResponse(populated);
};
