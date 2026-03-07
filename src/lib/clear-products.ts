import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const clearAllProducts = async () => {
  try {
    console.log('Clearing all products from Firestore...');
    const productsCollection = collection(db, 'products');
    const querySnapshot = await getDocs(productsCollection);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log('All products cleared successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error clearing products:', error);
    return { success: false, error: 'Failed to clear products' };
  }
};
