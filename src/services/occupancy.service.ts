import ChargingPoint from '../models/ChargingPoint';
import ChargingSession from '../models/ChargingSession';

export interface OccupancyDatasetParams { from: Date; to: Date; intervalMinutes: number; stationId?: string }

export const buildOccupancyDataset = async (params: OccupancyDatasetParams) => {
  const points = await ChargingPoint.find(params.stationId ? { station: params.stationId } : {})
    .select('station');
  const totalByStation = new Map<string, number>();
  points.forEach((point) => {
    const key = point.station.toString();
    totalByStation.set(key, (totalByStation.get(key) || 0) + 1);
  });

  const sessions: any[] = await ChargingSession.find({
    status: { $in: ['charging', 'completed'] },
    startedAt: { $lt: params.to },
    $or: [{ endedAt: null }, { endedAt: { $gte: params.from } }],
  }).populate({ path: 'chargingPoint', select: 'station' });

  const rows: Array<Record<string, unknown>> = [];
  const intervalMs = params.intervalMinutes * 60000;
  for (let cursor = params.from.getTime(); cursor < params.to.getTime(); cursor += intervalMs) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(Math.min(cursor + intervalMs, params.to.getTime()));
    for (const [stationId, totalPoints] of totalByStation.entries()) {
      const stationSessions = sessions.filter((session) => session.chargingPoint?.station?.toString() === stationId);
      const activeSessions = stationSessions.filter((session) => session.startedAt < bucketEnd && (!session.endedAt || session.endedAt >= bucketStart));
      const energy = stationSessions
        .filter((session) => session.endedAt && session.endedAt >= bucketStart && session.endedAt < bucketEnd)
        .reduce((sum, session) => sum + Number(session.kwhConsumed || 0), 0);
      rows.push({
        stationId,
        timestamp: bucketStart,
        totalPoints,
        occupiedPoints: Math.min(activeSessions.length, totalPoints),
        occupancyRate: totalPoints ? Number((Math.min(activeSessions.length, totalPoints) / totalPoints).toFixed(4)) : 0,
        energyKwh: Number(energy.toFixed(4)),
      });
    }
  }
  return rows;
};
