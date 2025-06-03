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
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentType } from '../../types/verification';
import * as verificationService from '../../services/verificationService';

const VerificationForm = () => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      phone: ''
    },
    documents: {
      type: 'aadhar' as DocumentType,
      documentNumber: '',
      frontImage: null as File | null,
      backImage: null as File | null,
      selfieWithDocument: null as File | null
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
        const status = await verificationService.getVerificationStatus(currentUser.uid);
        setVerificationStatus(status);
      }
    };
    checkVerificationStatus();
  }, [currentUser]);

  const handleFileChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleInputChange = (section: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      // Upload documents
      const frontImageUrl = await verificationService.uploadVerificationDocument(
        currentUser.uid,
        formData.documents.frontImage!,
        formData.documents.type,
        true
      );

      const backImageUrl = formData.documents.backImage 
        ? await verificationService.uploadVerificationDocument(
            currentUser.uid,
            formData.documents.backImage,
            formData.documents.type,
            false
          )
        : undefined;

      const selfieUrl = formData.documents.selfieWithDocument
        ? await verificationService.uploadVerificationDocument(
            currentUser.uid,
            formData.documents.selfieWithDocument,
            formData.documents.type,
            false
          )
        : undefined;

      // Submit verification
      await verificationService.submitVerification(
        currentUser.uid,
        [{
          type: formData.documents.type,
          documentNumber: formData.documents.documentNumber,
          frontImageUrl,
          backImageUrl,
          selfieWithDocument: selfieUrl
        }],
        formData.personalInfo,
        formData.bankDetails
      );

      setSuccess(true);
    } catch (err) {
      console.error('Verification submission error:', err);
      setError('Failed to submit verification. Please try again.');
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
                          type: e.target.value as DocumentType
                        }
                      }))}
                    >
                      <MenuItem value="aadhar">Aadhar Card</MenuItem>
                      <MenuItem value="pan">PAN Card</MenuItem>
                      <MenuItem value="voter_id">Voter ID</MenuItem>
                      <MenuItem value="driving_license">Driving License</MenuItem>
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