import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase if we have an API key, to prevent top-level crash in Demo Mode
const isDemoMode = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY';

export const app = !isDemoMode ? initializeApp(firebaseConfig) : null as any;
export const auth = !isDemoMode ? getAuth(app) : null as any;
export const db = !isDemoMode ? getFirestore(app) : null as any;
export const storage = !isDemoMode ? getStorage(app) : null as any;
export const functions = !isDemoMode ? getFunctions(app) : null as any;

export default app;
