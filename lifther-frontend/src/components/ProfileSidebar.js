import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfileSidebar = ({ open, onClose, user }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      text: 'My Profile',
      icon: <PersonIcon />,
      onClick: () => {
        navigate('/profile');
        onClose();
      }
    },
    {
      text: 'Donation History',
      icon: <HistoryIcon />,
      onClick: () => {
        navigate('/donation-history');
        onClose();
      }
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => {
        navigate('/settings');
        onClose();
      }
    },
    {
      text: 'Logout',
      icon: <LogoutIcon />,
      onClick: () => {
        // Add logout logic here
        onClose();
      }
    }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <List sx={{ width: 250 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem button onClick={item.onClick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default ProfileSidebar; 