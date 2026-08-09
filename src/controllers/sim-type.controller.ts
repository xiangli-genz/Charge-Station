import { Response } from 'express';
import mongoose from 'mongoose';
import {
  createSimType,
  deleteSimType,
  listSimTypes,
  updateSimType,
} from '../services/sim-type.service';
import { AuthRequest } from '../types/express';

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeCode = (value: unknown): string => {
  return normalizeText(value).toUpperCase();
};

export const listSimTypesHandler = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await listSimTypes();

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

export const createSimTypeHandler = async (
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
        message: 'Thong tin loai sim khong hop le',
      });
      return;
    }

    const item = await createSimType({
      name,
      code,
      description: normalizeText(req.body.description),
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Tao loai sim thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateSimTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Loai sim khong hop le',
      });
      return;
    }

    const name = normalizeText(req.body.name);
    const code = normalizeCode(req.body.code);

    if (!name || !code) {
      res.status(400).json({
        success: false,
        message: 'Thong tin loai sim khong hop le',
      });
      return;
    }

    const item = await updateSimType(id, {
      name,
      code,
      description: normalizeText(req.body.description),
    });

    res.status(200).json({
      success: true,
      message: 'Cap nhat loai sim thanh cong',
      item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteSimTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Loai sim khong hop le',
      });
      return;
    }

    await deleteSimType(id);

    res.status(200).json({
      success: true,
      message: 'Xoa loai sim thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
