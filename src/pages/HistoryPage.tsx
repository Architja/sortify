import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Clock } from 'lucide-react';
import type { WasteScan } from '../types';

export const HistoryPage = () => {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<WasteScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      if (!user) return;
      if (import.meta.env.VITE_FIREBASE_API_KEY !== 'YOUR_API_KEY' && import.meta.env.VITE_FIREBASE_API_KEY) {
        const q = query(collection(db, 'scans'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data: WasteScan[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<WasteScan, 'id'>),
        }));
        setScans(data);
      } else {
        const demoScans: WasteScan[] = JSON.parse(localStorage.getItem('demo_scans') || '[]');
        const userScans = demoScans.filter((scan) => scan.userId === user.uid);
        setScans(userScans);
      }
      setLoading(false);
    };
    fetchScans();
  }, [user]);

  if (loading) {
    return (
      <PageWrapper title="Scan History">
        <div className="text-center py-12">Loading scans...</div>
      </PageWrapper>
    );
  }

  if (scans.length === 0) {
    return (
      <PageWrapper title="Scan History">
        <div className="text-center py-12">No scans have been recorded yet.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Scan History">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scans.map((scan) => (
          <div key={scan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <img src={scan.imageUrl} alt="Scan" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{scan.wasteCategory}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Hazard: <span className={scan.hazardLevel === 'High' || scan.hazardLevel === 'Hazardous' ? 'text-red-600' : 'text-green-600'}>{scan.hazardLevel}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Score: {(scan.confidenceScore * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{new Date(scan.scannedAt?.seconds ? scan.scannedAt.seconds * 1000 : Date.now()).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
};

