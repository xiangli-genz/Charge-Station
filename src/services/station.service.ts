import { PipelineStage } from 'mongoose';
import ChargingPoint, {
  ChargingPointStatus,
  ConnectorType,
  IChargingPoint,
} from '../models/ChargingPoint';
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
}

export interface StationSearchItem {
  _id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  totalChargingPoints: number;
  availableChargingPoints: number;
  matchingChargingPoints: StationChargingPointItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface StationSearchAggregationRow {
  _id: IChargingPoint['_id'];
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  totalChargingPoints: number;
  availableChargingPoints: number;
  matchingChargingPoints: Array<{
    _id: IChargingPoint['_id'];
    code: string;
    connectorType: ConnectorType;
    powerKw: number;
    status: ChargingPointStatus;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const buildChargingPointFilter = (
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

const buildStationFilter = (params: StationSearchParams): {
  status?: StationStatus;
  $or?: Array<{ name?: RegExp; address?: RegExp }>;
} => {
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
            $project: {
              code: 1,
              connectorType: 1,
              powerKw: 1,
              status: 1,
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
      address: 1,
      location: 1,
      status: 1,
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
        ...point,
        _id: point._id.toString(),
      })),
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      total: total[0]?.total ?? 0,
      totalPages: Math.ceil((total[0]?.total ?? 0) / params.limit) || 1,
    },
  };
};
