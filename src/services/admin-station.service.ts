import ChargingPoint from '../models/ChargingPoint';
import Station, { IStation, StationStatus } from '../models/Station';
import {
  ImportResult,
  parseImportPayload,
  parseNumberField,
  parseStringField,
} from '../utils/import.util';

interface StationListParams {
  page: number;
  limit: number;
  status?: StationStatus;
  keyword?: string;
}

interface StationPayload {
  imei?: string;
  name: string;
  address: string;
  city?: string;
  district?: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
  };
  status?: StationStatus;
  chargingType?: string;
  currentType?: string;
  isActivated?: boolean;
  activatedAt?: Date | null;
  warrantyUntil?: Date | null;
  simType?: string;
  simNumber?: string;
  billingSimNumber?: string;
  supportPhone?: string;
  open24_7?: boolean;
  amenities?: string[];
}

export interface AdminStationResponse {
  id: string;
  imei: string;
  name: string;
  address: string;
  city: string;
  district: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  chargingType: string;
  currentType: string;
  isActivated: boolean;
  activatedAt: Date | null;
  warrantyUntil: Date | null;
  simType: string;
  simNumber: string;
  billingSimNumber: string;
  supportPhone: string;
  open24_7: boolean;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStationListResponse {
  items: AdminStationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type StationImportPayload = {
  format?: unknown;
  mode?: unknown;
  content?: unknown;
  items?: unknown;
};

type NormalizedStationRow = {
  imei: string;
  name: string;
  address: string;
  city: string;
  district: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  chargingType: string;
  currentType: string;
  isActivated: boolean;
  activatedAt: Date | null | undefined;
  warrantyUntil: Date | null | undefined;
  simType: string;
  simNumber: string;
  billingSimNumber: string;
  supportPhone: string;
  open24_7: boolean;
  amenities: string[];
};

const toStationResponse = (station: IStation): AdminStationResponse => ({
  id: station._id.toString(),
  imei: station.imei || '',
  name: station.name,
  address: station.address,
  city: station.city || '',
  district: station.district || '',
  description: station.description || '',
  location: station.location,
  status: station.status,
  chargingType: station.chargingType || '',
  currentType: station.currentType || '',
  isActivated: Boolean(station.isActivated),
  activatedAt: station.activatedAt || null,
  warrantyUntil: station.warrantyUntil || null,
  simType: station.simType || '',
  simNumber: station.simNumber || '',
  billingSimNumber: station.billingSimNumber || '',
  supportPhone: station.supportPhone || '',
  open24_7: Boolean(station.open24_7),
  amenities: Array.isArray(station.amenities) ? station.amenities : [],
  createdAt: station.createdAt,
  updatedAt: station.updatedAt,
});

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseStationStatus = (value: unknown): StationStatus => {
  return value === 'inactive' || value === 'maintenance' || value === 'closed' ? value : 'active';
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

const parseDateField = (value: unknown): Date | null | undefined => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const parseAmenitiesField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => parseStringField(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeStationRow = (
  row: Record<string, unknown>
): NormalizedStationRow | null => {
  const imei = parseStringField(row.imei);
  const name = parseStringField(row.name);
  const address = parseStringField(row.address);
  const city = parseStringField(row.city);
  const district = parseStringField(row.district);
  const description = parseStringField(row.description || row.notes);
  const lat = parseNumberField((row.location as { lat?: unknown } | undefined)?.lat ?? row.lat);
  const lng = parseNumberField((row.location as { lng?: unknown } | undefined)?.lng ?? row.lng);
  const status = parseStationStatus(row.status);
  const chargingType = parseStringField(row.chargingType || row.charging_type);
  const currentType = parseStringField(row.currentType || row.current_type);
  const isActivated = parseBooleanField(row.isActivated || row.activated || row.active);
  const activatedAt = parseDateField(row.activatedAt || row.activationDate || row.activation_date);
  const warrantyUntil = parseDateField(row.warrantyUntil || row.warranty_date || row.warrantyDate);
  const simType = parseStringField(row.simType || row.sim_type);
  const simNumber = parseStringField(row.simNumber || row.sim_number);
  const billingSimNumber = parseStringField(row.billingSimNumber || row.billing_sim_number);
  const supportPhone = parseStringField(row.supportPhone || row.support_phone);
  const open24_7 = parseBooleanField(row.open24_7 || row.open247 || row.open24_7_flag);
  const amenities = parseAmenitiesField(row.amenities);

  if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return {
    imei: imei || '',
    name,
    address,
    city,
    district,
    description,
    location: { lat, lng },
    status,
    chargingType,
    currentType,
    isActivated,
    activatedAt,
    warrantyUntil,
    simType,
    simNumber,
    billingSimNumber,
    supportPhone,
    open24_7,
    amenities,
  };
};

const findExistingStation = async (payload: {
  imei?: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}): Promise<IStation | null> => {
  if (payload.imei) {
    const stationByImei = await Station.findOne({
      imei: new RegExp(`^${escapeRegex(payload.imei)}$`, 'i'),
    });

    if (stationByImei) {
      return stationByImei;
    }
  }

  const stationByLocation = await Station.findOne({
    'location.lat': payload.location.lat,
    'location.lng': payload.location.lng,
  });

  if (stationByLocation) {
    return stationByLocation;
  }

  return Station.findOne({
    name: new RegExp(`^${escapeRegex(payload.name)}$`, 'i'),
    address: new RegExp(`^${escapeRegex(payload.address)}$`, 'i'),
  });
};

export const listAdminStations = async (
  params: StationListParams
): Promise<AdminStationListResponse> => {
  const filter: {
    status?: StationStatus;
    $or?: Array<{ imei?: RegExp; name?: RegExp; address?: RegExp }>;
  } = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.keyword) {
    const keywordRegex = new RegExp(params.keyword, 'i');
    filter.$or = [{ imei: keywordRegex }, { name: keywordRegex }, { address: keywordRegex }];
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    Station.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit),
    Station.countDocuments(filter),
  ]);

  return {
    items: items.map(toStationResponse),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};

export const getAdminStationById = async (stationId: string): Promise<AdminStationResponse> => {
  const station = await Station.findById(stationId);

  if (!station) {
    throw new Error('Tram sac khong ton tai');
  }

  return toStationResponse(station);
};

export const createAdminStation = async (
  payload: StationPayload
): Promise<AdminStationResponse> => {
  const station = await Station.create({
    imei: payload.imei?.trim() || '',
    name: payload.name,
    address: payload.address,
    city: payload.city?.trim() || '',
    district: payload.district?.trim() || '',
    description: payload.description?.trim() || '',
    location: payload.location,
    status: payload.status || 'active',
    chargingType: payload.chargingType?.trim() || '',
    currentType: payload.currentType?.trim() || '',
    isActivated: Boolean(payload.isActivated),
    activatedAt: payload.activatedAt ?? null,
    warrantyUntil: payload.warrantyUntil ?? null,
    simType: payload.simType?.trim() || '',
    simNumber: payload.simNumber?.trim() || '',
    billingSimNumber: payload.billingSimNumber?.trim() || '',
    supportPhone: payload.supportPhone?.trim() || '',
    open24_7: Boolean(payload.open24_7),
    amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
  });

  return toStationResponse(station);
};

export const updateAdminStation = async (
  stationId: string,
  payload: StationPayload
): Promise<AdminStationResponse> => {
  const station = await Station.findByIdAndUpdate(
    stationId,
    {
      imei: payload.imei?.trim() || '',
      name: payload.name,
      address: payload.address,
      city: payload.city?.trim() || '',
      district: payload.district?.trim() || '',
      description: payload.description?.trim() || '',
      location: payload.location,
      status: payload.status || 'active',
      chargingType: payload.chargingType?.trim() || '',
      currentType: payload.currentType?.trim() || '',
      isActivated: Boolean(payload.isActivated),
      activatedAt: payload.activatedAt ?? null,
      warrantyUntil: payload.warrantyUntil ?? null,
      simType: payload.simType?.trim() || '',
      simNumber: payload.simNumber?.trim() || '',
      billingSimNumber: payload.billingSimNumber?.trim() || '',
      supportPhone: payload.supportPhone?.trim() || '',
      open24_7: Boolean(payload.open24_7),
      amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
    },
    { new: true, runValidators: true }
  );

  if (!station) {
    throw new Error('Tram sac khong ton tai');
  }

  return toStationResponse(station);
};

export const deleteAdminStation = async (stationId: string): Promise<void> => {
  const station = await Station.findById(stationId);

  if (!station) {
    throw new Error('Tram sac khong ton tai');
  }

  const chargingPointCount = await ChargingPoint.countDocuments({ station: station._id });

  if (chargingPointCount > 0) {
    throw new Error('Khong the xoa tram dang con cong sac. Hay xoa cong sac truoc');
  }

  await station.deleteOne();
};

export const importAdminStations = async (
  payload: StationImportPayload
): Promise<ImportResult<AdminStationResponse>> => {
  const parsedPayload = parseImportPayload(payload);
  const result: ImportResult<AdminStationResponse> = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    items: [],
  };

  for (const [index, row] of parsedPayload.rows.entries()) {
    const normalizedRow = normalizeStationRow(row);

    if (!normalizedRow) {
      result.skipped += 1;
      result.errors.push(`Dong ${index + 1}: du lieu tram sac khong hop le`);
      continue;
    }

    const existingStation = await findExistingStation(normalizedRow);

    if (existingStation) {
      if (parsedPayload.mode === 'insert') {
        result.skipped += 1;
        result.errors.push(`Dong ${index + 1}: tram sac da ton tai`);
        continue;
      }

      existingStation.name = normalizedRow.name;
      existingStation.imei = normalizedRow.imei;
      existingStation.address = normalizedRow.address;
      existingStation.city = normalizedRow.city;
      existingStation.district = normalizedRow.district;
      existingStation.description = normalizedRow.description;
      existingStation.location = normalizedRow.location;
      existingStation.status = normalizedRow.status;
      existingStation.chargingType = normalizedRow.chargingType;
      existingStation.currentType = normalizedRow.currentType;
      existingStation.isActivated = normalizedRow.isActivated;
      existingStation.activatedAt = normalizedRow.activatedAt ?? null;
      existingStation.warrantyUntil = normalizedRow.warrantyUntil ?? null;
      existingStation.simType = normalizedRow.simType;
      existingStation.simNumber = normalizedRow.simNumber;
      existingStation.billingSimNumber = normalizedRow.billingSimNumber;
      existingStation.supportPhone = normalizedRow.supportPhone;
      existingStation.open24_7 = normalizedRow.open24_7;
      existingStation.amenities = normalizedRow.amenities;
      await existingStation.save();

      result.updated += 1;
      result.items.push(toStationResponse(existingStation));
      continue;
    }

    const station = await Station.create(normalizedRow);
    result.created += 1;
    result.items.push(toStationResponse(station));
  }

  return result;
};
