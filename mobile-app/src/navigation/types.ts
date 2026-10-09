import type { StationItem } from "../types/api";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PasswordLogin: { identifier: string };
  PinLogin: { identifier: string };
  RegisterVerify: {
    userId: string;
    channel: "email" | "phone";
    target: string;
    identifier: string;
    devCode?: string;
  };
  SetPin: undefined;
  ForgotPin: { identifier?: string } | undefined;
  Home: undefined;
  StationList: undefined;
  StationDetail: { station: StationItem };
  BookingHistory: undefined;
  Favorites: undefined;
  ActivityLogs: undefined;
  Profile: undefined;
};
