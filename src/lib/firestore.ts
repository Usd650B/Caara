import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp 
} from 'firebase/firestore';
import { getDb } from './firebase';

// Products collection
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const NOTIFICATIONS_COLLECTION = 'notifications';

export interface Notification {
  id?: string;
  type: 'order' | 'dispute' | 'review' | 'stock' | 'confirmation';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // Order ID or Product ID
  customerName?: string;
  createdAt?: Timestamp;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  status: 'active' | 'out-of-stock';
  description?: string;
  image?: string;
  images?: string[]; // Multiple images (up to 3)
  video?: string; // Product video
  sizes?: string[];
  colors?: string[];
  rating?: number;
  reviews?: number;
  badge?: 'Sale' | 'New' | 'Premium' | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Order {
  id?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  customerLocation?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  shippingMethod?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    whatsapp?: string;
  };
  trackingNumber?: string;
  notes?: string;
  // New features
  isReceivedConfirmed?: boolean;
  disputeStatus?: 'open' | 'resolved';
  disputeReason?: string;
  rating?: number;
  review?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

// Product operations
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    const productData = {
      ...product,
      createdAt: Timestamp.now(),
      status: product.status || 'active'
    };
    
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error: 'Failed to add product' };
  }
};

export const getProducts = async (): Promise<Product[]> => {
  const db = getDb();
  if (!db) return [];
  
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    const productData = {
      ...product,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), productData);
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: (error as Error).message || 'Failed to update product' };
  }
};

export const deleteProduct = async (id: string) => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
};

// Order operations
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
};

export const getOrders = async (): Promise<Order[]> => {
  const db = getDb();
  if (!db) return [];
  
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const getOrder = async (id: string): Promise<Order | null> => {
  const db = getDb();
  if (!db) return null;
  
  try {
    const docSnap = await getDocs(query(collection(db, ORDERS_COLLECTION), where('__name__', '==', id)));
    
    if (docSnap.empty) {
      return null;
    }
    
    const orderDoc = docSnap.docs[0];
    return {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, id), {
      ...order,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const deleteOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Notification operations
export const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notification,
      isRead: false,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding notification:', error);
    return { success: false, error: 'Failed to add notification' };
  }
};

export const getNotifications = async (): Promise<Notification[]> => {
  const db = getDb();
  if (!db) return [];
  
  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const markNotificationRead = async (id: string) => {
  const db = getDb();
  if (!db) return { success: false };
  
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), {
      isRead: true
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification read:', error);
    return { success: false };
  }
};

export const markAllNotificationsRead = async () => {
  const db = getDb();
  if (!db) return { success: false };
  
  try {
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('isRead', '==', false));
    const querySnapshot = await getDocs(q);
    const promises = querySnapshot.docs.map(d => updateDoc(doc(db, NOTIFICATIONS_COLLECTION, d.id), { isRead: true }));
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return { success: false };
  }
};
