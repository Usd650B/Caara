import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getDb } from './firebase';

export const clearAllProducts = async () => {
  const db = getDb();
  if (!db) return { success: false, error: 'Firestore not available' };
  
  try {
    const productsCollection = collection(db, 'products');
    const querySnapshot = await getDocs(productsCollection);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error('Error clearing products:', error);
    return { success: false, error: 'Failed to clear products' };
  }
};
