import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ConnectorType } from '../../models/ChargingPoint';
import { StationStatus } from '../../models/Station';
import { findNearbyStations, getStationDetails, searchStations, StationSearchParams } from '../../services/station.service';

const stationStatuses: StationStatus[] = ['active', 'inactive', 'maintenance', 'closed'];
const connectorTypes: ConnectorType[] = ['AC_Type2', 'CCS2', 'CHAdeMO', 'GB_T'];

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsedValue = parseNumber(value);

  if (typeof parsedValue !== 'number' || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
};

const parseBoolean = (value: unknown): boolean => {
  return value === 'true' || value === '1';
};

export const getStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const status =
      typeof req.query.status === 'string' && stationStatuses.includes(req.query.status as StationStatus)
        ? (req.query.status as StationStatus)
        : undefined;

    const connectorType =
      typeof req.query.connectorType === 'string' &&
      connectorTypes.includes(req.query.connectorType as ConnectorType)
        ? (req.query.connectorType as ConnectorType)
        : undefined;

    const searchParams: StationSearchParams = {
      keyword: typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined,
      status,
      connectorType,
      minPowerKw: parseNumber(req.query.minPowerKw),
      maxPowerKw: parseNumber(req.query.maxPowerKw),
      availableOnly: parseBoolean(req.query.availableOnly),
      page: parsePositiveInteger(req.query.page, 1),
      limit: Math.min(parsePositiveInteger(req.query.limit, 10), 50),
    };

    const result = await searchStations(searchParams);

    res.status(200).json({
      success: true,
      filters: searchParams,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Khong the lay danh sach tram sac',
      error: (error as Error).message,
    });
  }
};

export const getStationById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: 'Tram sac id khong hop le' });
      return;
    }
    res.status(200).json({ success: true, item: await getStationDetails(req.params.id) });
  } catch (error) {
    res.status(404).json({ success: false, message: (error as Error).message });
  }
};

export const getNearbyStations = async (req: Request, res: Response): Promise<void> => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm || 10);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180 || !Number.isFinite(radiusKm) || radiusKm <= 0) {
    res.status(400).json({ success: false, message: 'Toa do va ban kinh khong hop le' });
    return;
  }
  try {
    const items = await findNearbyStations({ lat, lng, radiusKm: Math.min(radiusKm, 100), limit });
    res.status(200).json({ success: true, items, center: { lat, lng }, radiusKm });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
