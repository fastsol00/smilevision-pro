import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Role = "admin" | "hygienist" | "assistant";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  clinicId: string;
}

interface AuthState {
  user: SessionUser;
  password: string;
  updateEmail: (email: string) => void;
  updatePassword: (password: string) => void;
  validateCredentials: (email: string, password: string) => boolean;
}

const defaultUser: SessionUser = {
  id: "demo-user",
  email: "antonio.mirone@smilevision.pro",
  fullName: "Dr. Antonio Mirone",
  role: "hygienist",
  clinicId: "demo-clinic",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      password: "SmileVision2026!",
      updateEmail: (email) =>
        set((state) => ({
          user: {
            ...state.user,
            email,
          },
        })),
      updatePassword: (password) => set({ password }),
      validateCredentials: (email, password) => {
        const state = get();
        return state.user.email.toLowerCase() === email.trim().toLowerCase() && state.password === password;
      },
    }),
    {
      name: "smilevision-pro:auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage),
      ),
      skipHydration: true,
    },
  ),
);

export function getCurrentUser(): SessionUser {
  return useAuthStore.getState().user;
}

export function hasRole(user: SessionUser, role: Role): boolean {
  if (user.role === "admin") return true;
  return user.role === role;
}
