import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchActiveUPIIDs = async () => {
  try {
    const upiRef = collection(db, 'adminSettings');
    const upiDoc = await getDocs(query(
      upiRef,
      where('type', '==', 'upi'),
      where('active', '==', true),
      orderBy('priority'),
      limit(5)
    ));

    const upiList = [];
    upiDoc.forEach(doc => {
      const data = doc.data();
      upiList.push({
        id: doc.id,
        upiId: data.upiId,
        name: data.name,
        description: data.description || '',
        priority: data.priority
      });
    });

    return upiList;
  } catch (error) {
    console.error('Error fetching UPI IDs:', error);
    return [];
  }
};

export const verifyPaymentStatus = async (orderId) => {
  try {
    const response = await fetch(`/api/verify-payment/${orderId}`);
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}; 