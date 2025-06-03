import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  History,
  Mail,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleClose();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar position="sticky" className="navbar">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          className="logo"
          sx={{ textDecoration: 'none', flexGrow: 1 }}
        >
          Maa Ka Gullak
        </Typography>

        <Box className="nav-links">
          <Button color="inherit" component={Link} to="/stories">
            Stories
          </Button>
          <Button color="inherit" component={Link} to="/community">
            Community
          </Button>
          {currentUser && (
            <Button color="inherit" component={Link} to="/donate">
              Donate
            </Button>
          )}
        </Box>

        {currentUser ? (
          <div>
            <IconButton
              className="profile-button"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: 'secondary.main',
                }}
              >
                {currentUser.displayName?.[0] || currentUser.email?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 200,
                  maxWidth: '100%',
                  background: '#fff',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => handleMenuClick('/profile')}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={() => handleMenuClick('/profile/donations')}>
                <ListItemIcon>
                  <History fontSize="small" />
                </ListItemIcon>
                <ListItemText>Donation History</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => handleMenuClick('/profile/messages')}>
                <ListItemIcon>
                  <Mail fontSize="small" />
                </ListItemIcon>
                <ListItemText>Messages</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => handleMenuClick('/profile/settings')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>

              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <Button
            color="inherit"
            component={Link}
            to="/login"
            sx={{
              ml: 2,
              border: '1px solid white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 