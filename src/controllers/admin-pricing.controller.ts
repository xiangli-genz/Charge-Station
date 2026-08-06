import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  createAdminPricing,
  deleteAdminPricing,
  getAdminPricingById,
  importAdminPricings,
  listAdminPricings,
  updateAdminPricing,
} from '../services/admin-pricing.service';

const parsePositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const parseNonNegativeNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const isValidObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

export const listAdminPricingsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 50);
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined;

    const result = await listAdminPricings({ page, limit, keyword });

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

export const getAdminPricingByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Pricing id khong hop le',
      });
      return;
    }

    const pricing = await getAdminPricingById(id);
    res.status(200).json({
      success: true,
      item: pricing,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

const validatePricingPayload = (
  req: Request
): {
  valid: boolean;
  payload?: {
    name: string;
    pricePerKwh: number;
    pricePerMinute: number;
  };
} => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const pricePerKwh = parseNonNegativeNumber(req.body.pricePerKwh);
  const pricePerMinute = parseNonNegativeNumber(req.body.pricePerMinute) ?? 0;

  if (!name || typeof pricePerKwh !== 'number') {
    return { valid: false };
  }

  return {
    valid: true,
    payload: {
      name,
      pricePerKwh,
      pricePerMinute,
    },
  };
};

export const createAdminPricingHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = validatePricingPayload(req);

    if (!validation.valid || !validation.payload) {
      res.status(400).json({
        success: false,
        message: 'Thong tin bang gia khong hop le',
      });
      return;
    }

    const pricing = await createAdminPricing(validation.payload);
    res.status(201).json({
      success: true,
      message: 'Tao bang gia thanh cong',
      item: pricing,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAdminPricingHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Pricing id khong hop le',
      });
      return;
    }

    const validation = validatePricingPayload(req);

    if (!validation.valid || !validation.payload) {
      res.status(400).json({
        success: false,
        message: 'Thong tin bang gia khong hop le',
      });
      return;
    }

    const pricing = await updateAdminPricing(id, validation.payload);
    res.status(200).json({
      success: true,
      message: 'Cap nhat bang gia thanh cong',
      item: pricing,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAdminPricingHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Pricing id khong hop le',
      });
      return;
    }

    await deleteAdminPricing(id);
    res.status(200).json({
      success: true,
      message: 'Xoa bang gia thanh cong',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const importAdminPricingsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await importAdminPricings({
      format: req.body.format,
      mode: req.body.mode,
      content: req.body.content,
      items: req.body.items,
    });

    res.status(200).json({
      success: true,
      message: 'Import bang gia thanh cong',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
