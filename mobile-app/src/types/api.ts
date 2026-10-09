export type StationStatus = "active" | "inactive" | "maintenance" | "closed";
export type ChargingPointStatus = "available" | "occupied" | "reserved" | "maintenance";
export type ConnectorType = "AC_Type2" | "CCS2" | "CHAdeMO" | "GB_T";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "customer";
  address: string;
  description: string;
  walletBalance: number;
  pinEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  vehicleType: "motorbike" | "car" | "truck" | "other";
  vehicleName: string;
  vehicleImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: CustomerProfile;
}

export interface RegistrationOtpResponse {
  success: boolean;
  message: string;
  userId: string;
  channel: "email" | "phone";
  target: string;
  expiresAt: string;
  devCode?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PricingSummary {
  id: string;
  name: string;
  pricePerKwh: number;
  pricePerMinute: number;
}

export interface ChargingPointSummary {
  _id: string;
  code: string;
  connectorType: ConnectorType;
  powerKw: number;
  status: ChargingPointStatus;
  pricing?: PricingSummary;
}

export interface StationItem {
  _id: string;
  imei: string;
  name: string;
  address: string;
  city?: string;
  district?: string;
  location: {
    lat: number;
    lng: number;
  };
  status: StationStatus;
  open24_7?: boolean;
  totalChargingPoints: number;
  availableChargingPoints: number;
  matchingChargingPoints: ChargingPointSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface StationListResponse {
  items: StationItem[];
  pagination: Pagination;
}

export interface BookingItem {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  vehicle: {
    type: "motorbike" | "car" | "truck" | "other" | string;
    name: string;
    imageUrl: string;
  };
  chargingSummary: {
    kwhConsumed: number;
    amount: number;
  };
  chargingPoint: {
    id: string;
    code: string;
    connectorType: string;
    powerKw: number;
    status: string;
    pricing: PricingSummary | null;
    station: {
      id: string;
      name: string;
      address: string;
      city: string;
      district: string;
      location: {
        lat: number;
        lng: number;
      } | null;
    } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingListResponse {
  items: BookingItem[];
  pagination: Pagination;
}

export interface FavoriteStationItem {
  id: string;
  createdAt: string;
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    district: string;
    status: StationStatus | string;
    chargingType: string;
    currentType: string;
    open24_7: boolean;
    location: {
      lat: number;
      lng: number;
    };
    totalChargingPoints: number;
    availableChargingPoints: number;
  };
}

export interface FavoriteStationListResponse {
  items: FavoriteStationItem[];
}

export interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityLogListResponse {
  items: ActivityLogItem[];
  pagination: Pagination;
}
