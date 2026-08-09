import Booking, { BookingStatus, IBooking } from '../models/Booking';
import ChargingPoint, { IChargingPoint } from '../models/ChargingPoint';

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed'];

export const ensureValidBookingWindow = (startTime: Date, endTime: Date): void => {
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error('Thoi gian booking khong hop le');
  }

  if (startTime >= endTime) {
    throw new Error('Thoi gian ket thuc phai sau thoi gian bat dau');
  }
};

export const findBookableChargingPoint = async (
  chargingPointId: string
): Promise<IChargingPoint> => {
  const chargingPoint = await ChargingPoint.findById(chargingPointId);

  if (!chargingPoint) {
    throw new Error('Cong sac khong ton tai');
  }

  if (chargingPoint.status === 'maintenance') {
    throw new Error('Cong sac dang bao tri, khong the dat lich');
  }

  return chargingPoint;
};

export const ensureNoBookingConflict = async (params: {
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
    ...(params.excludeBookingId ? { _id: { $ne: params.excludeBookingId } } : {}),
  });

  if (overlappingBooking) {
    throw new Error('Khung gio nay da co booking khac tren cong sac da chon');
  }
};

export const ensureBookingCanBeCancelled = (
  booking: Pick<IBooking, 'status' | 'startTime'>,
  now = new Date()
): void => {
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
