import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar/index';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Navbar />
          <Box sx={{ mt: '64px' }}>
            <AppRoutes />
          </Box>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
