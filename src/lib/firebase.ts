import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDQUmLojTgB2Az66i4mTrIJXab0jWW0UdM",
  authDomain: "caara-b598f.firebaseapp.com",
  projectId: "caara-b598f",
  storageBucket: "caara-b598f.firebasestorage.app",
  messagingSenderId: "1017534272390",
  appId: "1:1017534272390:web:31e14b19a67c993c0a1207",
  measurementId: "G-TX6W89T6X5"
};

// Initialize app only once
let app: any = null;
if (typeof window !== 'undefined') {
  console.log('Initializing Firebase with config:', { ...firebaseConfig, apiKey: '***' });
  app = initializeApp(firebaseConfig);
}

// Lazy getters for services
export const getDb = () => {
  if (typeof window === 'undefined') return null;
  return getFirestore(app);
};

export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') return null;
  return getAuth(app);
};

export const getFirebaseStorage = () => {
  if (typeof window === 'undefined') return null;
  return getStorage(app);
};

// For backward compatibility (use with caution during SSR)
export const db = typeof window !== 'undefined' ? getFirestore(app) : null as any;
export const auth = typeof window !== 'undefined' ? getAuth(app) : null as any;
export const storage = typeof window !== 'undefined' ? getStorage(app) : null as any;

// Initialize analytics only on client side
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
