import { create } from 'zustand';
import type {  Alert  } from '../types';

interface NotificationState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  setAlerts: (alerts: Alert[]) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  alerts: [],
  unreadCount: 0,
  loading: true,
  error: null,
  setAlerts: (alerts) => 
    set({ 
      alerts, 
      unreadCount: alerts.filter(a => !a.read).length,
      loading: false 
    }),
  markAsRead: (alertId) =>
    set((state) => {
      const newAlerts = state.alerts.map(a => 
        a.id === alertId ? { ...a, read: true } : a
      );
      return {
        alerts: newAlerts,
        unreadCount: newAlerts.filter(a => !a.read).length
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map(a => ({ ...a, read: true })),
      unreadCount: 0
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
