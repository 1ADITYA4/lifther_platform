import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjtI-kB4nrJIzT8e3bZzxK1945hNdH9xI",
  authDomain: "maakagullak.firebaseapp.com",
  projectId: "maakagullak",
  storageBucket: "maakagullak.firebasestorage.app",
  messagingSenderId: "374017357643",  // Replace with your messagingSenderId
  appId: "1:374017357643:web:a94af9c3e48f45758c5ace"  // Replace with your appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app; 