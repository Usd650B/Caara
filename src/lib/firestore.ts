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
import { db } from './firebase';

// Products collection
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

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
  try {
    console.log('Adding product to Firestore:', product);
    
    const productData = {
      ...product,
      createdAt: Timestamp.now(),
      status: product.status || 'active'
    };
    
    console.log('Product data to save:', productData);
    
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    console.log('Product added successfully with ID:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding product:', error);
    console.error('Error details:', (error as Error).message);
    
    // Check if it's a permissions error
    if ((error as any).code === 'permission-denied') {
      console.error('Permission denied - check Firebase rules');
      return { success: false, error: 'Permission denied - check Firebase rules' };
    }
    
    return { success: false, error: 'Failed to add product' };
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Firestore...');
    console.log('Database instance:', db);
    
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    console.log('Query created:', q);
    
    const querySnapshot = await getDocs(q);
    console.log('Query snapshot received:', querySnapshot);
    
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Product data:', data);
      return {
        id: doc.id,
        ...data
      } as Product;
    });
    
    console.log('Products fetched:', products);
    console.log('Number of products:', products.length);
    
    // If no products found, return empty array (no mock data)
    if (products.length === 0) {
      console.log('No products found in Firestore');
    }
    
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    console.error('Error details:', (error as Error).message);
    console.error('Error code:', (error as any).code);
    
    // Check if it's a permissions error
    if ((error as any).code === 'permission-denied') {
      console.error('Permission denied - check Firebase rules');
    }
    
    // Return empty array instead of mock data
    return [];
  }
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  try {
    console.log('Updating product with ID:', id);
    console.log('Product data to update:', product);
    
    const productData = {
      ...product,
      updatedAt: Timestamp.now()
    };
    
    console.log('Final product data for Firestore:', productData);
    
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), productData);
    console.log('Product updated successfully in Firestore');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Error details:', (error as Error).message);
    console.error('Error code:', (error as any).code);
    
    // Check if it's a permissions error
    if ((error as any).code === 'permission-denied') {
      console.error('Permission denied - check Firebase rules');
      return { success: false, error: 'Permission denied - check Firebase rules' };
    }
    
    return { success: false, error: (error as Error).message || 'Failed to update product' };
  }
};

export const deleteProduct = async (id: string) => {
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
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
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
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, id), {
      ...order,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Failed to update order' };
  }
};
