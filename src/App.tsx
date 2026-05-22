// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { getCustomUser } from './services/auth.service';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { subscribeToUnreadAlerts } from './services/notifications.service';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import {
  DashboardPage,
  MapPage,
  ScannerPage,
  AnalyticsPage,
  CollectionsPage,
  AdminPage,
  HistoryPage,
  NotFoundPage,
} from './pages';

export const App = () => {
  console.log('🟢 App component rendered');
  const { setUser, setCustomUser, setLoading, setError, user } = useAuthStore();
  const { setAlerts } = useNotificationStore();

  // Track whether the initial auth check is finished
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    // Demo mode – no Firebase
    if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
      console.log('Running in Demo Mode (No Firebase)');
      const savedUser = localStorage.getItem('demo_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        // Downgrade any stray admin test accounts
        if (u.email !== '100906jainarchit@gmail.com' && u.role === 'admin') {
          u.role = 'user';
          localStorage.setItem('demo_user', JSON.stringify(u));
        }
        setUser({ uid: u.uid, email: u.email } as any);
        setCustomUser(u);
      } else {
        setUser(null);
        setCustomUser(null);
      }
      setLoading(false);
      setInitDone(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const custom = await getCustomUser(firebaseUser.uid);
          setCustomUser(custom);
        } else {
          setUser(null);
          setCustomUser(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setInitDone(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, setCustomUser, setLoading, setError]);

  // Subscribe to alerts after we know a user exists
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUnreadAlerts(setAlerts, (err) => console.error('Alerts error:', err));
    return () => unsub();
  }, [user, setAlerts]);

  // Show a simple loading screen until initDone is true
  if (!initDone) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold text-green-600">Loading…</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected regular routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Admin‑only routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
