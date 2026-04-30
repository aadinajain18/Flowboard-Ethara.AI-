import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("flowboard_user") || "null"),
  token: localStorage.getItem("flowboard_token"),

  setAuth: (user, token) => {
    localStorage.setItem("flowboard_user", JSON.stringify(user));
    localStorage.setItem("flowboard_token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("flowboard_user");
    localStorage.removeItem("flowboard_token");
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));
