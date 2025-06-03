import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Settings = () => {
  const { currentUser, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    isAnonymousDonation: false,
    emailNotifications: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setFormData(prev => ({
            ...prev,
            ...data
          }));
        } else {
          // Create default settings if they don't exist
          await setDoc(doc(db, 'userSettings', currentUser.uid), {
            isAnonymousDonation: false,
            emailNotifications: true
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      }
    };

    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSettingChange = async (setting) => {
    try {
      setLoading(true);
      setError('');
      
      const newValue = !formData[setting];
      const newSettings = {
        ...formData,
        [setting]: newValue
      };

      await setDoc(doc(db, 'userSettings', currentUser.uid), {
        isAnonymousDonation: newSettings.isAnonymousDonation,
        emailNotifications: newSettings.emailNotifications
      }, { merge: true });

      setFormData(newSettings);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile({
          displayName: formData.displayName
        });
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Profile Information
          </Typography>
          
          <TextField
            fullWidth
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            disabled
            margin="normal"
            helperText="Email cannot be changed"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Notification Settings
          </Typography>

          <Box sx={{ ml: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                  name="emailNotifications"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Email Notifications"
            />
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Privacy Settings
          </Typography>

          <Box sx={{ ml: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAnonymousDonation}
                  onChange={() => handleSettingChange('isAnonymousDonation')}
                  name="isAnonymousDonation"
                  color="primary"
                  disabled={loading}
                />
              }
              label="Make donations anonymous by default"
            />
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Display Settings
          </Typography>

          <Box sx={{ ml: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  name="darkMode"
                  color="primary"
                />
              }
              label="Dark Mode"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Settings; 