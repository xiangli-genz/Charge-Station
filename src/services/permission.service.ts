import {
  buildPermissionCatalogTree,
  defaultPermissionDefinitions,
  PermissionCatalogItem,
} from '../configs/permission-catalog';
import Permission, { IPermission } from '../models/Permission';
import PermissionGroup from '../models/PermissionGroup';

export interface PermissionResponse {
  id: string;
  name: string;
  code: string;
  groupKey: string;
  groupName: string;
  description: string;
  status: 'active' | 'inactive';
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PermissionPayload {
  name: string;
  groupKey: string;
  groupName: string;
  description?: string;
  status?: 'active' | 'inactive';
  createdById?: string | null;
}

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const normalizeGroupKey = (value: string): string => {
  return slugify(value || 'group');
};

const buildPermissionCode = (groupKey: string, name: string): string => {
  const normalizedGroupKey = normalizeGroupKey(groupKey);
  const normalizedName = slugify(name || 'permission');
  return `${normalizedGroupKey}-${normalizedName}`;
};

const toPermissionResponse = (item: IPermission): PermissionResponse => ({
  id: item._id.toString(),
  name: item.name,
  code: item.code,
  groupKey: item.groupKey,
  groupName: item.groupName,
  description: item.description || '',
  status: item.status || 'active',
  createdById: item.createdById ?? null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const ensureDefaultPermissions = async (): Promise<void> => {
  const defaultCodes = defaultPermissionDefinitions.map((item) => item.code);
  const existing = await Permission.find({ code: { $in: defaultCodes } }).select('code');
  const existingCodeSet = new Set(existing.map((item) => item.code));
  const missing = defaultPermissionDefinitions.filter((item) => !existingCodeSet.has(item.code));

  if (!missing.length) {
    return;
  }

  await Permission.insertMany(
    missing.map((item) => ({
      name: item.name,
      code: item.code,
      groupKey: item.groupKey,
      groupName: item.groupName,
      description: item.description || '',
      status: 'active',
      createdById: null,
    })),
    { ordered: false }
  ).catch(() => undefined);
};

const ensureUniquePermission = async (
  payload: { name: string; groupKey: string; code: string },
  excludeId?: string
): Promise<void> => {
  const existingItems = await Permission.find({
    $or: [
      { code: payload.code },
      { name: payload.name, groupKey: payload.groupKey },
    ],
  });

  for (const item of existingItems) {
    if (excludeId && item._id.toString() === excludeId) {
      continue;
    }

    if (item.code === payload.code) {
      throw new Error('Ma quyen da ton tai');
    }

    if (item.name === payload.name && item.groupKey === payload.groupKey) {
      throw new Error('Ten quyen da ton tai trong nhom nay');
    }
  }
};

export const listPermissions = async (): Promise<PermissionResponse[]> => {
  await ensureDefaultPermissions();
  const items = await Permission.find().sort({ groupName: 1, createdAt: -1, name: 1 });
  return items.map(toPermissionResponse);
};

export const getPermissionCatalog = async (): Promise<PermissionCatalogItem[]> => {
  await ensureDefaultPermissions();
  const items = await Permission.find({ status: 'active' }).sort({ groupName: 1, name: 1 });

  return buildPermissionCatalogTree(
    items.map((item) => ({
      code: item.code,
      name: item.name,
      groupKey: item.groupKey,
      groupName: item.groupName,
      description: item.description || '',
    }))
  );
};

export const getPermissionGroupOptions = async (): Promise<Array<{ key: string; name: string }>> => {
  await ensureDefaultPermissions();
  const items = await Permission.find().sort({ groupName: 1, name: 1 }).select('groupKey groupName');
  const unique = new Map<string, string>();

  for (const item of items) {
    if (!unique.has(item.groupKey)) {
      unique.set(item.groupKey, item.groupName);
    }
  }

  return Array.from(unique.entries()).map(([key, name]) => ({ key, name }));
};

export const getActivePermissionCodeSet = async (): Promise<Set<string>> => {
  await ensureDefaultPermissions();
  const items = await Permission.find({ status: 'active' }).select('code');
  return new Set(items.map((item) => item.code));
};

export const createPermission = async (payload: PermissionPayload): Promise<PermissionResponse> => {
  const groupKey = normalizeGroupKey(payload.groupKey);
  const code = buildPermissionCode(groupKey, payload.name);
  await ensureUniquePermission({ name: payload.name, groupKey, code });

  const item = await Permission.create({
    name: payload.name,
    code,
    groupKey,
    groupName: payload.groupName,
    description: payload.description || '',
    status: payload.status || 'active',
    createdById: payload.createdById ?? null,
  });

  return toPermissionResponse(item);
};

export const updatePermission = async (
  permissionId: string,
  payload: PermissionPayload
): Promise<PermissionResponse> => {
  const item = await Permission.findById(permissionId);

  if (!item) {
    throw new Error('Quyen khong ton tai');
  }

  const groupKey = normalizeGroupKey(payload.groupKey);
  await ensureUniquePermission(
    {
      name: payload.name,
      groupKey,
      code: item.code,
    },
    permissionId
  );

  item.name = payload.name;
  item.groupKey = groupKey;
  item.groupName = payload.groupName;
  item.description = payload.description || '';
  item.status = payload.status || item.status || 'active';
  await item.save();

  return toPermissionResponse(item);
};

export const deletePermission = async (permissionId: string): Promise<void> => {
  const item = await Permission.findById(permissionId);

  if (!item) {
    throw new Error('Quyen khong ton tai');
  }

  await PermissionGroup.updateMany({}, { $pull: { permissions: item.code } });
  await item.deleteOne();
};
