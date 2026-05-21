import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import type {  User as CustomUser  } from '../types';

interface AuthState {
  user: FirebaseUser | null;
  customUser: CustomUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: FirebaseUser | null) => void;
  setCustomUser: (customUser: CustomUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  customUser: null,
  loading: true, // Initially true while checking auth state
  error: null,
  setUser: (user) => set({ user }),
  setCustomUser: (customUser) => set({ customUser }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearAuth: () => set({ user: null, customUser: null, error: null, loading: false }),
}));
