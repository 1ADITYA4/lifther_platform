import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const Donate = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isAnonymous' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const donationData = {
        userId: currentUser.uid,
        userName: formData.isAnonymous ? 'Anonymous' : currentUser.displayName || currentUser.email,
        amount: parseFloat(formData.amount),
        message: formData.message,
        isAnonymous: formData.isAnonymous,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'donations'), donationData);
      setSuccess(true);
      setOpenDialog(true);
      setFormData({
        amount: '',
        message: '',
        isAnonymous: false
      });
    } catch (err) {
      console.error('Error making donation:', err);
      setError('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Make a Donation
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Your support helps single mothers in need. Every contribution makes a difference.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
            InputProps={{
              inputProps: { min: 1 }
            }}
          />

          <TextField
            fullWidth
            label="Message (Optional)"
            name="message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
            margin="normal"
            placeholder="Share a message of support..."
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isAnonymous}
                onChange={handleChange}
                name="isAnonymous"
              />
            }
            label="Make this donation anonymous"
            sx={{ mt: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Thank You!</DialogTitle>
        <DialogContent>
          <Typography>
            Your donation has been processed successfully. Your support means a lot to our community.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Donate; 