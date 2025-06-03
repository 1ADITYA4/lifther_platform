import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Divider
} from '@mui/material';
import {
  Person as ProfileIcon,
  History as HistoryIcon,
  Email as MessageIcon,
  Settings as SettingsIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ open, onClose, user }) => {
  const navigate = useNavigate();

  const menuItems = user ? [
    { text: 'My Profile', icon: <ProfileIcon />, path: '/profile' },
    { text: 'Donation History', icon: <HistoryIcon />, path: '/profile/donations' },
    { text: 'Messages', icon: <MessageIcon />, path: '/profile/messages' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/profile/settings' }
  ] : [
    { text: 'Login / Sign Up', icon: <LoginIcon />, path: '/login' }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      className="sidebar-drawer"
    >
      <Box className="sidebar-content">
        {user ? (
          <Box className="sidebar-header">
            <Avatar
              src={user.photoURL}
              alt={user.displayName}
              sx={{ width: 80, height: 80 }}
            >
              {user.displayName?.[0] || user.email?.[0]}
            </Avatar>
            <Box mt={2}>
              <Typography variant="h6">{user.displayName || 'User'}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box className="sidebar-header">
            <Avatar sx={{ width: 80, height: 80 }}>
              <ProfileIcon />
            </Avatar>
            <Box mt={2}>
              <Typography variant="h6">Welcome</Typography>
              <Typography variant="body2" color="textSecondary">
                Please login to continue
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 