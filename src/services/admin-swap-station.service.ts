import SwapStation, { ISwapStation, SwapStationStatus } from '../models/SwapStation';
import {
  ImportResult,
  parseImportPayload,
  parseNumberField,
  parseStringArrayField,
  parseStringField,
} from '../utils/import.util';

interface SwapStationListParams {
  page: number;
  limit: number;
  status?: SwapStationStatus;
  keyword?: string;
  provider?: string;
}

interface SwapStationPayload {
  name: string;
  address: string;
  provider: string;
  supportedVehicleModels: string[];
  location: {
    lat: number;
    lng: number;
  };
  totalBatterySlots: number;
  availableBatterySlots: number;
  status?: SwapStationStatus;
}

export interface AdminSwapStationResponse {
  id: string;
  name: string;
  address: string;
  provider: string;
  supportedVehicleModels: string[];
  location: {
    lat: number;
    lng: number;
  };
  totalBatterySlots: number;
  availableBatterySlots: number;
  status: SwapStationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSwapStationListResponse {
  items: AdminSwapStationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SwapStationImportPayload = {
  format?: unknown;
  mode?: unknown;
  content?: unknown;
  items?: unknown;
};

const toSwapStationResponse = (station: ISwapStation): AdminSwapStationResponse => ({
  id: station._id.toString(),
  name: station.name,
  address: station.address,
  provider: station.provider,
  supportedVehicleModels: station.supportedVehicleModels,
  location: station.location,
  totalBatterySlots: station.totalBatterySlots,
  availableBatterySlots: station.availableBatterySlots,
  status: station.status,
  createdAt: station.createdAt,
  updatedAt: station.updatedAt,
});

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseSwapStationStatus = (value: unknown): SwapStationStatus => {
  return value === 'inactive' || value === 'maintenance' || value === 'closed'
    ? value
    : 'active';
};

const normalizeSwapStationRow = (
  row: Record<string, unknown>
): {
  name: string;
  address: string;
  provider: string;
  supportedVehicleModels: string[];
  location: {
    lat: number;
    lng: number;
  };
  totalBatterySlots: number;
  availableBatterySlots: number;
  status: SwapStationStatus;
} | null => {
  const name = parseStringField(row.name);
  const address = parseStringField(row.address);
  const provider = parseStringField(row.provider) || 'VinFast';
  const supportedVehicleModels = parseStringArrayField(row.supportedVehicleModels);
  const totalBatterySlots = parseNumberField(row.totalBatterySlots);
  const availableBatterySlots = parseNumberField(row.availableBatterySlots);
  const lat = parseNumberField((row.location as { lat?: unknown } | undefined)?.lat ?? row.lat);
  const lng = parseNumberField((row.location as { lng?: unknown } | undefined)?.lng ?? row.lng);
  const status = parseSwapStationStatus(row.status);

  if (
    !name ||
    !address ||
    !provider ||
    typeof totalBatterySlots !== 'number' ||
    typeof availableBatterySlots !== 'number' ||
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    availableBatterySlots > totalBatterySlots
  ) {
    return null;
  }

  return {
    name,
    address,
    provider,
    supportedVehicleModels,
    location: { lat, lng },
    totalBatterySlots,
    availableBatterySlots,
    status,
  };
};

const findExistingSwapStation = async (payload: {
  name: string;
  address: string;
  provider: string;
  location: {
    lat: number;
    lng: number;
  };
}): Promise<ISwapStation | null> => {
  const stationByLocation = await SwapStation.findOne({
    'location.lat': payload.location.lat,
    'location.lng': payload.location.lng,
  });

  if (stationByLocation) {
    return stationByLocation;
  }

  return SwapStation.findOne({
    name: new RegExp(`^${escapeRegex(payload.name)}$`, 'i'),
    address: new RegExp(`^${escapeRegex(payload.address)}$`, 'i'),
    provider: new RegExp(`^${escapeRegex(payload.provider)}$`, 'i'),
  });
};

export const listAdminSwapStations = async (
  params: SwapStationListParams
): Promise<AdminSwapStationListResponse> => {
  const filter: {
    status?: SwapStationStatus;
    provider?: RegExp;
    $or?: Array<{ name?: RegExp; address?: RegExp }>;
  } = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.provider) {
    filter.provider = new RegExp(params.provider, 'i');
  }

  if (params.keyword) {
    const keywordRegex = new RegExp(params.keyword, 'i');
    filter.$or = [{ name: keywordRegex }, { address: keywordRegex }];
  }

  const skip = (params.page - 1) * params.limit;
  const [items, total] = await Promise.all([
    SwapStation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit),
    SwapStation.countDocuments(filter),
  ]);

  return {
    items: items.map(toSwapStationResponse),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};

export const getAdminSwapStationById = async (
  swapStationId: string
): Promise<AdminSwapStationResponse> => {
  const station = await SwapStation.findById(swapStationId);

  if (!station) {
    throw new Error('Tram doi pin khong ton tai');
  }

  return toSwapStationResponse(station);
};

export const createAdminSwapStation = async (
  payload: SwapStationPayload
): Promise<AdminSwapStationResponse> => {
  const station = await SwapStation.create({
    name: payload.name,
    address: payload.address,
    provider: payload.provider,
    supportedVehicleModels: payload.supportedVehicleModels,
    location: payload.location,
    totalBatterySlots: payload.totalBatterySlots,
    availableBatterySlots: payload.availableBatterySlots,
    status: payload.status || 'active',
  });

  return toSwapStationResponse(station);
};

export const updateAdminSwapStation = async (
  swapStationId: string,
  payload: SwapStationPayload
): Promise<AdminSwapStationResponse> => {
  const station = await SwapStation.findByIdAndUpdate(
    swapStationId,
    {
      name: payload.name,
      address: payload.address,
      provider: payload.provider,
      supportedVehicleModels: payload.supportedVehicleModels,
      location: payload.location,
      totalBatterySlots: payload.totalBatterySlots,
      availableBatterySlots: payload.availableBatterySlots,
      status: payload.status || 'active',
    },
    { new: true, runValidators: true }
  );

  if (!station) {
    throw new Error('Tram doi pin khong ton tai');
  }

  return toSwapStationResponse(station);
};

export const deleteAdminSwapStation = async (swapStationId: string): Promise<void> => {
  const station = await SwapStation.findById(swapStationId);

  if (!station) {
    throw new Error('Tram doi pin khong ton tai');
  }

  await station.deleteOne();
};

export const importAdminSwapStations = async (
  payload: SwapStationImportPayload
): Promise<ImportResult<AdminSwapStationResponse>> => {
  const parsedPayload = parseImportPayload(payload);
  const result: ImportResult<AdminSwapStationResponse> = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    items: [],
  };

  for (const [index, row] of parsedPayload.rows.entries()) {
    const normalizedRow = normalizeSwapStationRow(row);

    if (!normalizedRow) {
      result.skipped += 1;
      result.errors.push(`Dong ${index + 1}: du lieu tram doi pin khong hop le`);
      continue;
    }

    const existingStation = await findExistingSwapStation(normalizedRow);

    if (existingStation) {
      if (parsedPayload.mode === 'insert') {
        result.skipped += 1;
        result.errors.push(`Dong ${index + 1}: tram doi pin da ton tai`);
        continue;
      }

      existingStation.name = normalizedRow.name;
      existingStation.address = normalizedRow.address;
      existingStation.provider = normalizedRow.provider;
      existingStation.supportedVehicleModels = normalizedRow.supportedVehicleModels;
      existingStation.location = normalizedRow.location;
      existingStation.totalBatterySlots = normalizedRow.totalBatterySlots;
      existingStation.availableBatterySlots = normalizedRow.availableBatterySlots;
      existingStation.status = normalizedRow.status;
      await existingStation.save();

      result.updated += 1;
      result.items.push(toSwapStationResponse(existingStation));
      continue;
    }

    const station = await SwapStation.create(normalizedRow);
    result.created += 1;
    result.items.push(toSwapStationResponse(station));
  }

  return result;
};
