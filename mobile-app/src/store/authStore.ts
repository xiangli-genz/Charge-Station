import { create } from "zustand";
import type { CustomerProfile } from "../types/api";

type AuthState = {
  token: string | null;
  user: CustomerProfile | null;
  hydrated: boolean;
  pinSetupRequired: boolean;
  setToken: (token: string) => void;
  setSession: (token: string, user: CustomerProfile) => void;
  setUser: (user: CustomerProfile | null) => void;
  setPinSetupRequired: (required: boolean) => void;
  clearToken: () => void;
  markHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  pinSetupRequired: false,
  setToken: (token) => set({ token }),
  setSession: (token, user) =>
    set({ token, user, pinSetupRequired: !user.pinEnabled }),
  setUser: (user) => set({ user }),
  setPinSetupRequired: (pinSetupRequired) => set({ pinSetupRequired }),
  clearToken: () => set({ token: null, user: null, pinSetupRequired: false }),
  markHydrated: () => set({ hydrated: true })
}));
