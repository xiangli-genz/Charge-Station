import { Request, Response } from 'express';
import { ConnectorType } from '../models/ChargingPoint';
import { StationStatus } from '../models/Station';
import { searchStations, StationSearchParams } from '../services/station.service';

const stationStatuses: StationStatus[] = ['active', 'inactive', 'maintenance'];
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
