import mongoose from 'mongoose';
import ChargingPoint, { ChargingPointStatus } from '../models/ChargingPoint';
import ChargingPointError from '../models/ChargingPointError';
import ChargingPointHeartbeat from '../models/ChargingPointHeartbeat';
import ChargingPointStatusHistory from '../models/ChargingPointStatusHistory';
import ChargingPointTelemetry from '../models/ChargingPointTelemetry';

const ensurePoint = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Cong sac khong hop le');
  const point = await ChargingPoint.findById(id);
  if (!point) throw new Error('Cong sac khong ton tai');
  return point;
};

export const recordStatusChange = async (pointId: string, toStatus: ChargingPointStatus, input: { source?: string; reason?: string; metadata?: Record<string, unknown> } = {}) => {
  const point = await ensurePoint(pointId);
  if (point.status === toStatus) return null;
  const fromStatus = point.status;
  point.status = toStatus;
  await point.save();
  return ChargingPointStatusHistory.create({ chargingPoint: point._id, station: point.station, fromStatus, toStatus, source: input.source || 'system', reason: input.reason || '', metadata: input.metadata || {} });
};

export const recordTelemetry = async (pointId: string, payload: Record<string, unknown>) => {
  const point = await ensurePoint(pointId);
  const item = await ChargingPointTelemetry.create({
    chargingPoint: point._id, station: point.station, session: payload.sessionId || null,
    voltageV: payload.voltageV ?? null, currentA: payload.currentA ?? null,
    powerKw: payload.powerKw ?? null, energyKwh: payload.energyKwh ?? null,
    temperatureC: payload.temperatureC ?? null, status: payload.status || point.status,
    measuredAt: payload.measuredAt || new Date(), source: payload.source || 'device',
  });
  return item;
};

export const recordHeartbeat = async (pointId: string, payload: Record<string, unknown>) => {
  const point = await ensurePoint(pointId);
  const item = await ChargingPointHeartbeat.create({ chargingPoint: point._id, station: point.station, deviceAt: payload.deviceAt || null, firmware: payload.firmware || '', ipAddress: payload.ipAddress || '', online: payload.online !== false, metadata: payload.metadata || {} });
  point.online = payload.online !== false;
  point.lastHeartbeatAt = item.receivedAt;
  await point.save();
  return item;
};

export const recordPointError = async (pointId: string, payload: Record<string, unknown>) => {
  const point = await ensurePoint(pointId);
  const item = await ChargingPointError.create({ chargingPoint: point._id, station: point.station, session: payload.sessionId || null, code: payload.code, message: payload.message || '', severity: payload.severity || 'warning', occurredAt: payload.occurredAt || new Date() });
  point.lastErrorCode = String(payload.code);
  await point.save();
  return item;
};

export const listPointOperations = async (pointId: string, limit = 50) => {
  await ensurePoint(pointId);
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const [telemetry, heartbeats, errors, statusHistory] = await Promise.all([
    ChargingPointTelemetry.find({ chargingPoint: pointId }).sort({ measuredAt: -1 }).limit(safeLimit).lean(),
    ChargingPointHeartbeat.find({ chargingPoint: pointId }).sort({ receivedAt: -1 }).limit(safeLimit).lean(),
    ChargingPointError.find({ chargingPoint: pointId }).sort({ occurredAt: -1 }).limit(safeLimit).lean(),
    ChargingPointStatusHistory.find({ chargingPoint: pointId }).sort({ occurredAt: -1 }).limit(safeLimit).lean(),
  ]);
  return { telemetry, heartbeats, errors, statusHistory };
};
