import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../../types/express';
import {
  cancelUserBooking,
  createUserBooking,
  getUserBookingById,
  listUserBookings,
} from '../../services/user-booking.service';
import { BookingStatus } from '../../models/Booking';
import { createActivityLog } from '../../services/activity-log.service';

const bookingStatuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
};

const parseDate = (value: unknown): Date | null => {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsedValue = new Date(normalized);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
};

export const listUserBookingsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const status =
      typeof req.query.status === 'string' &&
      bookingStatuses.includes(req.query.status as BookingStatus)
        ? (req.query.status as BookingStatus)
        : undefined;

    const result = await listUserBookings(req.user.id, {
      page: parsePositiveInteger(req.query.page, 1),
      limit: Math.min(parsePositiveInteger(req.query.limit, 20), 50),
      status,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getUserBookingByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Booking khong hop le',
      });
      return;
    }

    const item = await getUserBookingById(req.user.id, id);

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createUserBookingHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const chargingPointId = normalizeText(req.body.chargingPointId);
    const startTime = parseDate(req.body.startTime);
    const endTime = parseDate(req.body.endTime);

    if (!chargingPointId || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'Thong tin dat lich khong hop le',
      });
      return;
    }

    const item = await createUserBooking(req.user.id, {
      chargingPointId,
      startTime,
      endTime,
    });

    await createActivityLog({
      userId: req.user.id,
      action: 'booking_create',
      entityType: 'booking',
      entityId: item.id,
      message: `Da tao booking cho cong sac ${item.chargingPoint.code}`,
    });

    res.status(201).json({
      success: true,
      message: 'Dat lich thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const cancelUserBookingHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Booking khong hop le',
      });
      return;
    }

    const item = await cancelUserBooking(req.user.id, id);

    await createActivityLog({
      userId: req.user.id,
      action: 'booking_cancel',
      entityType: 'booking',
      entityId: item.id,
      message: `Da huy booking cho cong sac ${item.chargingPoint.code}`,
    });

    res.status(200).json({
      success: true,
      message: 'Huy booking thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
