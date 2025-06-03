import { collection, addDoc } from 'firebase/firestore';
import { db } from './index';

// Initial UPI IDs setup
const initialUPIs = [
  {
    type: 'upi',
    upiId: '9335837383@ybl',
    name: 'Main Donation Account',
    description: 'Primary donation collection account',
    active: true,
    priority: 1
  },
  {
    type: 'upi',
    upiId: 'maakagullak@upi',
    name: 'NGO Account',
    description: 'Official NGO donation account',
    active: true,
    priority: 2
  }
];

export const setupAdminSettings = async () => {
  try {
    const adminSettingsRef = collection(db, 'adminSettings');
    
    // Add initial UPI IDs
    for (const upi of initialUPIs) {
      await addDoc(adminSettingsRef, {
        ...upi,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Admin settings initialized successfully');
  } catch (error) {
    console.error('Error setting up admin settings:', error);
  }
}; 