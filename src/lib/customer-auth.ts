import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getDb, getFirebaseAuth } from './firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  createdAt: any
  lastLoginAt: any
  orderHistory?: string[]
  preferences?: {
    newsletter: boolean
    smsNotifications: boolean
  }
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

// Magic Link Authentication
export const sendMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Not available on server' };
  try {
    const magicLinkToken = generateMagicToken()
    const expiresAt = Date.now() + (15 * 60 * 1000) // 15 minutes
    
    localStorage.setItem('magicLink', JSON.stringify({
      email,
      token: magicLinkToken,
      expiresAt,
      createdAt: Date.now()
    }))
    
    console.log(`Magic link sent to ${email}: ${window.location.origin}/auth/magic-link?token=${magicLinkToken}&email=${encodeURIComponent(email)}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending magic link:', error)
    return { success: false, error: 'Failed to send magic link' }
  }
}

export const verifyMagicLink = async (token: string, email: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Not available on server' };
  try {
    const magicLinkData = JSON.parse(localStorage.getItem('magicLink') || '{}')
    
    if (magicLinkData.token !== token || magicLinkData.email !== email) {
      return { success: false, error: 'Invalid or expired magic link' }
    }
    
    if (Date.now() > magicLinkData.expiresAt) {
      return { success: false, error: 'Magic link has expired' }
    }
    
    const user = await createOrUpdateUser(email)
    localStorage.removeItem('magicLink')
    const session = createAuthSession(user)
    localStorage.setItem('customerAuthSession', JSON.stringify(session))
    window.dispatchEvent(new Event('customer-auth-changed'))
    
    return { success: true, user }
  } catch (error) {
    console.error('Error verifying magic link:', error)
    return { success: false, error: 'Failed to verify magic link' }
  }
}

// Google Authentication
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Not available on server' };
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth not available');
    
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    const firebaseUser = result.user
    const user = await createOrUpdateUser(firebaseUser.email!, {
      name: firebaseUser.displayName || undefined,
      avatar: firebaseUser.photoURL || undefined
    })
    
    const session = createAuthSession(user)
    localStorage.setItem('customerAuthSession', JSON.stringify(session))
    window.dispatchEvent(new Event('customer-auth-changed'))
    
    return { success: true, user }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return { success: false, error: 'Failed to sign in with Google' }
  }
}

// Phone OTP Authentication
export const sendPhoneOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Not available on server' };
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + (5 * 60 * 1000) // 5 minutes
    
    localStorage.setItem('phoneOTP', JSON.stringify({
      phone,
      otp,
      expiresAt,
      createdAt: Date.now()
    }))
    
    console.log(`OTP sent to ${phone}: ${otp}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Failed to send OTP' }
  }
}

export const verifyPhoneOTP = async (phone: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Not available on server' };
  try {
    const otpData = JSON.parse(localStorage.getItem('phoneOTP') || '{}')
    
    if (otpData.phone !== phone || otpData.otp !== otp) {
      return { success: false, error: 'Invalid OTP' }
    }
    
    if (Date.now() > otpData.expiresAt) {
      return { success: false, error: 'OTP has expired' }
    }
    
    const user = await createOrUpdateUser(`phone_${phone}`, { phone })
    localStorage.removeItem('phoneOTP')
    const session = createAuthSession(user)
    localStorage.setItem('customerAuthSession', JSON.stringify(session))
    window.dispatchEvent(new Event('customer-auth-changed'))
    
    return { success: true, user }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'Failed to verify OTP' }
  }
}

// Guest to Profile Conversion
export const convertGuestToProfile = async (email: string, name?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Not available on server' };
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not available');
    
    const guestOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]')
    const user = await createOrUpdateUser(email, { name })
    
    if (guestOrders.length > 0) {
      await updateDoc(doc(db, 'users', user.id), {
        orderHistory: guestOrders.map((order: any) => order.id),
        updatedAt: serverTimestamp()
      })
    }
    
    const session = createAuthSession(user)
    localStorage.setItem('customerAuthSession', JSON.stringify(session))
    window.dispatchEvent(new Event('customer-auth-changed'))
    localStorage.removeItem('orderHistory')
    
    return { success: true, user }
  } catch (error) {
    console.error('Error converting guest to profile:', error)
    return { success: false, error: 'Failed to create profile' }
  }
}

// Helper Functions
const generateMagicToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const createOrUpdateUser = async (email: string, additionalData?: { name?: string; phone?: string; avatar?: string }): Promise<User> => {
  const db = getDb();
  if (!db) throw new Error('Firestore not available');
  
  const userRef = doc(db, 'users', email.replace(/[^a-zA-Z0-9]/g, '_'))
  const userDoc = await getDoc(userRef)
  
  const userData: User = {
    id: email.replace(/[^a-zA-Z0-9]/g, '_'),
    email,
    createdAt: userDoc.exists() ? userDoc.data()?.createdAt : serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    ...additionalData
  }
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      ...userData,
      preferences: {
        newsletter: false,
        smsNotifications: false
      }
    })
    
    // Track signup analytics
    try {
      const { trackSignup } = await import('./analytics');
      await trackSignup();
    } catch (e) {
      console.error('Failed to log signup analytics', e);
    }
  } else {
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      ...additionalData
    })
  }
  
  return userData
}

const createAuthSession = (user: User): AuthSession => {
  return {
    user,
    token: generateMagicToken(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
}

// Session Management
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const sessionData = JSON.parse(localStorage.getItem('customerAuthSession') || '{}')
    
    if (Date.now() > sessionData.expiresAt) {
      localStorage.removeItem('customerAuthSession')
      return null
    }
    
    return sessionData.user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const signOutCustomer = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('customerAuthSession')
    window.dispatchEvent(new Event('customer-auth-changed'))
    window.location.href = '/'
  }
}

export const isCustomerAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}
