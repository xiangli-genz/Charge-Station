import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../../types/express';
import { ChargingSessionStatus } from '../../models/ChargingSession';
import { createActivityLog } from '../../services/activity-log.service';
import { finishChargingSession, getChargingSession, listChargingSessions, startChargingSession } from '../../services/charging-session.service';

const positiveInt = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const isId = (value: string) => mongoose.Types.ObjectId.isValid(value);
const statuses: ChargingSessionStatus[] = ['charging', 'completed', 'error'];

export const startChargingSessionHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Chua xac thuc nguoi dung' }); return; }
    const chargingPointId = typeof req.body.chargingPointId === 'string' ? req.body.chargingPointId.trim() : '';
    const bookingId = typeof req.body.bookingId === 'string' ? req.body.bookingId.trim() : undefined;
    if (!isId(chargingPointId) || (bookingId && !isId(bookingId))) { res.status(400).json({ success: false, message: 'Thong tin phien sac khong hop le' }); return; }
    const item = await startChargingSession(req.user.id, { chargingPointId, bookingId });
    await createActivityLog({ userId: req.user.id, action: 'charging_session_start', entityType: 'charging_session', entityId: item.id, message: `Da bat dau phien sac ${item.chargingPoint.code}` });
    res.status(201).json({ success: true, message: 'Bat dau sac thanh cong', item });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const finishChargingSessionHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Chua xac thuc nguoi dung' }); return; }
    const { id } = req.params;
    const kwhConsumed = Number(req.body.kwhConsumed);
    if (!isId(id) || !Number.isFinite(kwhConsumed) || kwhConsumed < 0) { res.status(400).json({ success: false, message: 'Du lieu ket thuc phien sac khong hop le' }); return; }
    const item = await finishChargingSession(req.user.id, id, kwhConsumed);
    await createActivityLog({ userId: req.user.id, action: 'charging_session_finish', entityType: 'charging_session', entityId: item.id, message: `Da ket thuc phien sac ${item.chargingPoint.code}`, metadata: { kwhConsumed: item.kwhConsumed, amount: item.amount } });
    res.status(200).json({ success: true, message: 'Ket thuc sac thanh cong', item });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const listUserChargingSessionsHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Chua xac thuc nguoi dung' }); return; }
    const status = typeof req.query.status === 'string' && statuses.includes(req.query.status as ChargingSessionStatus) ? req.query.status as ChargingSessionStatus : undefined;
    const result = await listChargingSessions({ userId: req.user.id, status, page: positiveInt(req.query.page, 1), limit: Math.min(positiveInt(req.query.limit, 20), 50) });
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const getUserChargingSessionHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Chua xac thuc nguoi dung' }); return; }
    if (!isId(req.params.id)) { res.status(400).json({ success: false, message: 'Phien sac khong hop le' }); return; }
    res.status(200).json({ success: true, item: await getChargingSession(req.user.id, req.params.id) });
  } catch (error) { res.status(404).json({ success: false, message: (error as Error).message }); }
};

export const listAdminChargingSessionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.query.userId === 'string' && isId(req.query.userId) ? req.query.userId : undefined;
    const status = typeof req.query.status === 'string' && statuses.includes(req.query.status as ChargingSessionStatus) ? req.query.status as ChargingSessionStatus : undefined;
    const result = await listChargingSessions({ userId, status, page: positiveInt(req.query.page, 1), limit: Math.min(positiveInt(req.query.limit, 20), 100) });
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};
