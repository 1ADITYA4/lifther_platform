import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Star as StarIcon,
  People as PeopleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import DonationHistory from '../DonationHistory';
import './ProfilePage.css';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);

  // Dummy data - replace with actual data from backend
  const stats = {
    goodwillPoints: 150,
    totalDonations: 5,
    livesImpacted: 3
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container className="profile-page-container">
      <Paper elevation={3} className="profile-header">
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName}
              sx={{ width: 100, height: 100 }}
            >
              {user?.displayName?.[0] || user?.email?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4">{user?.displayName || 'User'}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user?.email}
            </Typography>
            <Box mt={2}>
              <Chip
                icon={<StarIcon />}
                label={`${stats.goodwillPoints} Goodwill Points`}
                color="primary"
                className="profile-chip"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} className="profile-stats">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Donations
              </Typography>
              <Box display="flex" alignItems="center">
                <HeartIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h4">{stats.totalDonations}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lives Impacted
              </Typography>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4">{stats.livesImpacted}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Goodwill Points
              </Typography>
              <Box display="flex" alignItems="center">
                <StarIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h4">{stats.goodwillPoints}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<HistoryIcon />} label="Donation History" />
            <Tab label="Recent Activity" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <DonationHistory user={user} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" color="textSecondary">
            Recent Activity Coming Soon...
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" color="textSecondary">
            Settings Coming Soon...
          </Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 