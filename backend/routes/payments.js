const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { db } = require('../config/firebase');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, donationId } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: donationId,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    // Update donation with order details
    await db.collection('donations').doc(donationId).update({
      orderId: order.id,
      paymentStatus: 'created'
    });

    res.json({
      orderId: order.id,
      amount: amount * 100,
      currency: 'INR',
      paymentUrl: `${process.env.FRONTEND_URL}/payment?orderId=${order.id}&donationId=${donationId}`
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId
    } = req.body;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Update donation status
      await db.collection('donations').doc(donationId).update({
        paymentId: razorpay_payment_id,
        paymentStatus: 'completed',
        verifiedAt: new Date().toISOString()
      });

      res.json({ success: true });
    } else {
      throw new Error('Invalid signature');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(400).json({ error: 'Payment verification failed' });
  }
});

// Get payment status
router.get('/payment-status/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await db.collection('donations').doc(donationId).get();

    if (!donation.exists) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({
      status: donation.data().paymentStatus,
      orderId: donation.data().orderId,
      paymentId: donation.data().paymentId
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

module.exports = router; 