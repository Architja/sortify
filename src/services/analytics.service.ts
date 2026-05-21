import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type {  WasteScan, SmartBin  } from '../types';
import { subDays, startOfDay, format } from 'date-fns';

export interface AnalyticsData {
  totalScans: number;
  hazardousCount: number;
  recyclingRate: number;
  activeBins: number;
  totalBins: number;
  wasteDistribution: { name: string; value: number }[];
  dailyScans: { date: string; count: number }[];
  hazardBreakdown: { name: string; value: number }[];
}

export const getAnalyticsData = async (bins: SmartBin[], userId: string): Promise<AnalyticsData> => {
  let scans: WasteScan[] = [];

  // Check if in Demo Mode
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    const rawScans = JSON.parse(localStorage.getItem('demo_scans') || '[]');
    scans = rawScans
      .filter((s: any) => s.userId === userId)
      .map((s: any) => ({
        ...s,
        // Mock the Firestore Timestamp toDate() function
        scannedAt: { toDate: () => new Date(s.scannedAt) }
      }));
  } else {
    // Get all scans from Firestore for this user
    const q = query(collection(db, 'scans'), where('userId', '==', userId));
    const scansSnapshot = await getDocs(q);
    scans = scansSnapshot.docs.map(doc => doc.data() as WasteScan);
  }
  
  const totalScans = scans.length;
  const hazardousCount = scans.filter(s => s.hazardLevel === 'High' || s.hazardLevel === 'Hazardous').length;
  
  const recyclableCategories = ['Plastic', 'Metal', 'Glass', 'Paper', 'E-Waste'];
  const recyclableCount = scans.filter(s => recyclableCategories.includes(s.wasteCategory)).length;
  const recyclingRate = totalScans > 0 ? (recyclableCount / totalScans) * 100 : 0;

  const totalBins = bins.length;
  const activeBins = bins.filter(b => b.isActive).length;

  // Waste Distribution
  const distributionMap: Record<string, number> = {};
  scans.forEach(s => {
    distributionMap[s.wasteCategory] = (distributionMap[s.wasteCategory] || 0) + 1;
  });
  const wasteDistribution = Object.keys(distributionMap).map(key => ({
    name: key,
    value: distributionMap[key]
  }));

  // Hazard Breakdown
  const hazardMap: Record<string, number> = {};
  scans.forEach(s => {
    hazardMap[s.hazardLevel] = (hazardMap[s.hazardLevel] || 0) + 1;
  });
  const hazardBreakdown = Object.keys(hazardMap).map(key => ({
    name: key,
    value: hazardMap[key]
  }));

  // Daily Scans (Last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const dailyMap: Record<string, number> = {};
  
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    dailyMap[format(d, 'MMM dd')] = 0;
  }

  scans.forEach(s => {
    if (s.scannedAt) {
      const scanDate = s.scannedAt.toDate();
      if (scanDate >= thirtyDaysAgo) {
        const formattedDate = format(scanDate, 'MMM dd');
        if (dailyMap[formattedDate] !== undefined) {
          dailyMap[formattedDate]++;
        }
      }
    }
  });
  
  const dailyScans = Object.keys(dailyMap).map(key => ({
    date: key,
    count: dailyMap[key]
  }));

  return {
    totalScans,
    hazardousCount,
    recyclingRate,
    activeBins,
    totalBins,
    wasteDistribution,
    dailyScans,
    hazardBreakdown
  };
};
