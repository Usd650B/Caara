import { doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, query, orderBy, limit, Timestamp, deleteDoc } from 'firebase/firestore'
import { getDb } from './firebase'
import { Product } from './firestore'

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

// Session Generator
const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  let sessionId = localStorage.getItem('caara_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('caara_session_id', sessionId);
  }
  return sessionId;
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

export const trackDetailedProductClick = async (product: Product, user: any = null) => {
  // First, do the general count increment
  await trackProductClick();

  if (typeof window === 'undefined') return;
  const db = getDb();
  if (!db) return;

  try {
    const sessionId = getSessionId();
    // Let Firestore generate an ID
    const clickRef = doc(collection(db, 'analytics_product_clicks'));
    await setDoc(clickRef, {
      productId: product.id,
      productName: product.name,
      productImage: product.image || (product.images && product.images[0]) || '',
      price: product.price,
      sessionId,
      userEmail: user?.email || 'Anonymous',
      userName: user?.name || 'Guest',
      timestamp: Timestamp.now()
    });
  } catch (err) {
    console.error("Failed to track detailed product click", err);
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

export const syncCartState = async (cartItems: any[], user: any = null, contactInfo: any = null) => {
  if (typeof window === 'undefined') return;
  const db = getDb();
  if (!db) return;

  try {
    const sessionId = getSessionId();
    const cartRef = doc(db, 'analytics_carts', sessionId);
    
    if (cartItems.length === 0) {
      // Cart emptied naturally, remove tracking doc
      await deleteDoc(cartRef).catch(() => {});
      return;
    }

    const totalValue = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const resolvedUserEmail = contactInfo?.email || user?.email;
    const resolvedUserName = (contactInfo?.firstName ? `${contactInfo.firstName} ${contactInfo.lastName}` : null) || user?.name || user?.displayName;
    const resolvedPhone = contactInfo?.phone || user?.phone;

    await setDoc(cartRef, {
      sessionId,
      items: cartItems.map(item => ({
        id: item.id || '',
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        size: item.size || '',
        color: item.color || '',
        image: item.image || ''
      })),
      totalValue,
      itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      userEmail: resolvedUserEmail || 'Anonymous',
      userName: resolvedUserName || 'Guest',
      phone: resolvedPhone || '',
      updatedAt: Timestamp.now(),
      status: 'abandoned_pending' 
    }, { merge: true });

  } catch (err) {
    console.error("Failed to sync cart state", err);
  }
}

export const markCartConverted = async () => {
  if (typeof window === 'undefined') return;
  const db = getDb();
  if (!db) return;

  try {
    const sessionId = getSessionId();
    const cartRef = doc(db, 'analytics_carts', sessionId);
    // Delete since order succeeded
    await deleteDoc(cartRef).catch(() => {});
  } catch (err) {
    console.error("Failed to clear cart state", err);
  }

  // Also track generic completion
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

export const trackOrderCompleted = async () => {
  await markCartConverted();
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

// Data Fetchers for Admin
export const getActiveAbandonedCarts = async () => {
  const db = getDb();
  if (!db) return [];
  
  try {
    const q = query(collection(db, 'analytics_carts'), limit(50));
    const snapshot = await getDocs(q);
    const carts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    return carts.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
      const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Failed to fetch abandoned carts:", error);
    return [];
  }
}

export const getRecentProductClicks = async () => {
  const db = getDb();
  if (!db) return [];
  
  try {
    const q = query(collection(db, 'analytics_product_clicks'), orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Failed to fetch recent product clicks:", error);
    return [];
  }
}

// Aggregate product clicks by productId to get click counts per product
export const getProductClickCounts = async (): Promise<{ productId: string; productName: string; productImage: string; price: number; clicks: number }[]> => {
  const db = getDb();
  if (!db) return [];

  try {
    const q = query(collection(db, 'analytics_product_clicks'), orderBy('timestamp', 'desc'), limit(1000));
    const snapshot = await getDocs(q);
    const counts: Record<string, any> = {};

    snapshot.docs.forEach(doc => {
      const d = doc.data() as any;
      const pid = d.productId;
      if (!pid) return;
      if (!counts[pid]) {
        counts[pid] = { productId: pid, productName: d.productName, productImage: d.productImage, price: d.price, clicks: 0 };
      }
      counts[pid].clicks += 1;
    });

    return Object.values(counts).sort((a: any, b: any) => b.clicks - a.clicks);
  } catch (err) {
    console.error("Failed to get product click counts:", err);
    return [];
  }
}

// Get daily analytics for a date range (returns array of DailyAnalytics sorted by date asc)
export const getAnalyticsRange = async (range: 'today' | 'week' | 'month' | 'year'): Promise<DailyAnalytics[]> => {
  const db = getDb();
  if (!db) return [];

  try {
    const now = new Date();
    const q = query(collection(db, 'analytics_daily'));
    const snapshot = await getDocs(q);
    const all: DailyAnalytics[] = snapshot.docs.map(d => d.data() as DailyAnalytics);

    const startDate = new Date(now);
    if (range === 'today') startDate.setHours(0, 0, 0, 0);
    else if (range === 'week') startDate.setDate(now.getDate() - 6);
    else if (range === 'month') startDate.setDate(now.getDate() - 29);
    else if (range === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const fmtStart = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const fmtEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return all.filter(d => d.date >= fmtStart && d.date <= fmtEnd).sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error("Failed to get analytics range:", err);
    return [];
  }
}

// Dashboard Aggregation
export const getDashboardAnalytics = async (): Promise<{
  totalVisitors: number;
  todayVisitors: number;
  totalProductViews: number;
  todayProductViews: number;
  abandonedCarts: number;
  totalSignups: number;
  todaySignups: number;
}> => {
  const db = getDb()
  if (!db) {
    return {
      totalVisitors: 0,
      todayVisitors: 0,
      totalProductViews: 0,
      todayProductViews: 0,
      abandonedCarts: 0,
      totalSignups: 0,
      todaySignups: 0
    }
  }

  try {
    const q = query(collection(db, 'analytics_daily'))
    const querySnapshot = await getDocs(q)
    
    let totalVisitors = 0
    let todayVisitors = 0
    let totalProductViews = 0
    let todayProductViews = 0
    let totalAddedToCart = 0
    let totalCompletedOrders = 0
    let totalSignups = 0
    let todaySignups = 0

    const todayId = getTodayDocId()

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DailyAnalytics
      totalVisitors += data.visitors || 0
      totalProductViews += data.productViews || 0
      totalAddedToCart += data.addedToCart || 0
      totalCompletedOrders += data.completedOrders || 0
      totalSignups += data.signups || 0

      if (data.date === todayId || doc.id === todayId) {
        todayVisitors = data.visitors || 0
        todayProductViews = data.productViews || 0
        todaySignups = data.signups || 0
      }
    })

    const abandonedCarts = Math.max(0, totalAddedToCart - totalCompletedOrders)

    return {
      totalVisitors,
      todayVisitors,
      totalProductViews,
      todayProductViews,
      abandonedCarts,
      totalSignups,
      todaySignups
    }
  } catch (err) {
    console.error("Failed to fetch dashboard analytics", err)
    return {
      totalVisitors: 0,
      todayVisitors: 0,
      totalProductViews: 0,
      todayProductViews: 0,
      abandonedCarts: 0,
      totalSignups: 0,
      todaySignups: 0
    }
  }
}
