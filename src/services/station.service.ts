import { PipelineStage } from 'mongoose';
import ChargingPoint, {
  ChargingPointStatus,
  ConnectorType,
  IChargingPoint,
} from '../models/ChargingPoint';
import Pricing, { IPricing } from '../models/Pricing';
import Station, { StationStatus } from '../models/Station';

export interface StationSearchParams {
  keyword?: string;
  status?: StationStatus;
  connectorType?: ConnectorType;
  minPowerKw?: number;
  maxPowerKw?: number;
  availableOnly?: boolean;
  page: number;
  limit: number;
}

export interface StationSearchResult {
  items: StationSearchItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface StationChargingPointItem {
  _id: string;
  code: string;
  connectorType: ConnectorType;
  powerKw: number;
  status: ChargingPointStatus;
  pricing?: {
    id: string;
    name: string;
    pricePerKwh: number;
    pricePerMinute: number;
  };
}

export interface StationSearchItem {
  _id: string;
  imei?: string;
  name: string;
  address: string;
  city?: string;
  district?: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  open24_7?: boolean;
  totalChargingPoints: number;
  availableChargingPoints: number;
  matchingChargingPoints: StationChargingPointItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface StationSearchAggregationRow {
  _id: IChargingPoint['_id'];
  imei?: string;
  name: string;
  address: string;
  city?: string;
  district?: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  open24_7?: boolean;
  totalChargingPoints: number;
  availableChargingPoints: number;
  matchingChargingPoints: Array<{
    _id: IChargingPoint['_id'];
    code: string;
    connectorType: ConnectorType;
    powerKw: number;
    status: ChargingPointStatus;
    pricing?: {
      _id?: IPricing['_id'];
      name?: string;
      pricePerKwh?: number;
      pricePerMinute?: number;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const buildChargingPointFilter = (
  params: StationSearchParams
): {
  connectorType?: ConnectorType;
  powerKw?: {
    $gte?: number;
    $lte?: number;
  };
  status?: ChargingPointStatus;
} => {
  const filter: {
    connectorType?: ConnectorType;
    powerKw?: {
      $gte?: number;
      $lte?: number;
    };
    status?: ChargingPointStatus;
  } = {};

  if (params.connectorType) {
    filter.connectorType = params.connectorType;
  }

  if (typeof params.minPowerKw === 'number' || typeof params.maxPowerKw === 'number') {
    filter.powerKw = {};

    if (typeof params.minPowerKw === 'number') {
      filter.powerKw.$gte = params.minPowerKw;
    }

    if (typeof params.maxPowerKw === 'number') {
      filter.powerKw.$lte = params.maxPowerKw;
    }
  }

  if (params.availableOnly) {
    filter.status = 'available';
  }

  return filter;
};

export const buildStationFilter = (params: StationSearchParams): {
  status?: StationStatus;
  $or?: Array<{ imei?: RegExp; name?: RegExp; address?: RegExp }>;
} => {
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

  return filter;
};

export const searchStations = async (
  params: StationSearchParams
): Promise<StationSearchResult> => {
  const stationFilter = buildStationFilter(params);
  const chargingPointFilter = buildChargingPointFilter(params);
  const shouldFilterByChargingPoints = Object.keys(chargingPointFilter).length > 0;
  const skip = (params.page - 1) * params.limit;

  const matchingPointsPipeline = Object.keys(chargingPointFilter).length
    ? [{ $match: chargingPointFilter }]
    : [];

  const pipeline: PipelineStage[] = [
    { $match: stationFilter },
    {
      $lookup: {
        from: ChargingPoint.collection.name,
        localField: '_id',
        foreignField: 'station',
        as: 'chargingPoints',
      },
    },
    {
      $lookup: {
        from: ChargingPoint.collection.name,
        let: { stationId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$station', '$$stationId'] },
            },
          },
          ...matchingPointsPipeline,
          {
            $lookup: {
              from: Pricing.collection.name,
              localField: 'pricing',
              foreignField: '_id',
              as: 'pricingInfo',
            },
          },
          {
            $unwind: {
              path: '$pricingInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              code: 1,
              connectorType: 1,
              powerKw: 1,
              status: 1,
              pricing: {
                _id: '$pricingInfo._id',
                name: '$pricingInfo.name',
                pricePerKwh: '$pricingInfo.pricePerKwh',
                pricePerMinute: '$pricingInfo.pricePerMinute',
              },
            },
          },
        ],
        as: 'matchingChargingPoints',
      },
    },
    {
      $addFields: {
        totalChargingPoints: { $size: '$chargingPoints' },
        availableChargingPoints: {
          $size: {
            $filter: {
              input: '$chargingPoints',
              as: 'point',
              cond: { $eq: ['$$point.status', 'available'] },
            },
          },
        },
      },
    },
  ];

  if (shouldFilterByChargingPoints) {
    pipeline.push({
      $match: {
        'matchingChargingPoints.0': { $exists: true },
      },
    });
  }

  pipeline.push({
    $project: {
      name: 1,
      imei: 1,
      address: 1,
      city: 1,
      district: 1,
      location: 1,
      status: 1,
      open24_7: 1,
      totalChargingPoints: 1,
      availableChargingPoints: 1,
      matchingChargingPoints: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const [items, total] = await Promise.all([
    Station.aggregate<StationSearchAggregationRow>([
      ...pipeline,
      { $sort: { availableChargingPoints: -1, name: 1 } },
      { $skip: skip },
      { $limit: params.limit },
    ]),
    Station.aggregate<{ total: number }>([
      ...pipeline,
      { $count: 'total' },
    ]),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      matchingChargingPoints: item.matchingChargingPoints.map((point) => ({
        _id: point._id.toString(),
        code: point.code,
        connectorType: point.connectorType,
        powerKw: point.powerKw,
        status: point.status,
        pricing: point.pricing?._id
          ? {
              id: point.pricing._id.toString(),
              name: point.pricing.name || 'Bang gia mac dinh',
              pricePerKwh: point.pricing.pricePerKwh || 0,
              pricePerMinute: point.pricing.pricePerMinute || 0,
            }
          : undefined,
      })),
      imei: item.imei || '',
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      total: total[0]?.total ?? 0,
      totalPages: Math.ceil((total[0]?.total ?? 0) / params.limit) || 1,
    },
  };
};
