import { Request, Response } from 'express';
import { ChargingPointStatus } from '../../models/ChargingPoint';
import { listPointOperations, recordHeartbeat, recordPointError, recordStatusChange, recordTelemetry } from '../../services/charging-point-operations.service';

const validStatuses: ChargingPointStatus[] = ['available', 'occupied', 'reserved', 'maintenance'];
const body = (req: Request) => (req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {});

export const listPointOperationsHandler = async (req: Request, res: Response) => {
  try { res.status(200).json({ success: true, ...(await listPointOperations(req.params.id, Number(req.query.limit) || 50)) }); }
  catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const recordPointStatusHandler = async (req: Request, res: Response) => {
  try {
    const data = body(req);
    if (typeof data.status !== 'string' || !validStatuses.includes(data.status as ChargingPointStatus)) throw new Error('Trang thai cong sac khong hop le');
    const item = await recordStatusChange(req.params.id, data.status as ChargingPointStatus, { source: String(data.source || 'admin'), reason: String(data.reason || ''), metadata: (data.metadata || {}) as Record<string, unknown> });
    res.status(200).json({ success: true, item });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const recordPointTelemetryHandler = async (req: Request, res: Response) => {
  try { res.status(201).json({ success: true, item: await recordTelemetry(req.params.id, body(req)) }); }
  catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const recordPointHeartbeatHandler = async (req: Request, res: Response) => {
  try { res.status(201).json({ success: true, item: await recordHeartbeat(req.params.id, body(req)) }); }
  catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};

export const recordPointErrorHandler = async (req: Request, res: Response) => {
  try {
    const data = body(req);
    if (!data.code || typeof data.code !== 'string') throw new Error('Ma loi thiet bi la bat buoc');
    res.status(201).json({ success: true, item: await recordPointError(req.params.id, data) });
  } catch (error) { res.status(400).json({ success: false, message: (error as Error).message }); }
};
