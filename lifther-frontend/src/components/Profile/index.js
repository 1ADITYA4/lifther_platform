import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    totalDonations: 0,
    storiesShared: 0,
    joinedDate: '',
    recentDonations: [],
    recentStories: []
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user settings
        const userDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Fetch donations
        const donationsDoc = await getDoc(doc(db, 'donations', currentUser.uid));
        const donationsData = donationsDoc.exists() ? donationsDoc.data() : { total: 0, recent: [] };

        // Fetch stories
        const storiesDoc = await getDoc(doc(db, 'stories', currentUser.uid));
        const storiesData = storiesDoc.exists() ? storiesDoc.data() : { total: 0, recent: [] };

        setProfileData({
          ...userData,
          totalDonations: donationsData.total || 0,
          recentDonations: donationsData.recent || [],
          storiesShared: storiesData.total || 0,
          recentStories: storiesData.recent || [],
          joinedDate: currentUser.metadata.creationTime
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Profile Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={currentUser.photoURL}
            alt={currentUser.displayName}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" gutterBottom>
              {currentUser.displayName || 'Anonymous User'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Member since {new Date(profileData.joinedDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Donations
                </Typography>
                <Typography variant="h4">₹{profileData.totalDonations}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stories Shared
                </Typography>
                <Typography variant="h4">{profileData.storiesShared}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Impact Score
                </Typography>
                <Typography variant="h4">
                  {Math.floor(profileData.totalDonations / 100 + profileData.storiesShared * 10)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/donate')}
            sx={{
              background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
              color: 'white',
            }}
          >
            Make a Donation
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/stories/create')}
            sx={{
              background: 'linear-gradient(45deg, #ff5e69 30%, #b16cea 90%)',
              color: 'white',
            }}
          >
            Share Your Story
          </Button>
        </Box>

        {/* Recent Activity */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Recent Activity
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Donations
                </Typography>
                {profileData.recentDonations.length > 0 ? (
                  profileData.recentDonations.map((donation, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body1">₹{donation.amount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(donation.timestamp).toLocaleDateString()}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent donations
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Stories
                </Typography>
                {profileData.recentStories.length > 0 ? (
                  profileData.recentStories.map((story, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body1">{story.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(story.timestamp).toLocaleDateString()}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No stories shared yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 