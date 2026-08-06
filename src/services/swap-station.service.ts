import SwapStation, { ISwapStation, SwapStationStatus } from '../models/SwapStation';

export interface SwapStationSearchParams {
  keyword?: string;
  provider?: string;
  supportedVehicleModel?: string;
  status?: SwapStationStatus;
  availableOnly?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page: number;
  limit: number;
}

export interface SwapStationSearchItem {
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
  distanceKm?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwapStationSearchResult {
  items: SwapStationSearchItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const EARTH_RADIUS_KM = 6371;

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const calculateDistanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number => {
  const dLat = degreesToRadians(toLat - fromLat);
  const dLng = degreesToRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(fromLat)) *
      Math.cos(degreesToRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(2));
};

const toSwapStationItem = (
  station: ISwapStation,
  distanceKm?: number
): SwapStationSearchItem => ({
  id: station._id.toString(),
  name: station.name,
  address: station.address,
  provider: station.provider,
  supportedVehicleModels: station.supportedVehicleModels,
  location: station.location,
  totalBatterySlots: station.totalBatterySlots,
  availableBatterySlots: station.availableBatterySlots,
  status: station.status,
  distanceKm,
  createdAt: station.createdAt,
  updatedAt: station.updatedAt,
});

export const searchSwapStations = async (
  params: SwapStationSearchParams
): Promise<SwapStationSearchResult> => {
  const filter: {
    status?: SwapStationStatus;
    provider?: RegExp;
    availableBatterySlots?: { $gt: number };
    supportedVehicleModels?: string;
    $or?: Array<{ name?: RegExp; address?: RegExp }>;
  } = {};

  if (params.status) {
    filter.status = params.status;
  }

  if (params.provider) {
    filter.provider = new RegExp(params.provider, 'i');
  }

  if (params.availableOnly) {
    filter.availableBatterySlots = { $gt: 0 };
  }

  if (params.supportedVehicleModel) {
    filter.supportedVehicleModels = params.supportedVehicleModel;
  }

  if (params.keyword) {
    const keywordRegex = new RegExp(params.keyword, 'i');
    filter.$or = [{ name: keywordRegex }, { address: keywordRegex }];
  }

  const stations = await SwapStation.find(filter).sort({ createdAt: -1 });

  const itemsWithDistance = stations
    .map((station) => {
      if (typeof params.lat === 'number' && typeof params.lng === 'number') {
        const distanceKm = calculateDistanceKm(
          params.lat,
          params.lng,
          station.location.lat,
          station.location.lng
        );

        return toSwapStationItem(station, distanceKm);
      }

      return toSwapStationItem(station);
    })
    .filter((station) => {
      if (typeof params.radiusKm !== 'number') {
        return true;
      }

      return typeof station.distanceKm === 'number' && station.distanceKm <= params.radiusKm;
    })
    .sort((left, right) => {
      if (
        typeof left.distanceKm === 'number' &&
        typeof right.distanceKm === 'number' &&
        left.distanceKm !== right.distanceKm
      ) {
        return left.distanceKm - right.distanceKm;
      }

      if (left.availableBatterySlots !== right.availableBatterySlots) {
        return right.availableBatterySlots - left.availableBatterySlots;
      }

      return left.name.localeCompare(right.name);
    });

  const total = itemsWithDistance.length;
  const start = (params.page - 1) * params.limit;
  const pagedItems = itemsWithDistance.slice(start, start + params.limit);

  return {
    items: pagedItems,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
};
