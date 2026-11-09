import { create } from 'zustand';
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  onAuthChange,
  signUp as signUpService,
} from '../services/authService';
import type { User } from '../types/User';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  isLoading: boolean;
  init: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isReady: false,
  isLoading: false,
  init: () => {
    getCurrentUser()
      .then((user) => set({ user, isAuthenticated: user !== null, isReady: true }))
      .catch(() => set({ isReady: true }));
    return onAuthChange((user) => set({ user, isAuthenticated: user !== null, isReady: true }));
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await loginService(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  signUp: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const user = await signUpService(name, email, password);
      set({ user, isAuthenticated: user !== null, isLoading: false });
      return user !== null;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await logoutService().catch(() => {});
    set({ user: null, isAuthenticated: false });
  },
}));
