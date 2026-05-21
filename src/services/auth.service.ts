import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type {  User as CustomUser  } from '../types';
import { useAuthStore } from '../store/authStore';

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    const users = JSON.parse(localStorage.getItem('demo_registered_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error("Firebase: Error (auth/email-already-in-use).");
    }
    const role: 'admin' | 'user' = (email === '100906jainarchit@gmail.com' && password === 'Archit#10') ? 'admin' : 'user';
    const demoUser = { uid: `demo-${Date.now()}`, email, password, displayName, role, createdAt: new Date() as any };
    users.push(demoUser);
    localStorage.setItem('demo_registered_users', JSON.stringify(users));

    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    useAuthStore.getState().setUser({ uid: demoUser.uid, email: demoUser.email } as any);
    useAuthStore.getState().setCustomUser(demoUser);
    return demoUser;
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await updateProfile(user, { displayName });

  const customUser: CustomUser = {
    uid: user.uid,
    email: user.email!,
    displayName,
    role: 'user', // Default role
    createdAt: serverTimestamp() as any,
  };

  await setDoc(doc(db, 'users', user.uid), customUser);
  return customUser;
};

export const loginWithEmail = async (email: string, password: string) => {
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    // Hardcoded Admin login bypass (no registration needed)
    if (email === '100906jainarchit@gmail.com' && password === 'Archit#10') {
      const adminUser = { uid: 'admin-hardcoded', email, displayName: 'Admin Archit', role: 'admin' as const, createdAt: new Date() as any };
      localStorage.setItem('demo_user', JSON.stringify(adminUser));
      useAuthStore.getState().setUser({ uid: adminUser.uid, email: adminUser.email } as any);
      useAuthStore.getState().setCustomUser(adminUser);
      return adminUser;
    }

    const users = JSON.parse(localStorage.getItem('demo_registered_users') || '[]');
    let demoUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (!demoUser) {
      throw new Error("Firebase: Error (auth/invalid-credential).");
    }

    // Force downgrade old test accounts that were given admin previously
    if (demoUser.email !== '100906jainarchit@gmail.com' && demoUser.role === 'admin') {
      demoUser.role = 'user';
      localStorage.setItem('demo_registered_users', JSON.stringify(users));
    }

    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    useAuthStore.getState().setUser({ uid: demoUser.uid, email: demoUser.email } as any);
    useAuthStore.getState().setCustomUser(demoUser);
    return demoUser;
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data() as CustomUser;
  }
  throw new Error("User document not found");
};

export const loginWithGoogle = async () => {
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    const demoUser = { uid: 'demo-google-123', email: 'google@demo.com', displayName: 'Google Demo User', role: 'user' as const, createdAt: new Date() as any };
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    useAuthStore.getState().setUser({ uid: demoUser.uid, email: demoUser.email } as any);
    useAuthStore.getState().setCustomUser(demoUser);
    return demoUser;
  }
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data() as CustomUser;
  } else {
    const customUser: CustomUser = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || 'Google User',
      role: 'user',
      createdAt: serverTimestamp() as any,
    };
    await setDoc(userDocRef, customUser);
    return customUser;
  }
};

export const logout = async () => {
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    localStorage.removeItem('demo_user');
    useAuthStore.getState().clearAuth();
    window.location.reload();
    return;
  }
  await signOut(auth);
};

export const getCustomUser = async (uid: string) => {
  if (import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY' || !import.meta.env.VITE_FIREBASE_API_KEY) {
    const saved = localStorage.getItem('demo_user');
    return saved ? JSON.parse(saved) : null;
  }
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as CustomUser;
  }
  return null;
};
