import ChargingConnectorType, {
  IChargingConnectorType,
} from '../models/ChargingConnectorType';
import { normalizeMediaUrl, uploadBase64MediaIfNeeded } from './media.service';

export interface ChargingConnectorTypeResponse {
  id: string;
  name: string;
  shortName: string;
  chargingType: string;
  currentType: string;
  vehicleTypes: string[];
  powerMinKw: number;
  powerMaxKw: number;
  description: string;
  image: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ChargingConnectorTypePayload {
  name: string;
  shortName: string;
  chargingType: string;
  currentType: string;
  vehicleTypes?: string[];
  powerMinKw?: number;
  powerMaxKw?: number;
  description?: string;
  image?: string;
  createdById?: string | null;
}

const normalizeShortName = (value: string): string => value.trim();

const toChargingConnectorTypeResponse = (
  item: IChargingConnectorType
): ChargingConnectorTypeResponse => ({
  id: item._id.toString(),
  name: item.name,
  shortName: item.shortName,
  chargingType: item.chargingType,
  currentType: item.currentType,
  vehicleTypes: item.vehicleTypes || [],
  powerMinKw: item.powerMinKw || 0,
  powerMaxKw: item.powerMaxKw || 0,
  description: item.description || '',
  image: normalizeMediaUrl(item.image || ''),
  createdById: item.createdById ?? null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const ensureUniqueChargingConnectorType = async (
  payload: { name: string; shortName: string },
  excludeId?: string
): Promise<void> => {
  const items = await ChargingConnectorType.find({
    $or: [{ name: payload.name }, { shortName: payload.shortName }],
  });

  for (const item of items) {
    if (excludeId && item._id.toString() === excludeId) {
      continue;
    }

    if (item.name === payload.name) {
      throw new Error('Ten loai cong sac da ton tai');
    }

    if (item.shortName === payload.shortName) {
      throw new Error('Ten viet tat da ton tai');
    }
  }
};

export const listChargingConnectorTypes = async (): Promise<ChargingConnectorTypeResponse[]> => {
  const items = await ChargingConnectorType.find().sort({ createdAt: -1, name: 1 });
  return items.map(toChargingConnectorTypeResponse);
};

export const createChargingConnectorType = async (
  payload: ChargingConnectorTypePayload
): Promise<ChargingConnectorTypeResponse> => {
  const shortName = normalizeShortName(payload.shortName);
  await ensureUniqueChargingConnectorType({ name: payload.name, shortName });
  const image = await uploadBase64MediaIfNeeded(payload.image || '', {
    folderPath: 'tram-sac/connector-types',
    filenamePrefix: 'connector-type',
  });

  const item = await ChargingConnectorType.create({
    name: payload.name,
    shortName,
    chargingType: payload.chargingType,
    currentType: payload.currentType,
    vehicleTypes: payload.vehicleTypes || [],
    powerMinKw: payload.powerMinKw || 0,
    powerMaxKw: payload.powerMaxKw || 0,
    description: payload.description || '',
    image,
    createdById: payload.createdById ?? null,
  });

  return toChargingConnectorTypeResponse(item);
};

export const updateChargingConnectorType = async (
  connectorTypeId: string,
  payload: ChargingConnectorTypePayload
): Promise<ChargingConnectorTypeResponse> => {
  const item = await ChargingConnectorType.findById(connectorTypeId);

  if (!item) {
    throw new Error('Loai cong sac khong ton tai');
  }

  const shortName = normalizeShortName(payload.shortName);
  await ensureUniqueChargingConnectorType(
    { name: payload.name, shortName },
    connectorTypeId
  );
  const image = await uploadBase64MediaIfNeeded(payload.image || '', {
    folderPath: 'tram-sac/connector-types',
    filenamePrefix: 'connector-type',
  });

  item.name = payload.name;
  item.shortName = shortName;
  item.chargingType = payload.chargingType;
  item.currentType = payload.currentType;
  item.vehicleTypes = payload.vehicleTypes || [];
  item.powerMinKw = payload.powerMinKw || 0;
  item.powerMaxKw = payload.powerMaxKw || 0;
  item.description = payload.description || '';
  item.image = image;
  await item.save();

  return toChargingConnectorTypeResponse(item);
};

export const deleteChargingConnectorType = async (
  connectorTypeId: string
): Promise<void> => {
  const item = await ChargingConnectorType.findById(connectorTypeId);

  if (!item) {
    throw new Error('Loai cong sac khong ton tai');
  }

  await item.deleteOne();
};
