import Pricing from '../models/Pricing';
import ChargingPoint, {
  ChargingPointStatus,
  ConnectorType,
  IChargingPoint,
} from '../models/ChargingPoint';
import Station from '../models/Station';
import {
  ImportResult,
  parseImportPayload,
  parseNumberField,
  parseStringField,
} from '../utils/import.util';

interface ChargingPointListParams {
  page: number;
  limit: number;
  stationId?: string;
  status?: ChargingPointStatus;
  connectorType?: ConnectorType;
}

interface ChargingPointPayload {
  stationId: string;
  pricingId: string;
  code: string;
  connectorType: ConnectorType;
  outputCurrentType?: string;
  inputSupply?: string;
  maxOutputCurrentA?: number | null;
  description?: string;
  powerKw: number;
  maxOutputVoltage?: string;
  multiPortEnabled?: boolean;
  positionLabel?: string;
  status?: ChargingPointStatus;
}

type ChargingPointImportPayload = {
  format?: unknown;
  mode?: unknown;
  content?: unknown;
  items?: unknown;
};

export interface AdminChargingPointResponse {
  id: string;
  station: {
    id: string;
    name: string;
  };
  pricing: {
    id: string;
    name: string;
    pricePerKwh: number;
    pricePerMinute: number;
  };
  code: string;
  connectorType: ConnectorType;
  outputCurrentType: string;
  inputSupply: string;
  maxOutputCurrentA: number | null;
  description: string;
  powerKw: number;
  maxOutputVoltage: string;
  multiPortEnabled: boolean;
  positionLabel: string;
  status: ChargingPointStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminChargingPointListResponse {
  items: AdminChargingPointResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type ChargingPointPopulated = IChargingPoint & {
  station: {
    _id: IChargingPoint['station'];
    name: string;
  };
  pricing: {
    _id: IChargingPoint['pricing'];
    name: string;
    pricePerKwh: number;
    pricePerMinute: number;
  };
};

const toChargingPointResponse = (
  chargingPoint: ChargingPointPopulated
): AdminChargingPointResponse => ({
  id: chargingPoint._id.toString(),
  station: {
    id: chargingPoint.station._id.toString(),
    name: chargingPoint.station.name,
  },
  pricing: {
    id: chargingPoint.pricing._id.toString(),
    name: chargingPoint.pricing.name,
    pricePerKwh: chargingPoint.pricing.pricePerKwh,
    pricePerMinute: chargingPoint.pricing.pricePerMinute,
  },
  code: chargingPoint.code,
  connectorType: chargingPoint.connectorType,
  outputCurrentType: chargingPoint.outputCurrentType || '',
  inputSupply: chargingPoint.inputSupply || '',
  maxOutputCurrentA:
    typeof chargingPoint.maxOutputCurrentA === 'number' ? chargingPoint.maxOutputCurrentA : null,
  description: chargingPoint.description || '',
  powerKw: chargingPoint.powerKw,
  maxOutputVoltage: chargingPoint.maxOutputVoltage || '',
  multiPortEnabled: Boolean(chargingPoint.multiPortEnabled),
  positionLabel: chargingPoint.positionLabel || '',
  status: chargingPoint.status,
  createdAt: chargingPoint.createdAt,
  updatedAt: chargingPoint.updatedAt,
});

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const connectorTypes: ConnectorType[] = ['AC_Type2', 'CCS2', 'CHAdeMO', 'GB_T'];
const chargingPointStatuses: ChargingPointStatus[] = [
  'available',
  'occupied',
  'reserved',
  'maintenance',
];

const parseConnectorType = (value: unknown): ConnectorType | undefined => {
  return typeof value === 'string' && connectorTypes.includes(value as ConnectorType)
    ? (value as ConnectorType)
    : undefined;
};

const parseChargingPointStatus = (value: unknown): ChargingPointStatus => {
  return typeof value === 'string' &&
    chargingPointStatuses.includes(value as ChargingPointStatus)
    ? (value as ChargingPointStatus)
    : 'available';
};

const parseBooleanField = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'on' || normalized === 'yes';
  }

  return false;
};

const resolveStationId = async (row: Record<string, unknown>): Promise<string | null> => {
  const stationId = parseStringField(row.stationId);

  if (stationId) {
    const station = await Station.findById(stationId);
    return station ? station._id.toString() : null;
  }

  const stationName = parseStringField(row.stationName);
  const stationAddress = parseStringField(row.stationAddress);

  if (!stationName) {
    return null;
  }

  const query: {
    name: RegExp;
    address?: RegExp;
  } = {
    name: new RegExp(`^${escapeRegex(stationName)}$`, 'i'),
  };

  if (stationAddress) {
    query.address = new RegExp(`^${escapeRegex(stationAddress)}$`, 'i');
  }

  const station = await Station.findOne(query);
  return station ? station._id.toString() : null;
};

const resolvePricingId = async (row: Record<string, unknown>): Promise<string | null> => {
  const pricingId = parseStringField(row.pricingId);

  if (pricingId) {
    const pricing = await Pricing.findById(pricingId);
    return pricing ? pricing._id.toString() : null;
  }

  const pricingName = parseStringField(row.pricingName);

  if (!pricingName) {
    return null;
  }

  const pricing = await Pricing.findOne({
    name: new RegExp(`^${escapeRegex(pricingName)}$`, 'i'),
  });

  return pricing ? pricing._id.toString() : null;
};

const normalizeChargingPointRow = async (
  row: Record<string, unknown>
): Promise<ChargingPointPayload | null> => {
  const stationId = await resolveStationId(row);
  const pricingId = await resolvePricingId(row);
  const code = parseStringField(row.code);
  const connectorType = parseConnectorType(row.connectorType);
  const outputCurrentType = parseStringField(row.outputCurrentType || row.currentType);
  const inputSupply = parseStringField(row.inputSupply);
  const maxOutputCurrentA = parseNumberField(row.maxOutputCurrentA);
  const description = parseStringField(row.description);
  const powerKw = parseNumberField(row.powerKw);
  const maxOutputVoltage = parseStringField(row.maxOutputVoltage);
  const multiPortEnabled = parseBooleanField(row.multiPortEnabled || row.createMultiple);
  const positionLabel = parseStringField(row.positionLabel || row.position);
  const status = parseChargingPointStatus(row.status);

  if (
    !stationId ||
    !pricingId ||
    !code ||
    !connectorType ||
    typeof powerKw !== 'number' ||
    powerKw <= 0
  ) {
    return null;
  }

  return {
    stationId,
    pricingId,
    code,
    connectorType,
    outputCurrentType,
    inputSupply,
    maxOutputCurrentA:
      typeof maxOutputCurrentA === 'number' && maxOutputCurrentA > 0 ? maxOutputCurrentA : null,
    description,
    powerKw,
    maxOutputVoltage,
    multiPortEnabled,
    positionLabel,
    status,
  };
};

const ensureStationAndPricing = async (
  stationId: string,
  pricingId: string
): Promise<void> => {
  const [station, pricing] = await Promise.all([
    Station.findById(stationId),
    Pricing.findById(pricingId),
  ]);

  if (!station) {
    throw new Error('Tram sac khong ton tai');
  }

  if (!pricing) {
    throw new Error('Bang gia khong ton tai');
  }
};

const getPopulatedChargingPoint = async (
  chargingPointId: string
): Promise<ChargingPointPopulated> => {
  const chargingPoint = await ChargingPoint.findById(chargingPointId)
    .populate('station', 'name')
    .populate('pricing', 'name pricePerKwh pricePerMinute');

  if (!chargingPoint) {
    throw new Error('Cong sac khong ton tai');
  }

  return chargingPoint as unknown as ChargingPointPopulated;
};

export const listAdminChargingPoints = async (
  params: ChargingPointListParams
): Promise<AdminChargingPointListResponse> => {
  const filter: {
    station?: string;
    status?: ChargingPointStatus;
    connectorType?: ConnectorType;
  } = {};

  if (params.stationId) {
    filter.station = params.stationId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.connectorType) {
    filter.connectorType = params.connectorType;
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    ChargingPoint.find(filter)
      .populate('station', 'name')
      .populate('pricing', 'name pricePerKwh pricePerMinute')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit),
    ChargingPoint.countDocuments(filter),
  ]);

  return {
    items: items.map((item) =>
      toChargingPointResponse(item as unknown as ChargingPointPopulated)
    ),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};

export const getAdminChargingPointById = async (
  chargingPointId: string
): Promise<AdminChargingPointResponse> => {
  const chargingPoint = await getPopulatedChargingPoint(chargingPointId);
  return toChargingPointResponse(chargingPoint);
};

export const createAdminChargingPoint = async (
  payload: ChargingPointPayload
): Promise<AdminChargingPointResponse> => {
  await ensureStationAndPricing(payload.stationId, payload.pricingId);

  const existingCode = await ChargingPoint.findOne({ code: payload.code });

  if (existingCode) {
    throw new Error('Ma cong sac da ton tai');
  }

  const chargingPoint = await ChargingPoint.create({
    station: payload.stationId,
    pricing: payload.pricingId,
    code: payload.code,
    connectorType: payload.connectorType,
    outputCurrentType: payload.outputCurrentType || '',
    inputSupply: payload.inputSupply || '',
    maxOutputCurrentA:
      typeof payload.maxOutputCurrentA === 'number' && payload.maxOutputCurrentA > 0
        ? payload.maxOutputCurrentA
        : null,
    description: payload.description || '',
    powerKw: payload.powerKw,
    maxOutputVoltage: payload.maxOutputVoltage || '',
    multiPortEnabled: Boolean(payload.multiPortEnabled),
    positionLabel: payload.positionLabel || '',
    status: payload.status || 'available',
  });

  const populatedChargingPoint = await getPopulatedChargingPoint(chargingPoint._id.toString());
  return toChargingPointResponse(populatedChargingPoint);
};

export const updateAdminChargingPoint = async (
  chargingPointId: string,
  payload: ChargingPointPayload
): Promise<AdminChargingPointResponse> => {
  await ensureStationAndPricing(payload.stationId, payload.pricingId);

  const existingCode = await ChargingPoint.findOne({
    code: payload.code,
    _id: { $ne: chargingPointId },
  });

  if (existingCode) {
    throw new Error('Ma cong sac da ton tai');
  }

  const chargingPoint = await ChargingPoint.findByIdAndUpdate(
    chargingPointId,
    {
      station: payload.stationId,
      pricing: payload.pricingId,
      code: payload.code,
      connectorType: payload.connectorType,
      outputCurrentType: payload.outputCurrentType || '',
      inputSupply: payload.inputSupply || '',
      maxOutputCurrentA:
        typeof payload.maxOutputCurrentA === 'number' && payload.maxOutputCurrentA > 0
          ? payload.maxOutputCurrentA
          : null,
      description: payload.description || '',
      powerKw: payload.powerKw,
      maxOutputVoltage: payload.maxOutputVoltage || '',
      multiPortEnabled: Boolean(payload.multiPortEnabled),
      positionLabel: payload.positionLabel || '',
      status: payload.status || 'available',
    },
    { new: true, runValidators: true }
  );

  if (!chargingPoint) {
    throw new Error('Cong sac khong ton tai');
  }

  const populatedChargingPoint = await getPopulatedChargingPoint(chargingPoint._id.toString());
  return toChargingPointResponse(populatedChargingPoint);
};

export const deleteAdminChargingPoint = async (chargingPointId: string): Promise<void> => {
  const chargingPoint = await ChargingPoint.findById(chargingPointId);

  if (!chargingPoint) {
    throw new Error('Cong sac khong ton tai');
  }

  await chargingPoint.deleteOne();
};

export const importAdminChargingPoints = async (
  payload: ChargingPointImportPayload
): Promise<ImportResult<AdminChargingPointResponse>> => {
  const parsedPayload = parseImportPayload(payload);
  const result: ImportResult<AdminChargingPointResponse> = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    items: [],
  };

  for (const [index, row] of parsedPayload.rows.entries()) {
    const normalizedRow = await normalizeChargingPointRow(row);

    if (!normalizedRow) {
      result.skipped += 1;
      result.errors.push(`Dong ${index + 1}: du lieu cong sac khong hop le`);
      continue;
    }

    const existingChargingPoint = await ChargingPoint.findOne({ code: normalizedRow.code });

    if (existingChargingPoint) {
      if (parsedPayload.mode === 'insert') {
        result.skipped += 1;
        result.errors.push(`Dong ${index + 1}: ma cong sac da ton tai`);
        continue;
      }

      existingChargingPoint.station = normalizedRow.stationId as unknown as IChargingPoint['station'];
      existingChargingPoint.pricing = normalizedRow.pricingId as unknown as IChargingPoint['pricing'];
      existingChargingPoint.code = normalizedRow.code;
      existingChargingPoint.connectorType = normalizedRow.connectorType;
      existingChargingPoint.outputCurrentType = normalizedRow.outputCurrentType || '';
      existingChargingPoint.inputSupply = normalizedRow.inputSupply || '';
      existingChargingPoint.maxOutputCurrentA = normalizedRow.maxOutputCurrentA ?? null;
      existingChargingPoint.description = normalizedRow.description || '';
      existingChargingPoint.powerKw = normalizedRow.powerKw;
      existingChargingPoint.maxOutputVoltage = normalizedRow.maxOutputVoltage || '';
      existingChargingPoint.multiPortEnabled = Boolean(normalizedRow.multiPortEnabled);
      existingChargingPoint.positionLabel = normalizedRow.positionLabel || '';
      existingChargingPoint.status = normalizedRow.status || 'available';
      await existingChargingPoint.save();

      const populated = await getPopulatedChargingPoint(existingChargingPoint._id.toString());
      result.updated += 1;
      result.items.push(toChargingPointResponse(populated));
      continue;
    }

    const chargingPoint = await ChargingPoint.create({
      station: normalizedRow.stationId,
      pricing: normalizedRow.pricingId,
      code: normalizedRow.code,
      connectorType: normalizedRow.connectorType,
      outputCurrentType: normalizedRow.outputCurrentType || '',
      inputSupply: normalizedRow.inputSupply || '',
      maxOutputCurrentA: normalizedRow.maxOutputCurrentA ?? null,
      description: normalizedRow.description || '',
      powerKw: normalizedRow.powerKw,
      maxOutputVoltage: normalizedRow.maxOutputVoltage || '',
      multiPortEnabled: Boolean(normalizedRow.multiPortEnabled),
      positionLabel: normalizedRow.positionLabel || '',
      status: normalizedRow.status || 'available',
    });

    const populatedChargingPoint = await getPopulatedChargingPoint(chargingPoint._id.toString());
    result.created += 1;
    result.items.push(toChargingPointResponse(populatedChargingPoint));
  }

  return result;
};
