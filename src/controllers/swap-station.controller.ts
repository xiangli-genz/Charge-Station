import { Request, Response } from 'express';
import { searchSwapStations, SwapStationSearchParams } from '../services/swap-station.service';
import { SwapStationStatus } from '../models/SwapStation';

const swapStationStatuses: SwapStationStatus[] = ['active', 'inactive', 'maintenance', 'closed'];

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

const parseBoolean = (value: unknown): boolean => value === 'true' || value === '1';

const buildSearchParams = (req: Request): SwapStationSearchParams => {
  const status =
    typeof req.query.status === 'string' &&
    swapStationStatuses.includes(req.query.status as SwapStationStatus)
      ? (req.query.status as SwapStationStatus)
      : undefined;

  return {
    keyword: typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined,
    provider: typeof req.query.provider === 'string' ? req.query.provider.trim() : undefined,
    supportedVehicleModel:
      typeof req.query.supportedVehicleModel === 'string'
        ? req.query.supportedVehicleModel.trim()
        : undefined,
    status,
    availableOnly: parseBoolean(req.query.availableOnly),
    lat: parseNumber(req.query.lat),
    lng: parseNumber(req.query.lng),
    radiusKm: parseNumber(req.query.radiusKm),
    page: parsePositiveInteger(req.query.page, 1),
    limit: Math.min(parsePositiveInteger(req.query.limit, 10), 50),
  };
};

export const getSwapStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchParams = buildSearchParams(req);
    const result = await searchSwapStations(searchParams);

    res.status(200).json({
      success: true,
      filters: searchParams,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Khong the lay danh sach tram doi pin',
      error: (error as Error).message,
    });
  }
};

export const getNearbySwapStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchParams = buildSearchParams(req);

    if (typeof searchParams.lat !== 'number' || typeof searchParams.lng !== 'number') {
      res.status(400).json({
        success: false,
        message: 'lat va lng la bat buoc de tim tram doi pin gan nhat',
      });
      return;
    }

    if (typeof searchParams.radiusKm !== 'number') {
      searchParams.radiusKm = 10;
    }

    const result = await searchSwapStations(searchParams);

    res.status(200).json({
      success: true,
      filters: searchParams,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Khong the tim tram doi pin gan nhat',
      error: (error as Error).message,
    });
  }
};
