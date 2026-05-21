import { collection, doc, updateDoc, onSnapshot, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type {  SmartBin, CollectionRecord  } from '../types';

export const subscribeToBins = (callback: (bins: SmartBin[]) => void, onError: (error: Error) => void) => {
  const binsRef = collection(db, 'bins');
  
  return onSnapshot(binsRef, (snapshot) => {
    const bins = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as SmartBin[];
    callback(bins);
  }, onError);
};

export const markBinAsCollected = async (binId: string, adminUid: string, currentFill: number, notes?: string) => {
  const batch = writeBatch(db);
  
  // 1. Update bin
  const binRef = doc(db, 'bins', binId);
  batch.update(binRef, {
    fillPercentage: 0,
    status: 'empty',
    collectedBy: adminUid,
    lastCollected: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });

  // 2. Create collection record
  const collectionRef = doc(collection(db, 'collections'));
  const collectionData: Partial<CollectionRecord> = {
    id: collectionRef.id,
    binId,
    collectedBy: adminUid,
    fillAtCollection: currentFill,
    collectedAt: serverTimestamp() as any,
    notes: notes || '',
  };
  batch.set(collectionRef, collectionData);

  await batch.commit();
};

export const addBin = async (binData: Omit<SmartBin, 'id' | 'lastUpdated' | 'isActive'>) => {
  const newBinRef = doc(collection(db, 'bins'));
  const bin: Partial<SmartBin> = {
    ...binData,
    id: newBinRef.id,
    isActive: true,
    lastUpdated: serverTimestamp() as any,
  };
  await setDoc(newBinRef, bin);
};

export const updateBin = async (binId: string, updates: Partial<SmartBin>) => {
  const binRef = doc(db, 'bins', binId);
  await updateDoc(binRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });
};
