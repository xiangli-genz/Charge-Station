import { PermissionCatalogItem } from '../configs/permission-catalog';
import PermissionGroup, { IPermissionGroup } from '../models/PermissionGroup';
import { getActivePermissionCodeSet, getPermissionCatalog } from './permission.service';

export interface PermissionGroupResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: 'active' | 'inactive';
  parentGroup: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PermissionGroupPayload {
  name: string;
  code: string;
  description?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
  parentGroupId?: string | null;
  createdById?: string | null;
}

type PermissionGroupPopulated = IPermissionGroup & {
  parentGroupId?: IPermissionGroup | null;
};

const toPermissionGroupResponse = (group: PermissionGroupPopulated): PermissionGroupResponse => ({
  id: group._id.toString(),
  name: group.name,
  code: group.code,
  description: group.description || '',
  permissions: group.permissions || [],
  status: group.status || 'active',
  parentGroup:
    group.parentGroupId && typeof group.parentGroupId === 'object' && '_id' in group.parentGroupId
      ? {
          id: group.parentGroupId._id.toString(),
          name: group.parentGroupId.name,
          code: group.parentGroupId.code,
        }
      : null,
  createdById: group.createdById ?? null,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

const normalizePermissionList = async (permissions: string[] = []): Promise<string[]> => {
  const validPermissionIdSet = await getActivePermissionCodeSet();
  return [...new Set(permissions.filter((permission) => validPermissionIdSet.has(permission)))];
};

const ensureUniqueGroup = async (
  params: {
    name: string;
    code: string;
  },
  excludeId?: string
): Promise<void> => {
  const existingGroups = await PermissionGroup.find({
    $or: [{ name: params.name }, { code: params.code }],
  });

  for (const group of existingGroups) {
    if (excludeId && group._id.toString() === excludeId) {
      continue;
    }

    if (group.name === params.name) {
      throw new Error('Ten nhom quyen da ton tai');
    }

    if (group.code === params.code) {
      throw new Error('Ma nhom quyen da ton tai');
    }
  }
};

export const listPermissionGroups = async (): Promise<PermissionGroupResponse[]> => {
  const groups = await PermissionGroup.find()
    .populate('parentGroupId', 'name code')
    .sort({ createdAt: -1 });
  return groups.map((group) => toPermissionGroupResponse(group as PermissionGroupPopulated));
};

export const getPermissionCatalogItems = async (): Promise<PermissionCatalogItem[]> => getPermissionCatalog();

export const createPermissionGroup = async (
  payload: PermissionGroupPayload
): Promise<PermissionGroupResponse> => {
  await ensureUniqueGroup({ name: payload.name, code: payload.code });

  const group = await PermissionGroup.create({
    name: payload.name,
    code: payload.code,
    description: payload.description || '',
    permissions: await normalizePermissionList(payload.permissions),
    parentGroupId: payload.parentGroupId || null,
    status: payload.status || 'active',
    createdById: payload.createdById ?? null,
  });

  const populatedGroup = await PermissionGroup.findById(group._id).populate('parentGroupId', 'name code');

  return toPermissionGroupResponse((populatedGroup || group) as PermissionGroupPopulated);
};

export const updatePermissionGroup = async (
  groupId: string,
  payload: PermissionGroupPayload
): Promise<PermissionGroupResponse> => {
  const group = await PermissionGroup.findById(groupId);

  if (!group) {
    throw new Error('Nhom quyen khong ton tai');
  }

  await ensureUniqueGroup({ name: payload.name, code: payload.code }, groupId);

  group.name = payload.name;
  group.code = payload.code;
  group.description = payload.description || '';
  group.permissions = await normalizePermissionList(payload.permissions);
  group.parentGroupId = (payload.parentGroupId as any) || null;
  group.status = payload.status || 'active';
  await group.save();

  const populatedGroup = await PermissionGroup.findById(group._id).populate('parentGroupId', 'name code');

  return toPermissionGroupResponse((populatedGroup || group) as PermissionGroupPopulated);
};

export const deletePermissionGroup = async (groupId: string): Promise<void> => {
  const group = await PermissionGroup.findById(groupId);

  if (!group) {
    throw new Error('Nhom quyen khong ton tai');
  }

  await group.deleteOne();
};
