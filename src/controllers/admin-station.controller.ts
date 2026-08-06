import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StationStatus } from '../models/Station';
import {
  createAdminStation,
  deleteAdminStation,
  getAdminStationById,
  importAdminStations,
  listAdminStations,
  updateAdminStation,
} from '../services/admin-station.service';

const stationStatuses: StationStatus[] = ['active', 'inactive', 'maintenance'];

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseStationStatus = (value: unknown): StationStatus | undefined => {
  return typeof value === 'string' && stationStatuses.includes(value as StationStatus)
    ? (value as StationStatus)
    : undefined;
};

const parseLocationNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

export const listAdminStationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const status = parseStationStatus(req.query.status);
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined;

    const result = await listAdminStations({ page, limit, status, keyword });

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

export const getAdminStationByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Station id khong hop le',
      });
      return;
    }

    const station = await getAdminStationById(id);

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

export const createAdminStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    const lat = parseLocationNumber(req.body.location?.lat);
    const lng = parseLocationNumber(req.body.location?.lng);
    const status = parseStationStatus(req.body.status);

    if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Thong tin tram sac khong hop le',
      });
      return;
    }

    const station = await createAdminStation({
      name,
      address,
      location: { lat, lng },
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Tao tram sac thanh cong',
      item: station,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAdminStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Station id khong hop le',
      });
      return;
    }

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    const lat = parseLocationNumber(req.body.location?.lat);
    const lng = parseLocationNumber(req.body.location?.lng);
    const status = parseStationStatus(req.body.status);

    if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Thong tin tram sac khong hop le',
      });
      return;
    }

    const station = await updateAdminStation(id, {
      name,
      address,
      location: { lat, lng },
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat tram sac thanh cong',
      item: station,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAdminStationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Station id khong hop le',
      });
      return;
    }

    await deleteAdminStation(id);

    res.status(200).json({
      success: true,
      message: 'Xoa tram sac thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const importAdminStationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await importAdminStations({
      format: req.body.format,
      mode: req.body.mode,
      content: req.body.content,
      items: req.body.items,
    });

    res.status(200).json({
      success: true,
      message: 'Import tram sac thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
