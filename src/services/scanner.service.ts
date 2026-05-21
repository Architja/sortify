import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { analyzeWasteImage } from './gemini.service';
import type {  WasteScan, Alert  } from '../types';

export const processWasteScan = async (userId: string, base64Image: string) => {
  // 1. Analyze with Gemini
  const analysisResult = await analyzeWasteImage(base64Image);

  // 2. Mock Firebase upload if in Demo Mode
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    const scanData: Partial<WasteScan> = {
      id: `demo-scan-${Date.now()}`,
      userId,
      imageUrl: base64Image,
      wasteCategory: analysisResult.wasteCategory,
      hazardLevel: analysisResult.hazardLevel,
      confidenceScore: analysisResult.confidenceScore,
      recyclingSuggestion: analysisResult.recyclingSuggestion,
      disposalRecommendation: analysisResult.disposalRecommendation,
      hazardWarning: analysisResult.hazardWarning || null,
      detectedItems: analysisResult.detectedItems || [],
      rawGeminiResponse: JSON.stringify(analysisResult),
      scannedAt: new Date() as any,
    };
    
    // Save to localStorage for demo analytics
    const demoScans = JSON.parse(localStorage.getItem('demo_scans') || '[]');
    demoScans.push(scanData);
    localStorage.setItem('demo_scans', JSON.stringify(demoScans));

    return scanData as WasteScan;
  }

  // 3. Upload image to Storage
  const imageId = doc(collection(db, 'scans')).id; // generate ID early
  const storageRef = ref(storage, `scans/${userId}/${imageId}.jpg`);
  await uploadString(storageRef, base64Image, 'data_url');
  const imageUrl = await getDownloadURL(storageRef);

  // 3. Save to Firestore
  const scanData: Partial<WasteScan> = {
    id: imageId,
    userId,
    imageUrl,
    wasteCategory: analysisResult.wasteCategory,
    hazardLevel: analysisResult.hazardLevel,
    confidenceScore: analysisResult.confidenceScore,
    recyclingSuggestion: analysisResult.recyclingSuggestion,
    disposalRecommendation: analysisResult.disposalRecommendation,
    hazardWarning: analysisResult.hazardWarning || null,
    detectedItems: analysisResult.detectedItems || [],
    rawGeminiResponse: JSON.stringify(analysisResult),
    scannedAt: serverTimestamp() as any,
  };

  await setDoc(doc(db, 'scans', imageId), scanData);

  // 4. Trigger alert if hazardous
  if (analysisResult.hazardLevel === 'High' || analysisResult.hazardLevel === 'Hazardous') {
    const alertRef = doc(collection(db, 'alerts'));
    const alertData: Partial<Alert> = {
      id: alertRef.id,
      type: 'hazardous_waste',
      scanId: imageId,
      message: `Hazardous waste detected: ${analysisResult.wasteCategory}. ${analysisResult.hazardWarning}`,
      severity: 'critical',
      read: false,
      createdAt: serverTimestamp() as any,
    };
    await setDoc(alertRef, alertData);
  }

  return scanData as WasteScan;
};
