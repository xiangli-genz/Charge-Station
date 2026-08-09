import { Response } from 'express';
import { AuthRequest } from '../types/express';
import {
  addFavoriteStation,
  listFavoriteStations,
  removeFavoriteStation,
} from '../services/favorite-station.service';
import { createActivityLog } from '../services/activity-log.service';

export const listFavoriteStationsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const items = await listFavoriteStations(req.user.id);

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const addFavoriteStationHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const item = await addFavoriteStation(req.user.id, String(req.body.stationId || ''));

    await createActivityLog({
      userId: req.user.id,
      action: 'favorite_station_add',
      entityType: 'station',
      entityId: item.station.id,
      message: `Da them tram ${item.station.name} vao yeu thich`,
    });

    res.status(201).json({
      success: true,
      message: 'Them tram yeu thich thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const removeFavoriteStationHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Chua xac thuc nguoi dung',
      });
      return;
    }

    const stationId = req.params.stationId;
    await removeFavoriteStation(req.user.id, stationId);

    await createActivityLog({
      userId: req.user.id,
      action: 'favorite_station_remove',
      entityType: 'station',
      entityId: stationId,
      message: 'Da xoa tram khoi danh sach yeu thich',
    });

    res.status(200).json({
      success: true,
      message: 'Xoa tram yeu thich thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
