import React from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box
} from '@mui/material';
import { Mail as MailIcon } from '@mui/icons-material';

// Dummy data - replace with actual messages from backend
const dummyMessages = [
  {
    id: 1,
    sender: "Priya Sharma",
    message: "Thank you so much for your generous donation. It will help my daughter's education.",
    date: "2024-03-15T10:30:00",
    read: false
  },
  {
    id: 2,
    sender: "Meera Patel",
    message: "Your support means the world to us. Now I can afford better healthcare for my son.",
    date: "2024-03-14T15:45:00",
    read: true
  },
  // Add more dummy messages as needed
];

const Messages = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Messages of gratitude from mothers you've supported
        </Typography>

        <List>
          {dummyMessages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  bgcolor: message.read ? 'transparent' : 'rgba(177, 108, 234, 0.1)',
                  borderRadius: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: message.read ? 'grey.400' : '#b16cea' }}>
                    <MailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography
                        component="span"
                        variant="subtitle1"
                        color="text.primary"
                        sx={{ fontWeight: message.read ? 400 : 600 }}
                      >
                        {message.sender}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {new Date(message.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.primary"
                      sx={{
                        display: 'inline',
                        mt: 1
                      }}
                    >
                      {message.message}
                    </Typography>
                  }
                />
              </ListItem>
              {index < dummyMessages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
          {dummyMessages.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" align="center" color="textSecondary">
                    No messages yet
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default Messages; 