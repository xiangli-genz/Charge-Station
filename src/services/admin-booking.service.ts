import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Booking, { BookingStatus, IBooking } from '../models/Booking';
import ChargingPoint, { IChargingPoint } from '../models/ChargingPoint';
import Station, { IStation } from '../models/Station';
import User, { IUser } from '../models/User';

interface BookingListParams {
  page: number;
  limit: number;
  status?: BookingStatus;
  chargingPointId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface BookingCustomerInput {
  fullName: string;
  phone: string;
  email: string;
}

interface CreateBookingInput {
  userId?: string;
  chargingPointId: string;
  startTime: Date;
  endTime: Date;
  status?: BookingStatus;
  customer?: BookingCustomerInput;
  createdById?: string;
}

interface UpdateBookingInput {
  chargingPointId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: BookingStatus;
}

interface BookingUserSummary {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
}

interface BookingChargingPointSummary {
  id: string;
  code: string;
  connectorType: string;
  powerKw: number;
  status: string;
  station: {
    id: string;
    name: string;
    address: string;
  } | null;
}

export interface AdminBookingResponse {
  id: string;
  user: BookingUserSummary;
  chargingPoint: BookingChargingPointSummary;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminBookingListResponse {
  items: AdminBookingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed'];
const TEMP_PASSWORD_PREFIX = 'tram-sac-customer-';

const toUserSummary = (user: IUser): BookingUserSummary => ({
  id: user._id.toString(),
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  role: user.role,
});

const toChargingPointSummary = (
  chargingPoint: IChargingPoint,
  station: IStation | null
): BookingChargingPointSummary => ({
  id: chargingPoint._id.toString(),
  code: chargingPoint.code,
  connectorType: chargingPoint.connectorType,
  powerKw: chargingPoint.powerKw,
  status: chargingPoint.status,
  station: station
    ? {
        id: station._id.toString(),
        name: station.name,
        address: station.address,
      }
    : null,
});

const toBookingResponse = (booking: IBooking): AdminBookingResponse => {
  const populatedUser = (booking as unknown as { user: IUser }).user;
  const populatedChargingPoint = (booking as unknown as {
    chargingPoint: IChargingPoint & { station?: IStation | null };
  }).chargingPoint;

  return {
    id: booking._id.toString(),
    user: toUserSummary(populatedUser),
    chargingPoint: toChargingPointSummary(
      populatedChargingPoint,
      populatedChargingPoint.station || null
    ),
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};

const populateBookingQuery = (query: mongoose.Query<any, IBooking>) => {
  return query.populate('user').populate({
    path: 'chargingPoint',
    populate: {
      path: 'station',
      model: 'Station',
    },
  });
};

const ensureValidBookingWindow = (startTime: Date, endTime: Date): void => {
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error('Thoi gian booking khong hop le');
  }

  if (startTime >= endTime) {
    throw new Error('Thoi gian ket thuc phai sau thoi gian bat dau');
  }
};

const findChargingPoint = async (chargingPointId: string): Promise<IChargingPoint> => {
  const chargingPoint = await ChargingPoint.findById(chargingPointId);

  if (!chargingPoint) {
    throw new Error('Cong sac khong ton tai');
  }

  if (chargingPoint.status === 'maintenance') {
    throw new Error('Cong sac dang bao tri, khong the dat lich');
  }

  return chargingPoint;
};

const resolveCustomerUser = async (
  userId: string | undefined,
  customer: BookingCustomerInput | undefined,
  createdById?: string
): Promise<IUser> => {
  if (userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Khach hang khong ton tai');
    }

    if (user.role !== 'customer') {
      throw new Error('Booking chi duoc tao cho tai khoan customer');
    }

    return user;
  }

  if (!customer) {
    throw new Error('Can cung cap thong tin khach hang de tao booking');
  }

  const email = customer.email.trim().toLowerCase();
  const phone = customer.phone.trim();
  const fullName = customer.fullName.trim();

  if (!email || !phone || !fullName) {
    throw new Error('Thong tin khach hang khong hop le');
  }

  const [userByEmail, userByPhone] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ phone }),
  ]);

  if (userByEmail && userByPhone && userByEmail._id.toString() !== userByPhone._id.toString()) {
    throw new Error('Email va so dien thoai dang thuoc ve hai tai khoan khac nhau');
  }

  const existingUser = userByEmail || userByPhone;

  if (existingUser) {
    if (existingUser.role !== 'customer') {
      throw new Error('Thong tin nay dang duoc su dung boi tai khoan staff');
    }

    existingUser.fullName = fullName;

    if (!userByEmail) {
      existingUser.email = email;
    }

    if (!userByPhone) {
      existingUser.phone = phone;
    }

    if (createdById && !existingUser.createdById) {
      existingUser.createdById = createdById;
    }

    await existingUser.save();
    return existingUser;
  }

  const passwordHash = await bcrypt.hash(
    `${TEMP_PASSWORD_PREFIX}${Date.now()}`,
    10
  );

  return User.create({
    fullName,
    phone,
    email,
    passwordHash,
    createdById: createdById || null,
    role: 'customer',
  });
};

const ensureNoBookingConflict = async (params: {
  chargingPointId: string;
  startTime: Date;
  endTime: Date;
  excludeBookingId?: string;
}): Promise<void> => {
  const overlappingBooking = await Booking.findOne({
    chargingPoint: params.chargingPointId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startTime: { $lt: params.endTime },
    endTime: { $gt: params.startTime },
    ...(params.excludeBookingId
      ? { _id: { $ne: params.excludeBookingId } }
      : {}),
  });

  if (overlappingBooking) {
    throw new Error('Khung gio nay da co booking khac tren cong sac da chon');
  }
};

const ensureBookingCanBeCancelled = (booking: IBooking, now = new Date()): void => {
  if (booking.status === 'cancelled') {
    throw new Error('Booking nay da duoc huy truoc do');
  }

  if (booking.status === 'completed') {
    throw new Error('Booking da hoan thanh, khong the huy');
  }

  const cancellationDeadline = new Date(booking.startTime.getTime() - 30 * 60 * 1000);

  if (now >= cancellationDeadline) {
    throw new Error('Chi co the huy booking truoc gio bat dau it nhat 30 phut');
  }
};

export const listAdminBookings = async (
  params: BookingListParams
): Promise<AdminBookingListResponse> => {
  const filter: {
    status?: BookingStatus;
    chargingPoint?: string;
    user?: string;
    startTime?: {
      $gte?: Date;
      $lte?: Date;
    };
  } = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.chargingPointId) {
    filter.chargingPoint = params.chargingPointId;
  }

  if (params.userId) {
    filter.user = params.userId;
  }

  if (params.dateFrom || params.dateTo) {
    filter.startTime = {};

    if (params.dateFrom) {
      filter.startTime.$gte = params.dateFrom;
    }

    if (params.dateTo) {
      filter.startTime.$lte = params.dateTo;
    }
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    populateBookingQuery(
      Booking.find(filter).sort({ startTime: 1, createdAt: -1 }).skip(skip).limit(params.limit)
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

export const getAdminBookingById = async (
  bookingId: string
): Promise<AdminBookingResponse> => {
  const booking = await populateBookingQuery(Booking.findById(bookingId));

  if (!booking) {
    throw new Error('Booking khong ton tai');
  }

  return toBookingResponse(booking);
};

export const createAdminBooking = async (
  payload: CreateBookingInput
): Promise<AdminBookingResponse> => {
  ensureValidBookingWindow(payload.startTime, payload.endTime);
  const [customerUser, chargingPoint] = await Promise.all([
    resolveCustomerUser(payload.userId, payload.customer, payload.createdById),
    findChargingPoint(payload.chargingPointId),
  ]);

  await ensureNoBookingConflict({
    chargingPointId: chargingPoint._id.toString(),
    startTime: payload.startTime,
    endTime: payload.endTime,
  });

  const booking = await Booking.create({
    user: customerUser._id,
    chargingPoint: chargingPoint._id,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: payload.status || 'pending',
  });

  const populatedBooking = await populateBookingQuery(Booking.findById(booking._id));

  if (!populatedBooking) {
    throw new Error('Khong the tai booking vua tao');
  }

  return toBookingResponse(populatedBooking);
};

export const updateAdminBooking = async (
  bookingId: string,
  payload: UpdateBookingInput
): Promise<AdminBookingResponse> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error('Booking khong ton tai');
  }

  const chargingPointId =
    payload.chargingPointId || booking.chargingPoint.toString();
  const startTime = payload.startTime || booking.startTime;
  const endTime = payload.endTime || booking.endTime;
  const status = payload.status || booking.status;

  if (status === 'cancelled' && booking.status !== 'cancelled') {
    ensureBookingCanBeCancelled(booking);
  }

  ensureValidBookingWindow(startTime, endTime);
  await findChargingPoint(chargingPointId);

  if (ACTIVE_BOOKING_STATUSES.includes(status)) {
    await ensureNoBookingConflict({
      chargingPointId,
      startTime,
      endTime,
      excludeBookingId: bookingId,
    });
  }

  booking.chargingPoint = new mongoose.Types.ObjectId(chargingPointId);
  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.status = status;
  await booking.save();

  const populatedBooking = await populateBookingQuery(Booking.findById(bookingId));

  if (!populatedBooking) {
    throw new Error('Khong the tai booking sau khi cap nhat');
  }

  return toBookingResponse(populatedBooking);
};

export const deleteAdminBooking = async (bookingId: string): Promise<void> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error('Booking khong ton tai');
  }

  await booking.deleteOne();
};
