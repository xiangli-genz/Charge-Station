export interface PermissionCatalogItem {
  id: string;
  name: string;
  children?: PermissionCatalogItem[];
}

export const permissionCatalog: PermissionCatalogItem[] = [
  {
    id: 'dashboard',
    name: 'Trang tong quan',
  },
  {
    id: 'station-module',
    name: 'Quan ly tram sac',
    children: [
      { id: 'station-list', name: 'Danh sach tram sac' },
      { id: 'station-create', name: 'Tao tram sac' },
      { id: 'station-edit', name: 'Sua tram sac' },
      { id: 'station-delete', name: 'Xoa tram sac' },
    ],
  },
  {
    id: 'charging-point-module',
    name: 'Quan ly cong sac',
    children: [
      { id: 'charging-point-list', name: 'Danh sach cong sac' },
      { id: 'charging-point-create', name: 'Tao cong sac' },
      { id: 'charging-point-edit', name: 'Sua cong sac' },
      { id: 'charging-point-delete', name: 'Xoa cong sac' },
    ],
  },
  {
    id: 'pricing-module',
    name: 'Quan ly gia dich vu',
    children: [
      { id: 'pricing-list', name: 'Danh sach bang gia' },
      { id: 'pricing-create', name: 'Tao bang gia' },
      { id: 'pricing-edit', name: 'Sua bang gia' },
      { id: 'pricing-delete', name: 'Xoa bang gia' },
    ],
  },
  {
    id: 'swap-station-module',
    name: 'Quan ly tram doi pin',
    children: [
      { id: 'swap-station-list', name: 'Danh sach tram doi pin' },
      { id: 'swap-station-create', name: 'Tao tram doi pin' },
      { id: 'swap-station-edit', name: 'Sua tram doi pin' },
      { id: 'swap-station-delete', name: 'Xoa tram doi pin' },
    ],
  },
  {
    id: 'booking-module',
    name: 'Quan ly booking',
    children: [
      { id: 'booking-list', name: 'Danh sach booking' },
      { id: 'booking-create', name: 'Tao booking' },
      { id: 'booking-edit', name: 'Sua booking' },
      { id: 'booking-delete', name: 'Xoa booking' },
    ],
  },
  {
    id: 'account-module',
    name: 'Quan ly tai khoan',
    children: [
      { id: 'account-list', name: 'Danh sach tai khoan' },
      { id: 'account-create', name: 'Tao tai khoan' },
      { id: 'account-edit', name: 'Sua tai khoan' },
      { id: 'account-reset-password', name: 'Dat lai mat khau' },
      { id: 'account-delete', name: 'Xoa tai khoan' },
    ],
  },
  {
    id: 'permission-group-module',
    name: 'Quan ly nhom quyen',
    children: [
      { id: 'permission-group-list', name: 'Danh sach nhom quyen' },
      { id: 'permission-group-create', name: 'Tao nhom quyen' },
      { id: 'permission-group-edit', name: 'Sua nhom quyen' },
      { id: 'permission-group-delete', name: 'Xoa nhom quyen' },
    ],
  },
];

export const flattenPermissionCatalog = (
  items: PermissionCatalogItem[]
): PermissionCatalogItem[] => {
  return items.flatMap((item) => [item, ...(item.children ? flattenPermissionCatalog(item.children) : [])]);
};
