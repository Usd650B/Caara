import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query } from 'firebase/firestore'
import { getDb } from './firebase'

// We will track statistics by day using the "YYYY-MM-DD" format.
// This prevents infinite document creation and naturally limits document size.
const getTodayDocId = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface DailyAnalytics {
  date: string;
  visitors: number;
  productViews: number;
  addedToCart: number;
  completedOrders: number;
  signups: number;
}

// Ensure the daily document exists. If not, it creates it with baseline numbers.
const initializeDailyDoc = async (dateId: string) => {
  const db = getDb()
  if (!db) return null
  const docRef = doc(db, 'analytics_daily', dateId)
  
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      date: dateId,
      visitors: 0,
      productViews: 0,
      addedToCart: 0,
      completedOrders: 0,
      signups: 0
    })
  }
  return docRef
}

export const trackVisitor = async () => {
  if (typeof window === 'undefined') return
  try {
    const today = getTodayDocId()
    const visitorKey = `caara_visited_${today}`
    
    // Check local storage to prevent multiple increments for the same user on the same day
    if (!localStorage.getItem(visitorKey)) {
      const docRef = await initializeDailyDoc(today)
      if (docRef) {
        await updateDoc(docRef, { visitors: increment(1) })
        localStorage.setItem(visitorKey, 'true')
      }
    }
  } catch (err) {
    console.error("Failed to track visitor", err)
  }
}

export const trackProductClick = async () => {
  if (typeof window === 'undefined') return
  try {
    const today = getTodayDocId()
    const docRef = await initializeDailyDoc(today)
    if (docRef) {
      await updateDoc(docRef, { productViews: increment(1) })
    }
  } catch (err) {
    console.error("Failed to track product click", err)
  }
}

export const trackAddToCart = async () => {
  if (typeof window === 'undefined') return
  try {
    const today = getTodayDocId()
    const docRef = await initializeDailyDoc(today)
    if (docRef) {
      await updateDoc(docRef, { addedToCart: increment(1) })
    }
  } catch (err) {
    console.error("Failed to track cart addition", err)
  }
}

export const trackOrderCompleted = async () => {
  if (typeof window === 'undefined') return
  try {
    const today = getTodayDocId()
    const docRef = await initializeDailyDoc(today)
    if (docRef) {
      await updateDoc(docRef, { completedOrders: increment(1) })
    }
  } catch (err) {
    console.error("Failed to track order completion", err)
  }
}

export const trackSignup = async () => {
  if (typeof window === 'undefined') return
  try {
    const today = getTodayDocId()
    const docRef = await initializeDailyDoc(today)
    if (docRef) {
      await updateDoc(docRef, { signups: increment(1) })
    }
  } catch (err) {
    console.error("Failed to track signup", err)
  }
}

// Dashboard Aggregation
export const getDashboardAnalytics = async (): Promise<{
  totalVisitors: number;
  totalProductViews: number;
  abandonedCarts: number;
  totalSignups: number;
}> => {
  const db = getDb()
  if (!db) {
    return {
      totalVisitors: 0,
      totalProductViews: 0,
      abandonedCarts: 0,
      totalSignups: 0
    }
  }

  try {
    const q = query(collection(db, 'analytics_daily'))
    const querySnapshot = await getDocs(q)
    
    let totalVisitors = 0
    let totalProductViews = 0
    let totalAddedToCart = 0
    let totalCompletedOrders = 0
    let totalSignups = 0

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DailyAnalytics
      totalVisitors += data.visitors || 0
      totalProductViews += data.productViews || 0
      totalAddedToCart += data.addedToCart || 0
      totalCompletedOrders += data.completedOrders || 0
      totalSignups += data.signups || 0
    })

    // Abandoned Carts = items added to cart minus completed orders
    // The metric implies that if 10 checkouts were started or explicitly abandoned
    // If it's negative, we clamp to 0.
    const abandonedCarts = Math.max(0, totalAddedToCart - totalCompletedOrders)

    return {
      totalVisitors,
      totalProductViews,
      abandonedCarts,
      totalSignups
    }
  } catch (err) {
    console.error("Failed to fetch dashboard analytics", err)
    return {
      totalVisitors: 0,
      totalProductViews: 0,
      abandonedCarts: 0,
      totalSignups: 0
    }
  }
}
