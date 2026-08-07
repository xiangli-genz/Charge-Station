import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SwapStationStatus } from '../models/SwapStation';
import {
  createAdminSwapStation,
  deleteAdminSwapStation,
  getAdminSwapStationById,
  importAdminSwapStations,
  listAdminSwapStations,
  updateAdminSwapStation,
} from '../services/admin-swap-station.service';

const swapStationStatuses: SwapStationStatus[] = ['active', 'inactive', 'maintenance', 'closed'];

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseStationStatus = (value: unknown): SwapStationStatus | undefined => {
  return typeof value === 'string' && swapStationStatuses.includes(value as SwapStationStatus)
    ? (value as SwapStationStatus)
    : undefined;
};

const parseLocationNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseNonNegativeNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

export const listAdminSwapStationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const status = parseStationStatus(req.query.status);
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined;
    const provider =
      typeof req.query.provider === 'string' ? req.query.provider.trim() : undefined;

    const result = await listAdminSwapStations({ page, limit, status, keyword, provider });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getAdminSwapStationByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Swap station id khong hop le',
      });
      return;
    }

    const station = await getAdminSwapStationById(id);

    res.status(200).json({
      success: true,
      item: station,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

const validatePayload = (req: Request): { valid: boolean; payload?: Parameters<typeof createAdminSwapStation>[0] } => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
  const provider = typeof req.body.provider === 'string' ? req.body.provider.trim() : 'VinFast';
  const lat = parseLocationNumber(req.body.location?.lat);
  const lng = parseLocationNumber(req.body.location?.lng);
  const totalBatterySlots = parseNonNegativeNumber(req.body.totalBatterySlots);
  const availableBatterySlots = parseNonNegativeNumber(req.body.availableBatterySlots);
  const status = parseStationStatus(req.body.status);
  const supportedVehicleModels = parseStringArray(req.body.supportedVehicleModels);

  if (
    !name ||
    !address ||
    !provider ||
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    typeof totalBatterySlots !== 'number' ||
    typeof availableBatterySlots !== 'number' ||
    availableBatterySlots > totalBatterySlots
  ) {
    return { valid: false };
  }

  return {
    valid: true,
    payload: {
      name,
      address,
      provider,
      supportedVehicleModels,
      location: { lat, lng },
      totalBatterySlots,
      availableBatterySlots,
      status,
    },
  };
};

export const createAdminSwapStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = validatePayload(req);

    if (!validation.valid || !validation.payload) {
      res.status(400).json({
        success: false,
        message: 'Thong tin tram doi pin khong hop le',
      });
      return;
    }

    const station = await createAdminSwapStation(validation.payload);

    res.status(201).json({
      success: true,
      message: 'Tao tram doi pin thanh cong',
      item: station,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAdminSwapStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Swap station id khong hop le',
      });
      return;
    }

    const validation = validatePayload(req);

    if (!validation.valid || !validation.payload) {
      res.status(400).json({
        success: false,
        message: 'Thong tin tram doi pin khong hop le',
      });
      return;
    }

    const station = await updateAdminSwapStation(id, validation.payload);

    res.status(200).json({
      success: true,
      message: 'Cap nhat tram doi pin thanh cong',
      item: station,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAdminSwapStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Swap station id khong hop le',
      });
      return;
    }

    await deleteAdminSwapStation(id);

    res.status(200).json({
      success: true,
      message: 'Xoa tram doi pin thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const importAdminSwapStationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await importAdminSwapStations({
      format: req.body.format,
      mode: req.body.mode,
      content: req.body.content,
      items: req.body.items,
    });

    res.status(200).json({
      success: true,
      message: 'Import tram doi pin thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
