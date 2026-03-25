"use client"
import { getFirebaseAuth } from './firebase';

// Single seller credentials (you as the owner)
const SELLER_EMAIL = 'admin@shedoo.com';
const SELLER_PASSWORD = 'shedoo123';

export const signInAsSeller = async () => {
  try {
    if (typeof window === 'undefined') return { success: false, error: 'Cannot sign in on server' };
    
    const auth = getFirebaseAuth();
    if (auth) {
      // Logic for signing in with auth if needed
    }
    localStorage.setItem('isSeller', 'true');
    localStorage.setItem('sellerEmail', SELLER_EMAIL);
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
};

export const signOutSeller = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('isSeller');
  localStorage.removeItem('sellerEmail');
};

export const isSellerAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isSeller') === 'true';
};

export const getSellerEmail = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sellerEmail');
};
