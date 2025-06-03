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
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const RecipientRegistration = () => {
  const navigate = useNavigate();
  const { registerAsRecipient, userRole, currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    story: '',
    campaignGoal: '',
    bankAccount: '',
    ifscCode: '',
    acceptedTerms: false
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/recipient-registration' } });
    }
  }, [currentUser, navigate]);

  const steps = ['Personal Information', 'Your Story', 'Bank Details'];

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return !!(formData.fullName && formData.phoneNumber && formData.address && 
                 formData.city && formData.state && formData.pincode);
      case 1:
        return !!(formData.story && formData.campaignGoal);
      case 2:
        return !!(formData.bankAccount && formData.ifscCode && formData.acceptedTerms);
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('Please login to register as recipient');
      }
      
      if (!formData.fullName || !formData.phoneNumber || !formData.story || !formData.bankAccount) {
        throw new Error('Please fill all required fields');
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      if (Number(formData.campaignGoal) < 1000) {
        throw new Error('Campaign goal must be at least ₹1,000');
      }

      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.ifscCode)) {
        throw new Error('Please enter a valid IFSC code');
      }
      
      await registerAsRecipient(formData);
      navigate('/verify');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register as recipient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PIN Code"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Story"
                name="story"
                multiline
                rows={6}
                value={formData.story}
                onChange={handleChange}
                required
                helperText="Share your story and why you need support"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Goal (₹)"
                name="campaignGoal"
                type="number"
                value={formData.campaignGoal}
                onChange={handleChange}
                required
                inputProps={{ min: 1000 }}
                helperText="Minimum ₹1,000"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Account Number"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                    name="acceptedTerms"
                    color="primary"
                  />
                }
                label="I agree to the terms and conditions and verify that all information provided is true"
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (userRole === 'recipient') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="info">
          You are already registered as a recipient. View your profile to check your status.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Register as Recipient
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Share your story and receive support from our community
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {renderStep(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !validateStep(activeStep)}
                sx={{
                  background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
                  color: 'white'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateStep(activeStep)}
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
                  color: 'white'
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default RecipientRegistration; 