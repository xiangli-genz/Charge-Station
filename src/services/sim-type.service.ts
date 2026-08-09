import SimType, { ISimType } from '../models/SimType';

export interface SimTypeResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SimTypePayload {
  name: string;
  code: string;
  description?: string;
  createdById?: string | null;
}

const normalizeCode = (value: string): string => value.trim().toUpperCase();

const toSimTypeResponse = (item: ISimType): SimTypeResponse => ({
  id: item._id.toString(),
  name: item.name,
  code: item.code,
  description: item.description || '',
  createdById: item.createdById ?? null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const ensureUniqueSimType = async (
  payload: { name: string; code: string },
  excludeId?: string
): Promise<void> => {
  const items = await SimType.find({
    $or: [{ name: payload.name }, { code: payload.code }],
  });

  for (const item of items) {
    if (excludeId && item._id.toString() === excludeId) {
      continue;
    }

    if (item.name === payload.name) {
      throw new Error('Ten loai sim da ton tai');
    }

    if (item.code === payload.code) {
      throw new Error('Ma loai sim da ton tai');
    }
  }
};

export const listSimTypes = async (): Promise<SimTypeResponse[]> => {
  const items = await SimType.find().sort({ createdAt: -1, name: 1 });
  return items.map(toSimTypeResponse);
};

export const createSimType = async (payload: SimTypePayload): Promise<SimTypeResponse> => {
  const code = normalizeCode(payload.code);
  await ensureUniqueSimType({ name: payload.name, code });

  const item = await SimType.create({
    name: payload.name,
    code,
    description: payload.description || '',
    createdById: payload.createdById ?? null,
  });

  return toSimTypeResponse(item);
};

export const updateSimType = async (
  simTypeId: string,
  payload: SimTypePayload
): Promise<SimTypeResponse> => {
  const item = await SimType.findById(simTypeId);

  if (!item) {
    throw new Error('Loai sim khong ton tai');
  }

  const code = normalizeCode(payload.code);
  await ensureUniqueSimType({ name: payload.name, code }, simTypeId);

  item.name = payload.name;
  item.code = code;
  item.description = payload.description || '';
  await item.save();

  return toSimTypeResponse(item);
};

export const deleteSimType = async (simTypeId: string): Promise<void> => {
  const item = await SimType.findById(simTypeId);

  if (!item) {
    throw new Error('Loai sim khong ton tai');
  }

  await item.deleteOne();
};
