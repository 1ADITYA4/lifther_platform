import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getDonationHistory } from '../utils/donationUtils';

const DonationHistory = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donations, setDonations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalDonations: 0,
    donationCount: 0
  });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const history = await getDonationHistory(currentUser.uid);
        setDonations(history.recentDonations.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ));
        setStats({
          totalDonations: history.totalDonations,
          donationCount: history.donationCount
        });
      } catch (err) {
        console.error('Error fetching donations:', err);
        setError('Failed to load donation history');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDonations();
    }
  }, [currentUser]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error'
    };
    return colors[status] || 'default';
  };

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
        <Typography variant="h4" gutterBottom>
          Donation History
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Total Donated
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              ₹{stats.totalDonations.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Total Donations
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {stats.donationCount}
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      {new Date(donation.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{donation.amount.toLocaleString()}</TableCell>
                    <TableCell>{donation.paymentMethod || 'UPI'}</TableCell>
                    <TableCell>
                      <Chip
                        label={donation.status || 'completed'}
                        color={getStatusColor(donation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{donation.message || '-'}</TableCell>
                  </TableRow>
                ))}
              {donations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No donations yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={donations.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default DonationHistory; 