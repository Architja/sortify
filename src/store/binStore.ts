import { create } from 'zustand';
import type {  SmartBin  } from '../types';

interface BinState {
  bins: SmartBin[];
  loading: boolean;
  error: string | null;
  setBins: (bins: SmartBin[]) => void;
  updateBinLocally: (binId: string, updates: Partial<SmartBin>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBinStore = create<BinState>((set) => ({
  bins: [],
  loading: true,
  error: null,
  setBins: (bins) => set({ bins, loading: false }),
  updateBinLocally: (binId, updates) =>
    set((state) => ({
      bins: state.bins.map((bin) => (bin.id === binId ? { ...bin, ...updates } : bin)),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
