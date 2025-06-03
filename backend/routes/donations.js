const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, query, where, orderBy } = require('firebase/firestore');

// Get all donations
router.get('/', auth, async (req, res) => {
  try {
    const donationsRef = collection(db, 'donations');
    const q = query(donationsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const donations = [];
    querySnapshot.forEach((doc) => {
      donations.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(donations);
  } catch (error) {
    console.error('Error getting donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Add new donation
router.post('/', auth, async (req, res) => {
  try {
    const { amount, message, isAnonymous = false } = req.body;
    const userId = req.user.uid;
    
    const donationData = {
      userId,
      amount,
      message,
      isAnonymous,
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'donations'), donationData);
    res.status(201).json({ id: docRef.id, ...donationData });
  } catch (error) {
    console.error('Error adding donation:', error);
    res.status(500).json({ error: 'Failed to add donation' });
  }
});

// Get user's donations
router.get('/user', auth, async (req, res) => {
  try {
    const donationsRef = collection(db, 'donations');
    const q = query(
      donationsRef,
      where('userId', '==', req.user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const donations = [];
    querySnapshot.forEach((doc) => {
      donations.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(donations);
  } catch (error) {
    console.error('Error getting user donations:', error);
    res.status(500).json({ error: 'Failed to fetch user donations' });
  }
});

module.exports = router; 