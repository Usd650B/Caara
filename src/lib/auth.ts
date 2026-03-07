import { auth } from './firebase';

// Single seller credentials (you as the owner)
const SELLER_EMAIL = 'admin@caara.com';
const SELLER_PASSWORD = 'caara123';

export const signInAsSeller = async () => {
  try {
    // In production, you'd use proper Firebase Auth
    // For now, we'll use localStorage to simulate authentication
    localStorage.setItem('isSeller', 'true');
    localStorage.setItem('sellerEmail', SELLER_EMAIL);
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in' };
  }
};

export const signOutSeller = () => {
  localStorage.removeItem('isSeller');
  localStorage.removeItem('sellerEmail');
};

export const isSellerAuthenticated = () => {
  return localStorage.getItem('isSeller') === 'true';
};

export const getSellerEmail = () => {
  return localStorage.getItem('sellerEmail');
};
