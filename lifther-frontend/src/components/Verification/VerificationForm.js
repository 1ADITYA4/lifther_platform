import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { storage, db } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const DOCUMENT_TYPES = {
  aadhar: 'Aadhar Card',
  pan: 'PAN Card',
  voter_id: 'Voter ID',
  driving_license: 'Driving License'
};

const VerificationForm = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      phone: ''
    },
    documents: {
      type: 'aadhar',
      documentNumber: '',
      frontImage: null,
      backImage: null,
      selfieWithDocument: null
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: ''
    }
  });

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (currentUser) {
        const verificationDoc = await getDoc(doc(db, 'verifications', currentUser.uid));
        if (verificationDoc.exists()) {
          setVerificationStatus(verificationDoc.data());
        }
      }
    };
    checkVerificationStatus();
  }, [currentUser]);

  const handleFileChange = (field) => (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: file
        }
      }));
    }
  };

  const handleInputChange = (section) => (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const uploadDocument = async (file, type, isFrontImage = true) => {
    if (!file) return null;
    const fileExtension = file.name.split('.').pop();
    const fileName = `verification/${currentUser.uid}/${type}_${isFrontImage ? 'front' : 'back'}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const validateForm = () => {
    // Personal Info validation
    if (!formData.personalInfo.fullName || !formData.personalInfo.dateOfBirth || 
        !formData.personalInfo.address || !formData.personalInfo.phone) {
      throw new Error('Please fill all personal information fields');
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.personalInfo.phone)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }

    // Document validation
    if (!formData.documents.documentNumber || !formData.documents.frontImage) {
      throw new Error('Please upload required document images and provide document number');
    }

    // Bank details validation
    if (!formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode || 
        !formData.bankDetails.bankName || !formData.bankDetails.accountHolderName) {
      throw new Error('Please fill all bank details');
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.bankDetails.ifscCode)) {
      throw new Error('Please enter a valid IFSC code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      // Validate form
      validateForm();

      // Upload documents
      const frontImageUrl = await uploadDocument(
        formData.documents.frontImage,
        formData.documents.type,
        true
      );

      const backImageUrl = formData.documents.backImage 
        ? await uploadDocument(formData.documents.backImage, formData.documents.type, false)
        : null;

      const selfieUrl = formData.documents.selfieWithDocument
        ? await uploadDocument(formData.documents.selfieWithDocument, 'selfie')
        : null;

      // Create verification document
      const verificationData = {
        userId: currentUser.uid,
        status: 'pending',
        personalInfo: formData.personalInfo,
        documents: [{
          type: formData.documents.type,
          documentNumber: formData.documents.documentNumber,
          frontImageUrl,
          backImageUrl,
          selfieWithDocument: selfieUrl,
          status: 'pending',
          uploadedAt: new Date().toISOString()
        }],
        bankDetails: {
          ...formData.bankDetails,
          verified: false
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await setDoc(doc(db, 'verifications', currentUser.uid), verificationData);
      
      // Update user role to indicate verification in progress
      await updateDoc(doc(db, 'userRoles', currentUser.uid), {
        verificationStatus: 'pending'
      });

      setSuccess(true);
    } catch (err) {
      console.error('Verification submission error:', err);
      setError(err.message || 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationStatus?.status === 'verified') {
    return (
      <Container maxWidth="sm">
        <Alert severity="success">
          Your account is verified! You can now receive donations.
        </Alert>
      </Container>
    );
  }

  if (verificationStatus?.status === 'pending' || verificationStatus?.status === 'in_review') {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">
          Your verification is {verificationStatus.status}. We'll notify you once it's reviewed.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Account Verification
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Verification submitted successfully! We'll review your documents and notify you.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.personalInfo.fullName}
                    onChange={handleInputChange('personalInfo')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleInputChange('personalInfo')}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={3}
                    value={formData.personalInfo.address}
                    onChange={handleInputChange('personalInfo')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.personalInfo.phone}
                    onChange={handleInputChange('personalInfo')}
                    required
                    helperText="Enter 10-digit mobile number"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Document Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Identity Verification</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      value={formData.documents.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        documents: {
                          ...prev.documents,
                          type: e.target.value
                        }
                      }))}
                    >
                      {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Document Number"
                    name="documentNumber"
                    value={formData.documents.documentNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      documents: {
                        ...prev.documents,
                        documentNumber: e.target.value
                      }
                    }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                  >
                    Upload Front Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange('frontImage')}
                    />
                  </Button>
                  {formData.documents.frontImage && (
                    <FormHelperText>
                      Selected: {formData.documents.frontImage.name}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                  >
                    Upload Back Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange('backImage')}
                    />
                  </Button>
                  {formData.documents.backImage && (
                    <FormHelperText>
                      Selected: {formData.documents.backImage.name}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                  >
                    Upload Selfie with Document
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange('selfieWithDocument')}
                    />
                  </Button>
                  {formData.documents.selfieWithDocument && (
                    <FormHelperText>
                      Selected: {formData.documents.selfieWithDocument.name}
                    </FormHelperText>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Bank Account Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleInputChange('bankDetails')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    name="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleInputChange('bankDetails')}
                    required
                    helperText="Example: SBIN0123456"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleInputChange('bankDetails')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={handleInputChange('bankDetails')}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                minWidth: 200,
                background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
                color: 'white'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Verification'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default VerificationForm; 