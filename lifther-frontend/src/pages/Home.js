import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #fff5f6 0%, #ffeaf9 100%)',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center" mb={8}>
          <Typography
            component="h1"
            variant="h2"
            color="text.primary"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
            }}
          >
            Empowering <span style={{ color: '#b16cea' }}>Single Mothers</span>
            <br />
            Through Community Support
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            To financially empower single mothers by connecting them with donors who believe in supporting the future of their children.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/stories')}
              sx={{
                background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
                color: 'white',
                px: 4,
              }}
            >
              Share Your Story
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(user ? '/donate' : '/login')}
              sx={{
                borderColor: '#b16cea',
                color: '#b16cea',
                px: 4,
                '&:hover': {
                  borderColor: '#ff5e69',
                  color: '#ff5e69',
                },
              }}
            >
              Support a Mother
            </Button>
          </Box>
        </Box>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
          sx={{
            fontStyle: 'italic',
            mt: 4,
          }}
        >
          from a son to all mothers
        </Typography>
      </Container>
    </Box>
  );
};

export default Home; 