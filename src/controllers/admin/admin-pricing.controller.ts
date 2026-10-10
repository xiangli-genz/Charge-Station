import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  createAdminPricing,
  deleteAdminPricing,
  getAdminPricingById,
  importAdminPricings,
  listAdminPricings,
  updateAdminPricing,
} from '../../services/admin-pricing.service';

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

const parseTimeRates = (
  value: unknown
): Array<{
  minutes: number;
  price: number;
}> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const minutes = parseNonNegativeNumber((item as { minutes?: unknown })?.minutes);
      const price = parseNonNegativeNumber((item as { price?: unknown })?.price);

      if (typeof minutes !== 'number' || typeof price !== 'number') {
        return null;
      }

      return { minutes, price };
    })
    .filter(
      (
        item
      ): item is {
        minutes: number;
        price: number;
      } => Boolean(item)
    );
};

const parseTimeFrames = (
  value: unknown
): Array<{
  name: string;
  startTime: string;
  endTime: string;
  price: number;
}> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const name =
        typeof (item as { name?: unknown })?.name === 'string'
          ? (item as { name: string }).name.trim()
          : '';
      const startTime =
        typeof (item as { startTime?: unknown })?.startTime === 'string'
          ? (item as { startTime: string }).startTime.trim()
          : '';
      const endTime =
        typeof (item as { endTime?: unknown })?.endTime === 'string'
          ? (item as { endTime: string }).endTime.trim()
          : '';
      const price = parseNonNegativeNumber((item as { price?: unknown })?.price);

      if (!name || !startTime || !endTime || typeof price !== 'number') {
        return null;
      }

      return { name, startTime, endTime, price };
    })
    .filter(
      (
        item
      ): item is {
        name: string;
        startTime: string;
        endTime: string;
        price: number;
      } => Boolean(item)
    );
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
    hourlyPrice: number;
    parkingFee: number;
    vat: number;
    description: string;
    timeRates: Array<{
      minutes: number;
      price: number;
    }>;
    timeFrames: Array<{
      name: string;
      startTime: string;
      endTime: string;
      price: number;
    }>;
  };
} => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const pricePerKwh = parseNonNegativeNumber(req.body.pricePerKwh);
  const pricePerMinute = parseNonNegativeNumber(req.body.pricePerMinute) ?? 0;
  const hourlyPrice = parseNonNegativeNumber(req.body.hourlyPrice) ?? 0;
  const parkingFee = parseNonNegativeNumber(req.body.parkingFee) ?? 0;
  const vat = parseNonNegativeNumber(req.body.vat) ?? 0;
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const timeRates = parseTimeRates(req.body.timeRates);
  const timeFrames = parseTimeFrames(req.body.timeFrames);

  if (!name || typeof pricePerKwh !== 'number') {
    return { valid: false };
  }

  return {
    valid: true,
    payload: {
      name,
      pricePerKwh,
      pricePerMinute,
      hourlyPrice,
      parkingFee,
      vat,
      description,
      timeRates,
      timeFrames,
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
