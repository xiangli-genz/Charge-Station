import DeviceType, { IDeviceType } from '../models/DeviceType';

export interface DeviceTypeResponse {
  id: string;
  name: string;
  code: string;
  manufacturer: string;
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
  description: item.description || '',
  image: item.image || '',
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

  const item = await DeviceType.create({
    name: payload.name,
    code,
    manufacturer: payload.manufacturer || '',
    description: payload.description || '',
    image: payload.image || '',
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

  item.name = payload.name;
  item.code = code;
  item.manufacturer = payload.manufacturer || '';
  item.description = payload.description || '';
  item.image = payload.image || '';
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
