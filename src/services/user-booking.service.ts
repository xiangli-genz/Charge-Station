import Booking, { BookingStatus, IBooking } from '../models/Booking';
import ChargingPoint, { IChargingPoint } from '../models/ChargingPoint';
import ChargingSession from '../models/ChargingSession';
import Pricing, { IPricing } from '../models/Pricing';
import Station, { IStation } from '../models/Station';
import Transaction from '../models/Transaction';
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
    city: string;
    district: string;
    location: {
      lat: number;
      lng: number;
    } | null;
  } | null;
}

interface UserBookingChargingSummary {
  kwhConsumed: number;
  amount: number;
}

export interface UserBookingResponse {
  id: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  vehicle: {
    type: string;
    name: string;
    imageUrl: string;
  };
  chargingSummary: UserBookingChargingSummary;
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
  return query
    .populate({
      path: 'chargingPoint',
      populate: [
        { path: 'station', model: 'Station' },
        { path: 'pricing', model: 'Pricing' },
      ],
    })
    .populate({
      path: 'user',
      model: 'User',
      select: 'vehicleType vehicleName vehicleImageUrl',
    });
};

const getChargingSummary = async (
  bookingId: string
): Promise<UserBookingChargingSummary> => {
  const session = await ChargingSession.findOne({ booking: bookingId }).sort({
    createdAt: -1,
  });

  if (!session) {
    return {
      kwhConsumed: 0,
      amount: 0,
    };
  }

  const transaction = await Transaction.findOne({
    session: session._id,
    type: 'charging_payment',
    status: 'success',
  }).sort({ createdAt: -1 });

  return {
    kwhConsumed: Number(session.kwhConsumed || 0),
    amount: Number(transaction?.amount || 0),
  };
};

const toBookingResponse = async (booking: IBooking): Promise<UserBookingResponse> => {
  const chargingPoint = (booking as unknown as {
    chargingPoint: IChargingPoint & { station?: IStation | null; pricing?: IPricing | null };
  }).chargingPoint;
  const user = (booking as unknown as {
    user: Pick<IUser, 'vehicleType' | 'vehicleName' | 'vehicleImageUrl'> | null;
  }).user;

  const chargingSummary = await getChargingSummary(booking._id.toString());

  return {
    id: booking._id.toString(),
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    vehicle: {
      type: user?.vehicleType || 'motorbike',
      name: user?.vehicleName || '',
      imageUrl: user?.vehicleImageUrl || '',
    },
    chargingSummary,
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
            city: chargingPoint.station.city || '',
            district: chargingPoint.station.district || '',
            location: chargingPoint.station.location || null,
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
    items: await Promise.all(items.map(toBookingResponse)),
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
