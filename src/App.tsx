import { useEffect } from 'react';
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
  NotFoundPage 
} from './pages';

function App() {
  const { setUser, setCustomUser, setLoading, setError, user } = useAuthStore();
  const { setAlerts } = useNotificationStore();

  useEffect(() => {
    // Demo Mode Fallback if Firebase is not configured
    if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
      console.log("Running in Demo Mode (No Firebase)");
      const savedUser = localStorage.getItem('demo_user');
      if (savedUser) {
        let u = JSON.parse(savedUser);
        
        // Force downgrade old test accounts from cache
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
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const customUser = await getCustomUser(firebaseUser.uid);
          setCustomUser(customUser);
        } else {
          setUser(null);
          setCustomUser(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setCustomUser, setLoading, setError]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUnreadAlerts(
      (alerts) => {
        setAlerts(alerts);
        // We could trigger toasts here for new critical alerts
      },
      (err) => console.error("Alerts error:", err)
    );
    return () => unsubscribe();
  }, [user, setAlerts]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
