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
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status?: StationStatus;
}

export interface AdminStationResponse {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
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

const toStationResponse = (station: IStation): AdminStationResponse => ({
  id: station._id.toString(),
  name: station.name,
  address: station.address,
  location: station.location,
  status: station.status,
  createdAt: station.createdAt,
  updatedAt: station.updatedAt,
});

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseStationStatus = (value: unknown): StationStatus => {
  return value === 'inactive' || value === 'maintenance' ? value : 'active';
};

const normalizeStationRow = (
  row: Record<string, unknown>
): {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
} | null => {
  const name = parseStringField(row.name);
  const address = parseStringField(row.address);
  const lat = parseNumberField((row.location as { lat?: unknown } | undefined)?.lat ?? row.lat);
  const lng = parseNumberField((row.location as { lng?: unknown } | undefined)?.lng ?? row.lng);
  const status = parseStationStatus(row.status);

  if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return {
    name,
    address,
    location: { lat, lng },
    status,
  };
};

const findExistingStation = async (payload: {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}): Promise<IStation | null> => {
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
    $or?: Array<{ name?: RegExp; address?: RegExp }>;
  } = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.keyword) {
    const keywordRegex = new RegExp(params.keyword, 'i');
    filter.$or = [{ name: keywordRegex }, { address: keywordRegex }];
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
    name: payload.name,
    address: payload.address,
    location: payload.location,
    status: payload.status || 'active',
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
      name: payload.name,
      address: payload.address,
      location: payload.location,
      status: payload.status || 'active',
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
      existingStation.address = normalizedRow.address;
      existingStation.location = normalizedRow.location;
      existingStation.status = normalizedRow.status;
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
