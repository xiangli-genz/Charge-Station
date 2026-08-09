import mongoose from 'mongoose';
import ChargingPoint from '../models/ChargingPoint';
import FavoriteStation from '../models/FavoriteStation';
import Station from '../models/Station';

export interface FavoriteStationResponse {
  id: string;
  createdAt: Date;
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    district: string;
    status: string;
    chargingType: string;
    currentType: string;
    open24_7: boolean;
    location: {
      lat: number;
      lng: number;
    };
    totalChargingPoints: number;
    availableChargingPoints: number;
  };
}

const buildFavoriteResponse = async (
  favoriteId: string,
  createdAt: Date,
  stationId: string
): Promise<FavoriteStationResponse> => {
  const station = await Station.findById(stationId);

  if (!station) {
    throw new Error('Tram sac khong ton tai');
  }

  const [totalChargingPoints, availableChargingPoints] = await Promise.all([
    ChargingPoint.countDocuments({ station: station._id }),
    ChargingPoint.countDocuments({ station: station._id, status: 'available' }),
  ]);

  return {
    id: favoriteId,
    createdAt,
    station: {
      id: station._id.toString(),
      name: station.name,
      address: station.address,
      city: station.city || '',
      district: station.district || '',
      status: station.status,
      chargingType: station.chargingType || '',
      currentType: station.currentType || '',
      open24_7: station.open24_7 || false,
      location: {
        lat: station.location.lat,
        lng: station.location.lng,
      },
      totalChargingPoints,
      availableChargingPoints,
    },
  };
};

export const listFavoriteStations = async (userId: string): Promise<FavoriteStationResponse[]> => {
  const items = await FavoriteStation.find({ user: userId }).sort({ createdAt: -1 });
  return Promise.all(
    items.map((item) =>
      buildFavoriteResponse(item._id.toString(), item.createdAt, item.station.toString())
    )
  );
};

export const addFavoriteStation = async (
  userId: string,
  stationId: string
): Promise<FavoriteStationResponse> => {
  if (!mongoose.Types.ObjectId.isValid(stationId)) {
    throw new Error('Tram sac khong hop le');
  }

  const station = await Station.findById(stationId);

  if (!station) {
    throw new Error('Tram sac khong ton tai');
  }

  const favorite =
    (await FavoriteStation.findOne({ user: userId, station: stationId })) ||
    (await FavoriteStation.create({ user: userId, station: stationId }));

  return buildFavoriteResponse(favorite._id.toString(), favorite.createdAt, stationId);
};

export const removeFavoriteStation = async (
  userId: string,
  stationId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(stationId)) {
    throw new Error('Tram sac khong hop le');
  }

  await FavoriteStation.deleteOne({ user: userId, station: stationId });
};
