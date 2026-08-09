export interface PermissionCatalogItem {
  id: string;
  name: string;
  groupKey: string;
  groupName: string;
  description?: string;
  children?: PermissionCatalogItem[];
}

export interface PermissionCatalogDefinition {
  code: string;
  name: string;
  groupKey: string;
  groupName: string;
  description?: string;
}

export const defaultPermissionDefinitions: PermissionCatalogDefinition[] = [
  {
    code: 'profile-view',
    name: 'Xem ho so ca nhan',
    groupKey: 'user-module',
    groupName: 'Nguoi dung',
  },
  {
    code: 'user-list',
    name: 'Danh sach nguoi dung',
    groupKey: 'user-module',
    groupName: 'Nguoi dung',
  },
  {
    code: 'user-edit',
    name: 'Sua nguoi dung',
    groupKey: 'user-module',
    groupName: 'Nguoi dung',
  },
  {
    code: 'user-create',
    name: 'Tao moi',
    groupKey: 'user-module',
    groupName: 'Nguoi dung',
  },
  {
    code: 'user-delete',
    name: 'Xoa',
    groupKey: 'user-module',
    groupName: 'Nguoi dung',
  },
  {
    code: 'user-tree',
    name: 'Cay thu muc',
    groupKey: 'user-module',
    groupName: 'Nguoi dung',
  },
  {
    code: 'device-send-command',
    name: 'Gui lenh',
    groupKey: 'device-module',
    groupName: 'Thiet bi',
  },
  {
    code: 'device-edit-sim',
    name: 'Sua so SIM',
    groupKey: 'device-module',
    groupName: 'Thiet bi',
  },
  {
    code: 'device-edit-group',
    name: 'Sua nhom',
    groupKey: 'device-module',
    groupName: 'Thiet bi',
  },
];

export const buildPermissionCatalogTree = (
  items: PermissionCatalogDefinition[]
): PermissionCatalogItem[] => {
  const groups = new Map<string, PermissionCatalogItem>();

  for (const item of items) {
    const existing = groups.get(item.groupKey);
    const node: PermissionCatalogItem = {
      id: item.code,
      name: item.name,
      groupKey: item.groupKey,
      groupName: item.groupName,
      description: item.description,
    };

    if (!existing) {
      groups.set(item.groupKey, {
        id: item.groupKey,
        name: item.groupName,
        groupKey: item.groupKey,
        groupName: item.groupName,
        children: [node],
      });
      continue;
    }

    existing.children = [...(existing.children || []), node];
  }

  return Array.from(groups.values());
};
