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

console.log('Initializing Firebase with config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize analytics only on client side
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
