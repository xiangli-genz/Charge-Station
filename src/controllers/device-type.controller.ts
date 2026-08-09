import { Response } from 'express';
import mongoose from 'mongoose';
import {
  createDeviceType,
  deleteDeviceType,
  listDeviceTypes,
  updateDeviceType,
} from '../services/device-type.service';
import { AuthRequest } from '../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeCode = (value: unknown): string => {
  return normalizeText(value).toUpperCase();
};

export const listDeviceTypesHandler = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await listDeviceTypes();

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

export const createDeviceTypeHandler = async (
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
    const code = normalizeCode(req.body.code);

    if (!name || !code) {
      res.status(400).json({
        success: false,
        message: 'Thong tin loai thiet bi khong hop le',
      });
      return;
    }

    const item = await createDeviceType({
      name,
      code,
      manufacturer: normalizeText(req.body.manufacturer),
      description: normalizeText(req.body.description),
      image: normalizeText(req.body.image),
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao loai thiet bi thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateDeviceTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Loai thiet bi khong hop le',
      });
      return;
    }

    const name = normalizeText(req.body.name);
    const code = normalizeCode(req.body.code);

    if (!name || !code) {
      res.status(400).json({
        success: false,
        message: 'Thong tin loai thiet bi khong hop le',
      });
      return;
    }

    const item = await updateDeviceType(id, {
      name,
      code,
      manufacturer: normalizeText(req.body.manufacturer),
      description: normalizeText(req.body.description),
      image: normalizeText(req.body.image),
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat loai thiet bi thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteDeviceTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Loai thiet bi khong hop le',
      });
      return;
    }

    await deleteDeviceType(id);

    res.status(200).json({
      success: true,
      message: 'Xoa loai thiet bi thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
