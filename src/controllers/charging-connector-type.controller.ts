import { Response } from 'express';
import mongoose from 'mongoose';
import {
  createChargingConnectorType,
  deleteChargingConnectorType,
  listChargingConnectorTypes,
  updateChargingConnectorType,
} from '../services/charging-connector-type.service';
import { AuthRequest } from '../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

export const listChargingConnectorTypesHandler = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await listChargingConnectorTypes();

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createChargingConnectorTypeHandler = async (
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

    const name = normalizeText(req.body.name);
    const shortName = normalizeText(req.body.shortName);
    const chargingType = normalizeText(req.body.chargingType);
    const currentType = normalizeText(req.body.currentType);

    if (!name || !shortName || !chargingType || !currentType) {
      res.status(400).json({
        success: false,
        message: 'Thong tin loai cong sac khong hop le',
      });
      return;
    }

    const item = await createChargingConnectorType({
      name,
      shortName,
      chargingType,
      currentType,
      description: normalizeText(req.body.description),
      image: normalizeText(req.body.image),
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao loai cong sac thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateChargingConnectorTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Loai cong sac khong hop le',
      });
      return;
    }

    const name = normalizeText(req.body.name);
    const shortName = normalizeText(req.body.shortName);
    const chargingType = normalizeText(req.body.chargingType);
    const currentType = normalizeText(req.body.currentType);

    if (!name || !shortName || !chargingType || !currentType) {
      res.status(400).json({
        success: false,
        message: 'Thong tin loai cong sac khong hop le',
      });
      return;
    }

    const item = await updateChargingConnectorType(id, {
      name,
      shortName,
      chargingType,
      currentType,
      description: normalizeText(req.body.description),
      image: normalizeText(req.body.image),
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat loai cong sac thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteChargingConnectorTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Loai cong sac khong hop le',
      });
      return;
    }

    await deleteChargingConnectorType(id);

    res.status(200).json({
      success: true,
      message: 'Xoa loai cong sac thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
