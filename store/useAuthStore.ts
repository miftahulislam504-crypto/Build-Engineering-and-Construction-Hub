import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthStore {
  user:       User | null;
  isLoading:  boolean;
  setUser:    (user: User | null) => void;
  setLoading: (v: boolean) => void;
  logout:     () => void;
  isAdmin:    () => boolean;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:      null,
      isLoading: false,

      setUser:    (user) => set({ user }),
      setLoading: (v)    => set({ isLoading: v }),
      logout:     ()     => set({ user: null }),
      isAdmin:    ()     => ["admin", "super_admin"].includes(get().user?.role ?? ""),
      isLoggedIn: ()     => !!get().user,
    }),
    { name: "auth", storage: createJSONStorage(() => localStorage) }
  )
);
