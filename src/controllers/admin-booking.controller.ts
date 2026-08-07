import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BookingStatus } from '../models/Booking';
import { AuthRequest } from '../types/express';
import {
  createAdminBooking,
  deleteAdminBooking,
  getAdminBookingById,
  listAdminBookings,
  updateAdminBooking,
} from '../services/admin-booking.service';

const bookingStatuses: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseBookingStatus = (value: unknown): BookingStatus | undefined => {
  return typeof value === 'string' && bookingStatuses.includes(value as BookingStatus)
    ? (value as BookingStatus)
    : undefined;
};

const parseDateValue = (value: unknown): Date | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

export const listAdminBookingsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const status = parseBookingStatus(req.query.status);
    const chargingPointId =
      typeof req.query.chargingPointId === 'string' &&
      isValidObjectId(req.query.chargingPointId)
        ? req.query.chargingPointId
        : undefined;
    const userId =
      typeof req.query.userId === 'string' && isValidObjectId(req.query.userId)
        ? req.query.userId
        : undefined;
    const dateFrom = parseDateValue(req.query.dateFrom);
    const dateTo = parseDateValue(req.query.dateTo);

    const result = await listAdminBookings({
      page,
      limit,
      status,
      chargingPointId,
      userId,
      dateFrom,
      dateTo,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getAdminBookingByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Booking id khong hop le',
      });
      return;
    }

    const booking = await getAdminBookingById(id);

    res.status(200).json({
      success: true,
      item: booking,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createAdminBookingHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const chargingPointId = normalizeText(req.body.chargingPointId);
    const userId = normalizeText(req.body.userId) || undefined;
    const status = parseBookingStatus(req.body.status);
    const startTime = parseDateValue(req.body.startTime);
    const endTime = parseDateValue(req.body.endTime);
    const customer = {
      fullName: normalizeText(req.body.customer?.fullName),
      phone: normalizeText(req.body.customer?.phone),
      email: normalizeText(req.body.customer?.email).toLowerCase(),
    };

    if (!isValidObjectId(chargingPointId) || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'Thong tin booking khong hop le',
      });
      return;
    }

    if (userId && !isValidObjectId(userId)) {
      res.status(400).json({
        success: false,
        message: 'User id khong hop le',
      });
      return;
    }

    const booking = await createAdminBooking({
      chargingPointId,
      userId,
      startTime,
      endTime,
      status,
      customer,
      createdById: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao booking thanh cong',
      item: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAdminBookingHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Booking id khong hop le',
      });
      return;
    }

    const chargingPointId = normalizeText(req.body.chargingPointId);
    const startTime = parseDateValue(req.body.startTime);
    const endTime = parseDateValue(req.body.endTime);
    const status = parseBookingStatus(req.body.status);

    if (chargingPointId && !isValidObjectId(chargingPointId)) {
      res.status(400).json({
        success: false,
        message: 'Charging point id khong hop le',
      });
      return;
    }

    const booking = await updateAdminBooking(id, {
      chargingPointId: chargingPointId || undefined,
      startTime,
      endTime,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat booking thanh cong',
      item: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAdminBookingHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Booking id khong hop le',
      });
      return;
    }

    await deleteAdminBooking(id);

    res.status(200).json({
      success: true,
      message: 'Xoa booking thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
