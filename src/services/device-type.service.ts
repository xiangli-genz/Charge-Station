import DeviceType, { IDeviceType } from '../models/DeviceType';
import { normalizeMediaUrl, uploadBase64MediaIfNeeded } from './media.service';

export interface DeviceTypeResponse {
  id: string;
  name: string;
  code: string;
  manufacturer: string;
  category: string;
  vehicleTypes: string[];
  connectorTypes: string[];
  currentTypes: string[];
  protocols: string[];
  powerMinKw: number;
  powerMaxKw: number;
  active: boolean;
  description: string;
  image: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeviceTypePayload {
  name: string;
  code: string;
  manufacturer?: string;
  category?: string;
  vehicleTypes?: string[];
  connectorTypes?: string[];
  currentTypes?: string[];
  protocols?: string[];
  powerMinKw?: number;
  powerMaxKw?: number;
  active?: boolean;
  description?: string;
  image?: string;
  createdById?: string | null;
}

const normalizeCode = (value: string): string => value.trim().toUpperCase();

const toDeviceTypeResponse = (item: IDeviceType): DeviceTypeResponse => ({
  id: item._id.toString(),
  name: item.name,
  code: item.code,
  manufacturer: item.manufacturer || '',
  category: item.category || 'CHARGING_STATION',
  vehicleTypes: item.vehicleTypes || [],
  connectorTypes: item.connectorTypes || [],
  currentTypes: item.currentTypes || [],
  protocols: item.protocols || [],
  powerMinKw: item.powerMinKw || 0,
  powerMaxKw: item.powerMaxKw || 0,
  active: item.active !== false,
  description: item.description || '',
  image: normalizeMediaUrl(item.image || ''),
  createdById: item.createdById ?? null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const ensureUniqueDeviceType = async (
  payload: { name: string; code: string },
  excludeId?: string
): Promise<void> => {
  const items = await DeviceType.find({
    $or: [{ name: payload.name }, { code: payload.code }],
  });

  for (const item of items) {
    if (excludeId && item._id.toString() === excludeId) {
      continue;
    }

    if (item.name === payload.name) {
      throw new Error('Ten loai thiet bi da ton tai');
    }

    if (item.code === payload.code) {
      throw new Error('Ma loai thiet bi da ton tai');
    }
  }
};

export const listDeviceTypes = async (): Promise<DeviceTypeResponse[]> => {
  const items = await DeviceType.find().sort({ createdAt: -1, name: 1 });
  return items.map(toDeviceTypeResponse);
};

export const createDeviceType = async (
  payload: DeviceTypePayload
): Promise<DeviceTypeResponse> => {
  const code = normalizeCode(payload.code);
  await ensureUniqueDeviceType({ name: payload.name, code });
  const image = await uploadBase64MediaIfNeeded(payload.image || '', {
    folderPath: 'tram-sac/device-types',
    filenamePrefix: 'device-type',
  });

  const item = await DeviceType.create({
    name: payload.name,
    code,
    manufacturer: payload.manufacturer || '',
    category: payload.category || 'CHARGING_STATION',
    vehicleTypes: payload.vehicleTypes || [],
    connectorTypes: payload.connectorTypes || [],
    currentTypes: payload.currentTypes || [],
    protocols: payload.protocols || [],
    powerMinKw: payload.powerMinKw || 0,
    powerMaxKw: payload.powerMaxKw || 0,
    active: payload.active !== false,
    description: payload.description || '',
    image,
    createdById: payload.createdById ?? null,
  });

  return toDeviceTypeResponse(item);
};

export const updateDeviceType = async (
  deviceTypeId: string,
  payload: DeviceTypePayload
): Promise<DeviceTypeResponse> => {
  const item = await DeviceType.findById(deviceTypeId);

  if (!item) {
    throw new Error('Loai thiet bi khong ton tai');
  }

  const code = normalizeCode(payload.code);
  await ensureUniqueDeviceType({ name: payload.name, code }, deviceTypeId);
  const image = await uploadBase64MediaIfNeeded(payload.image || '', {
    folderPath: 'tram-sac/device-types',
    filenamePrefix: 'device-type',
  });

  item.name = payload.name;
  item.code = code;
  item.manufacturer = payload.manufacturer || '';
  item.category = payload.category || 'CHARGING_STATION';
  item.vehicleTypes = payload.vehicleTypes || [];
  item.connectorTypes = payload.connectorTypes || [];
  item.currentTypes = payload.currentTypes || [];
  item.protocols = payload.protocols || [];
  item.powerMinKw = payload.powerMinKw || 0;
  item.powerMaxKw = payload.powerMaxKw || 0;
  item.active = payload.active !== false;
  item.description = payload.description || '';
  item.image = image;
  await item.save();

  return toDeviceTypeResponse(item);
};

export const deleteDeviceType = async (deviceTypeId: string): Promise<void> => {
  const item = await DeviceType.findById(deviceTypeId);

  if (!item) {
    throw new Error('Loai thiet bi khong ton tai');
  }

  await item.deleteOne();
};
