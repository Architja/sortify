import { Timestamp } from 'firebase/firestore';

export type WasteCategory = 'Plastic' | 'Metal' | 'Glass' | 'Paper' | 'Organic' | 'Rubber' | 'E-Waste' | 'Medical Waste' | 'Mixed Waste';
export type HazardLevel = 'Low' | 'Medium' | 'High' | 'Hazardous';

export interface SmartBin {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  fillPercentage: number;
  status: 'empty' | 'medium' | 'full';
  lastUpdated: Timestamp;
  isActive: boolean;
  collectedBy?: string;
  lastCollected?: Timestamp;
}

export interface WasteScan {
  id: string;
  userId: string;
  imageUrl: string;
  wasteCategory: WasteCategory;
  hazardLevel: HazardLevel;
  confidenceScore: number;
  recyclingSuggestion: string;
  disposalRecommendation: string;
  hazardWarning: string | null;
  detectedItems?: string[];
  rawGeminiResponse: string;
  scannedAt: Timestamp;
}

export interface CollectionRecord {
  id: string;
  binId: string;
  collectedBy: string;
  fillAtCollection: number;
  collectedAt: Timestamp;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'hazardous_waste' | 'bin_full' | 'bin_overflow';
  binId?: string;
  scanId?: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: Timestamp;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
}
