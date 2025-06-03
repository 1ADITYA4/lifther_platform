import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);

  async function loadUserProfile(user) {
    try {
      if (!user) {
        setUserProfile(null);
        setUserRole(null);
        return;
      }

      // Get user settings and role
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      const settings = settingsDoc.exists() ? settingsDoc.data() : {};
      
      // Get user role
      const userRoleDoc = await getDoc(doc(db, 'userRoles', user.uid));
      const role = userRoleDoc.exists() ? userRoleDoc.data().role : 'donor';
      setUserRole(role);

      // Get user donations if donor
      const donationsDoc = await getDoc(doc(db, 'userDonations', user.uid));
      const donations = donationsDoc.exists() ? donationsDoc.data() : { total: 0, recent: [] };

      // Get recipient data if recipient
      let recipientData = null;
      if (role === 'recipient') {
        const recipientDoc = await getDoc(doc(db, 'recipients', user.uid));
        if (recipientDoc.exists()) {
          recipientData = recipientDoc.data();
        }
      }

      // Get user stories
      const storiesDoc = await getDoc(doc(db, 'stories', user.uid));
      const stories = storiesDoc.exists() ? storiesDoc.data() : { total: 0, recent: [] };

      setUserProfile({
        settings,
        role,
        donations: role === 'donor' ? donations : null,
        recipientData,
        stories,
        joinedDate: user.metadata.creationTime
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create default profile if it doesn't exist
      const defaultProfile = {
        settings: {
          isAnonymousDonation: false,
          emailNotifications: true
        },
        role: 'donor',
        donations: { total: 0, recent: [] },
        recipientData: null,
        stories: { total: 0, recent: [] },
        joinedDate: user.metadata.creationTime
      };

      try {
        await setDoc(doc(db, 'userSettings', user.uid), defaultProfile.settings);
        await setDoc(doc(db, 'userRoles', user.uid), { role: 'donor' });
        setUserProfile(defaultProfile);
        setUserRole('donor');
      } catch (err) {
        console.error('Error creating default profile:', err);
      }
    }
  }

  async function signup(email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await loadUserProfile(result.user);
    return result;
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(result.user);
    return result;
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await loadUserProfile(result.user);
    return result;
  }

  async function updateProfile(profile) {
    await firebaseUpdateProfile(auth.currentUser, profile);
    await loadUserProfile(auth.currentUser);
  }

  async function registerAsRecipient(userData) {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Check if user is already a recipient
      const userRoleDoc = await getDoc(doc(db, 'userRoles', currentUser.uid));
      if (userRoleDoc.exists() && userRoleDoc.data().role === 'recipient') {
        throw new Error('You are already registered as a recipient');
      }

      // Validate required fields
      const requiredFields = ['fullName', 'phoneNumber', 'story', 'bankAccount', 'ifscCode'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }
      
      // Update user role
      await setDoc(doc(db, 'userRoles', currentUser.uid), { 
        role: 'recipient',
        updatedAt: new Date().toISOString()
      });
      
      // Create recipient profile
      await setDoc(doc(db, 'recipients', currentUser.uid), {
        ...userData,
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalReceived: 0,
        campaignGoal: Number(userData.campaignGoal) || 0,
        isVerified: false,
        kycStatus: 'pending',
        userId: currentUser.uid,
        email: currentUser.email
      });

      // Reload user profile
      await loadUserProfile(currentUser);
    } catch (error) {
      console.error('Error registering as recipient:', error);
      throw new Error(error.message || 'Failed to register as recipient');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await loadUserProfile(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    userRole,
    signup,
    login,
    logout,
    googleSignIn,
    updateProfile,
    loadUserProfile,
    registerAsRecipient
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 