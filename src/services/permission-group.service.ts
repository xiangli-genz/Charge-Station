import { permissionCatalog, PermissionCatalogItem } from '../configs/permission-catalog';
import PermissionGroup, { IPermissionGroup } from '../models/PermissionGroup';

export interface PermissionGroupResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: 'active' | 'inactive';
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
  createdById?: string | null;
}

const toPermissionGroupResponse = (group: IPermissionGroup): PermissionGroupResponse => ({
  id: group._id.toString(),
  name: group.name,
  code: group.code,
  description: group.description || '',
  permissions: group.permissions || [],
  status: group.status || 'active',
  createdById: group.createdById ?? null,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

const buildValidPermissionIdSet = (items: PermissionCatalogItem[]): Set<string> => {
  const ids = new Set<string>();

  const visit = (list: PermissionCatalogItem[]) => {
    for (const item of list) {
      ids.add(item.id);

      if (item.children?.length) {
        visit(item.children);
      }
    }
  };

  visit(items);
  return ids;
};

const validPermissionIdSet = buildValidPermissionIdSet(permissionCatalog);

const normalizePermissionList = (permissions: string[] = []): string[] => {
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
  const groups = await PermissionGroup.find().sort({ createdAt: -1 });
  return groups.map(toPermissionGroupResponse);
};

export const getPermissionCatalog = (): PermissionCatalogItem[] => {
  return permissionCatalog;
};

export const createPermissionGroup = async (
  payload: PermissionGroupPayload
): Promise<PermissionGroupResponse> => {
  await ensureUniqueGroup({ name: payload.name, code: payload.code });

  const group = await PermissionGroup.create({
    name: payload.name,
    code: payload.code,
    description: payload.description || '',
    permissions: normalizePermissionList(payload.permissions),
    status: payload.status || 'active',
    createdById: payload.createdById ?? null,
  });

  return toPermissionGroupResponse(group);
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
  group.permissions = normalizePermissionList(payload.permissions);
  group.status = payload.status || 'active';
  await group.save();

  return toPermissionGroupResponse(group);
};

export const deletePermissionGroup = async (groupId: string): Promise<void> => {
  const group = await PermissionGroup.findById(groupId);

  if (!group) {
    throw new Error('Nhom quyen khong ton tai');
  }

  await group.deleteOne();
};
