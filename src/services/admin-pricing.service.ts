import Pricing, { IPricing } from '../models/Pricing';
import {
  ImportResult,
  parseImportPayload,
  parseNumberField,
  parseStringField,
} from '../utils/import.util';

interface PricingListParams {
  page: number;
  limit: number;
  keyword?: string;
}

interface PricingPayload {
  name: string;
  pricePerKwh: number;
  pricePerMinute: number;
  hourlyPrice: number;
  parkingFee: number;
  vat: number;
  description?: string;
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
}

type PricingImportPayload = {
  format?: unknown;
  mode?: unknown;
  content?: unknown;
  items?: unknown;
};

export interface AdminPricingResponse {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPricingListResponse {
  items: AdminPricingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const toPricingResponse = (pricing: IPricing): AdminPricingResponse => ({
  id: pricing._id.toString(),
  name: pricing.name,
  pricePerKwh: pricing.pricePerKwh,
  pricePerMinute: pricing.pricePerMinute,
  hourlyPrice: pricing.hourlyPrice || 0,
  parkingFee: pricing.parkingFee || 0,
  vat: pricing.vat || 0,
  description: pricing.description || '',
  timeRates: Array.isArray(pricing.timeRates)
    ? pricing.timeRates.map((item) => ({
        minutes: Number(item.minutes || 0),
        price: Number(item.price || 0),
      }))
    : [],
  timeFrames: Array.isArray(pricing.timeFrames)
    ? pricing.timeFrames.map((item) => ({
        name: item.name || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        price: Number(item.price || 0),
      }))
    : [],
  createdAt: pricing.createdAt,
  updatedAt: pricing.updatedAt,
});

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizePricingRow = (
  row: Record<string, unknown>
): PricingPayload | null => {
  const name = parseStringField(row.name);
  const pricePerKwh = parseNumberField(row.pricePerKwh);
  const pricePerMinute = parseNumberField(row.pricePerMinute) ?? 0;
  const hourlyPrice = parseNumberField(row.hourlyPrice) ?? 0;
  const parkingFee = parseNumberField(row.parkingFee) ?? 0;
  const vat = parseNumberField(row.vat) ?? 0;
  const description = parseStringField(row.description);

  if (
    !name ||
    typeof pricePerKwh !== 'number' ||
    pricePerKwh < 0 ||
    pricePerMinute < 0 ||
    hourlyPrice < 0 ||
    parkingFee < 0 ||
    vat < 0
  ) {
    return null;
  }

  return {
    name,
    pricePerKwh,
    pricePerMinute,
    hourlyPrice,
    parkingFee,
    vat,
    description,
    timeRates: [],
    timeFrames: [],
  };
};

const findExistingPricing = async (name: string): Promise<IPricing | null> => {
  return Pricing.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
  });
};

export const listAdminPricings = async (
  params: PricingListParams
): Promise<AdminPricingListResponse> => {
  const filter: {
    name?: RegExp;
  } = {};

  if (params.keyword) {
    filter.name = new RegExp(params.keyword, 'i');
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    Pricing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(params.limit),
    Pricing.countDocuments(filter),
  ]);

  return {
    items: items.map(toPricingResponse),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};

export const getAdminPricingById = async (pricingId: string): Promise<AdminPricingResponse> => {
  const pricing = await Pricing.findById(pricingId);

  if (!pricing) {
    throw new Error('Bang gia khong ton tai');
  }

  return toPricingResponse(pricing);
};

export const createAdminPricing = async (
  payload: PricingPayload
): Promise<AdminPricingResponse> => {
  const existingPricing = await findExistingPricing(payload.name);

  if (existingPricing) {
    throw new Error('Ten bang gia da ton tai');
  }

  const pricing = await Pricing.create({
    ...payload,
    description: payload.description || '',
    timeRates: Array.isArray(payload.timeRates) ? payload.timeRates : [],
    timeFrames: Array.isArray(payload.timeFrames) ? payload.timeFrames : [],
  });
  return toPricingResponse(pricing);
};

export const updateAdminPricing = async (
  pricingId: string,
  payload: PricingPayload
): Promise<AdminPricingResponse> => {
  const existingPricing = await Pricing.findOne({
    name: new RegExp(`^${escapeRegex(payload.name)}$`, 'i'),
    _id: { $ne: pricingId },
  });

  if (existingPricing) {
    throw new Error('Ten bang gia da ton tai');
  }

  const pricing = await Pricing.findByIdAndUpdate(
    pricingId,
    {
      ...payload,
      description: payload.description || '',
      timeRates: Array.isArray(payload.timeRates) ? payload.timeRates : [],
      timeFrames: Array.isArray(payload.timeFrames) ? payload.timeFrames : [],
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!pricing) {
    throw new Error('Bang gia khong ton tai');
  }

  return toPricingResponse(pricing);
};

export const deleteAdminPricing = async (pricingId: string): Promise<void> => {
  const pricing = await Pricing.findById(pricingId);

  if (!pricing) {
    throw new Error('Bang gia khong ton tai');
  }

  await pricing.deleteOne();
};

export const importAdminPricings = async (
  payload: PricingImportPayload
): Promise<ImportResult<AdminPricingResponse>> => {
  const parsedPayload = parseImportPayload(payload);
  const result: ImportResult<AdminPricingResponse> = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    items: [],
  };

  for (const [index, row] of parsedPayload.rows.entries()) {
    const normalizedRow = normalizePricingRow(row);

    if (!normalizedRow) {
      result.skipped += 1;
      result.errors.push(`Dong ${index + 1}: du lieu bang gia khong hop le`);
      continue;
    }

    const existingPricing = await findExistingPricing(normalizedRow.name);

    if (existingPricing) {
      if (parsedPayload.mode === 'insert') {
        result.skipped += 1;
        result.errors.push(`Dong ${index + 1}: bang gia da ton tai`);
        continue;
      }

      existingPricing.name = normalizedRow.name;
      existingPricing.pricePerKwh = normalizedRow.pricePerKwh;
      existingPricing.pricePerMinute = normalizedRow.pricePerMinute;
      existingPricing.hourlyPrice = normalizedRow.hourlyPrice;
      existingPricing.parkingFee = normalizedRow.parkingFee;
      existingPricing.vat = normalizedRow.vat;
      existingPricing.description = normalizedRow.description || '';
      existingPricing.timeRates = normalizedRow.timeRates;
      existingPricing.timeFrames = normalizedRow.timeFrames;
      await existingPricing.save();

      result.updated += 1;
      result.items.push(toPricingResponse(existingPricing));
      continue;
    }

    const pricing = await Pricing.create(normalizedRow);
    result.created += 1;
    result.items.push(toPricingResponse(pricing));
  }

  return result;
};
