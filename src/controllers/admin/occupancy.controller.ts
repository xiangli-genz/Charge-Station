import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { buildOccupancyDataset } from '../../services/occupancy.service';

export const getOccupancyDataset = async (req: Request, res: Response): Promise<void> => {
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(to.getTime() - 30 * 86400000);
  const intervalMinutes = Number(req.query.intervalMinutes || 30);
  const stationId = typeof req.query.stationId === 'string' ? req.query.stationId : undefined;
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to || ![15, 30, 60].includes(intervalMinutes) || (stationId && !mongoose.Types.ObjectId.isValid(stationId))) {
    res.status(400).json({ success: false, message: 'Tham so dataset occupancy khong hop le' });
    return;
  }
  if (to.getTime() - from.getTime() > 90 * 86400000) {
    res.status(400).json({ success: false, message: 'Khoang thoi gian toi da 90 ngay' });
    return;
  }
  try {
    const items = await buildOccupancyDataset({ from, to, intervalMinutes, stationId });
    res.status(200).json({ success: true, filters: { from, to, intervalMinutes, stationId: stationId || null }, items, count: items.length });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
