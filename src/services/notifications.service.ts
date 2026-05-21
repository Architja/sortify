import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type {  Alert  } from '../types';

export const subscribeToUnreadAlerts = (callback: (alerts: Alert[]) => void, onError: (error: Error) => void) => {
  const alertsRef = collection(db, 'alerts');
  const q = query(alertsRef, where('read', '==', false), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Alert[];
    callback(alerts);
  }, onError);
};

export const markAlertAsReadInDb = async (alertId: string) => {
  const alertRef = doc(db, 'alerts', alertId);
  await updateDoc(alertRef, { read: true });
};
