import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, updateDoc, doc, arrayUnion, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {QRCodeCanvas} from 'qrcode.react';
import SvgIcon from '@mui/material/SvgIcon';

// SVG Icons as React components
const PhonePeIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 c0-4.41,3.59-8,8-8s8,3.59,8,8C20,16.41,16.41,20,12,20z M15.5,11c0.83,0,1.5-0.67,1.5-1.5S16.33,8,15.5,8S14,8.67,14,9.5 S14.67,11,15.5,11z M8.5,11C9.33,11,10,10.33,10,9.5S9.33,8,8.5,8S7,8.67,7,9.5S7.67,11,8.5,11z M12,17.5c2.33,0,4.31-1.46,5.11-3.5 H6.89C7.69,16.04,9.67,17.5,12,17.5z" fill="#5f259f"/>
  </SvgIcon>
);

const GooglePayIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 c0-4.41,3.59-8,8-8s8,3.59,8,8C20,16.41,16.41,20,12,20z M9.5,14.5l2.5-2.5l2.5,2.5l1.5-1.5L12,9L8,13L9.5,14.5z" fill="#4285f4"/>
  </SvgIcon>
);

const PaytmIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 c0-4.41,3.59-8,8-8s8,3.59,8,8C20,16.41,16.41,20,12,20z M11,7h2v6h-2V7z M11,15h2v2h-2V15z" fill="#00b9f5"/>
  </SvgIcon>
);

const UPI_ID = "9335837383@ybl"; // Your UPI ID

// Payment method configurations
const PAYMENT_METHODS = {
  phonepe: {
    name: 'PhonePe',
    upiApp: 'phonepe',
    deepLink: (amount, orderId) => 
      `phonepe://pay?pa=${UPI_ID}&pn=Maa Ka Gullak&am=${amount}&tn=${orderId}&cu=INR`,
    webLink: `https://phon.pe/ru_${UPI_ID}`,
    color: '#5f259f'
  },
  googlepay: {
    name: 'Google Pay',
    upiApp: 'gpay',
    deepLink: (amount, orderId) =>
      `tez://upi/pay?pa=${UPI_ID}&pn=Maa Ka Gullak&am=${amount}&tn=${orderId}&cu=INR`,
    webLink: 'upi://pay',
    color: '#4285f4'
  },
  paytm: {
    name: 'Paytm',
    upiApp: 'paytm',
    deepLink: (amount, orderId) =>
      `paytmmp://pay?pa=${UPI_ID}&pn=Maa Ka Gullak&am=${amount}&tn=${orderId}&cu=INR`,
    webLink: 'upi://pay',
    color: '#00b9f5'
  }
};

const PaymentMethodCard = ({ method, onClick, isSelected }) => (
  <Card 
    onClick={onClick}
    sx={{ 
      cursor: 'pointer', 
      '&:hover': { transform: 'scale(1.02)' },
      border: `2px solid ${method.color}`,
      borderRadius: 2,
      backgroundColor: isSelected ? `${method.color}15` : 'transparent'
    }}
  >
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      {method.name === 'PhonePe' && <PhonePeIcon sx={{ color: method.color }} />}
      {method.name === 'Google Pay' && <GooglePayIcon sx={{ color: method.color }} />}
      {method.name === 'Paytm' && <PaytmIcon sx={{ color: method.color }} />}
      <Typography 
        variant="h6" 
        sx={{ color: method.color, fontWeight: 'bold' }}
      >
        {method.name}
      </Typography>
    </Box>
  </Card>
);

const Donate = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [recipientUPI, setRecipientUPI] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    isAnonymous: false
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/donate' } });
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const validateAmount = (amount) => {
    const numAmount = Number(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= 100000;
  };

  const validateUPI = (upi) => {
    // Basic UPI ID validation - allowing alphanumeric, dots and hyphens
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upi);
  };

  const generateOrderId = () => {
    return `MGK${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !validateAmount(formData.amount)) {
      setError('Please enter a valid amount between ₹1 and ₹100,000');
      return;
    }

    if (!recipientUPI || !validateUPI(recipientUPI)) {
      setError('Please enter a valid UPI ID');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentDialogOpen(true);
    setLoading(false);
  };

  const handlePaymentApp = async (app) => {
    try {
      setSelectedApp(app);
      const orderId = generateOrderId();
      
      // Create donation record
      const donationData = {
        amount: Number(formData.amount),
        message: formData.message,
        isAnonymous: formData.isAnonymous,
        donorId: currentUser?.uid,
        donorName: formData.isAnonymous ? 'Anonymous' : (currentUser?.displayName || 'Anonymous'),
        timestamp: new Date().toISOString(),
        status: 'pending',
        paymentMethod: app,
        orderId,
        recipientUPI: recipientUPI,
        recipientName: recipientUPI
      };

      const docRef = await addDoc(collection(db, 'donations'), donationData);

      // Generate payment link
      const paymentLink = generatePaymentLink(app, recipientUPI, formData.amount, orderId);

      // Function to handle mobile app opening
      const openMobileApp = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        window.location.href = paymentLink;

        setTimeout(() => {
          document.body.removeChild(iframe);
          setShowQRCode(true);
          updateQRCode(recipientUPI, formData.amount, orderId);
        }, 2500);
      };

      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        openMobileApp();
      } else {
        setShowQRCode(true);
        updateQRCode(recipientUPI, formData.amount, orderId);
      }

      // Start payment verification
      startPaymentVerification(docRef.id, orderId);

      // Update user's donation history
      if (currentUser) {
        await updateDonationHistory(currentUser.uid, docRef.id, formData.amount, orderId);
      }
    } catch (err) {
      console.error('Error processing donation:', err);
      setError('Failed to process donation. Please try again.');
    }
  };

  const generatePaymentLink = (app, upiId, amount, orderId) => {
    const baseParams = {
      pa: upiId,
      pn: recipientUPI,
      tn: `Donation-${orderId}`,
      am: amount,
      cu: 'INR'
    };

    const paramString = Object.entries(baseParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${PAYMENT_METHODS[app].deepLink}?${paramString}`;
  };

  const updateQRCode = (upiId, amount, orderId) => {
    const qrElement = document.getElementById('payment-qr');
    if (qrElement) {
      const qrValue = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(recipientUPI)}&am=${amount}&tn=Donation-${orderId}&cu=INR`;
      qrElement.value = qrValue;
    }
  };

  const updateDonationHistory = async (userId, donationId, amount, orderId) => {
    try {
      const userDonationsRef = doc(db, 'userDonations', userId);
      const userDonationsDoc = await getDoc(userDonationsRef);

      const donationUpdate = {
        id: donationId,
        amount: Number(amount),
        timestamp: new Date().toISOString(),
        orderId,
        recipientUPI: recipientUPI
      };

      if (userDonationsDoc.exists()) {
        await updateDoc(userDonationsRef, {
          total: increment(Number(amount)),
          recent: arrayUnion(donationUpdate)
        });
      } else {
        await setDoc(userDonationsRef, {
          total: Number(amount),
          recent: [donationUpdate]
        });
      }
    } catch (error) {
      console.error('Error updating donation history:', error);
    }
  };

  const startPaymentVerification = async (donationId, orderId) => {
    try {
      // Check payment status every 5 seconds for 2 minutes
      let attempts = 0;
      const maxAttempts = 24; // 2 minutes

      const checkStatus = async () => {
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          return;
        }

        const donationRef = doc(db, 'donations', donationId);
        const donationDoc = await getDoc(donationRef);

        if (donationDoc.exists() && donationDoc.data().status === 'completed') {
          clearInterval(intervalId);
          setSuccess('Thank you for your donation!');
          setPaymentDialogOpen(false);
        }

        attempts++;
      };

      const intervalId = setInterval(checkStatus, 5000);

      // Cleanup on component unmount
      return () => clearInterval(intervalId);
    } catch (err) {
      console.error('Error verifying payment:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Support Single Mothers
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Your contribution helps empower single mothers and their children
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 1, max: 100000 }}
            helperText="Enter amount between ₹1 and ₹100,000"
          />

          <TextField
            fullWidth
            label="Message (Optional)"
            name="message"
            multiline
            rows={3}
            value={formData.message}
            onChange={handleChange}
            margin="normal"
            placeholder="Share a message of support..."
          />

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  name="isAnonymous"
                  color="primary"
                />
              }
              label="Make this donation anonymous"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enter Recipient UPI ID
            </Typography>
            <TextField
              fullWidth
              label="UPI ID"
              value={recipientUPI}
              onChange={(e) => setRecipientUPI(e.target.value)}
              margin="normal"
              required
              placeholder="example@upi"
              helperText="Enter a valid UPI ID (e.g., name@bank)"
              error={recipientUPI && !validateUPI(recipientUPI)}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your donation will be processed securely through UPI. Choose your preferred payment method.
          </Typography>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5e69 30%, #b16cea 90%)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Donate Now'}
          </Button>
        </form>
      </Paper>

      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Choose Payment Method</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <Grid item xs={12} md={4} key={key}>
                <PaymentMethodCard 
                  method={method} 
                  onClick={() => handlePaymentApp(key)} 
                  isSelected={selectedApp === key}
                />
              </Grid>
            ))}
          </Grid>

          {showQRCode && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>Scan QR code to pay</Typography>
              <QRCodeCanvas 
                id="payment-qr"
                value={`upi://pay?pa=${recipientUPI}&pn=Donation&am=${formData.amount}&cu=INR`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Or pay directly to UPI ID: {recipientUPI}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Donate; 