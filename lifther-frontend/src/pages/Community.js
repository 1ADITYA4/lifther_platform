import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Link
} from '@mui/material';
import {
  School as EducationIcon,
  LocalHospital as HealthcareIcon,
  Group as SupportIcon,
  Gavel as LegalIcon
} from '@mui/icons-material';

const resources = [
  {
    title: 'Education Support',
    icon: <EducationIcon sx={{ fontSize: 40 }} />,
    description: 'Scholarships, educational programs, and learning resources for children.',
    links: [
      { text: 'Government Scholarships', url: '#' },
      { text: 'Education NGOs', url: '#' },
      { text: 'Free Online Courses', url: '#' }
    ]
  },
  {
    title: 'Healthcare Resources',
    icon: <HealthcareIcon sx={{ fontSize: 40 }} />,
    description: 'Medical assistance, health insurance, and wellness programs.',
    links: [
      { text: 'Health Insurance Schemes', url: '#' },
      { text: 'Medical Support NGOs', url: '#' },
      { text: 'Mental Health Resources', url: '#' }
    ]
  },
  {
    title: 'Support Groups',
    icon: <SupportIcon sx={{ fontSize: 40 }} />,
    description: 'Connect with other single mothers and share experiences.',
    links: [
      { text: 'Local Support Groups', url: '#' },
      { text: 'Online Communities', url: '#' },
      { text: 'Counseling Services', url: '#' }
    ]
  },
  {
    title: 'Legal Aid',
    icon: <LegalIcon sx={{ fontSize: 40 }} />,
    description: 'Legal assistance, rights information, and advocacy support.',
    links: [
      { text: 'Free Legal Aid', url: '#' },
      { text: 'Rights & Entitlements', url: '#' },
      { text: 'Legal Documentation Help', url: '#' }
    ]
  }
];

const Community = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom>
          Community Resources
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Supporting single mothers with essential resources and information
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {resources.map((resource) => (
          <Grid item xs={12} md={6} key={resource.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    color: '#b16cea'
                  }}
                >
                  {resource.icon}
                  <Typography variant="h5" component="h2" sx={{ ml: 2 }}>
                    {resource.title}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {resource.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {resource.links.map((link) => (
                    <Button
                      key={link.text}
                      component={Link}
                      href={link.url}
                      target="_blank"
                      rel="noopener"
                      sx={{
                        display: 'block',
                        textAlign: 'left',
                        color: '#ff5e69',
                        mb: 1,
                        '&:hover': {
                          color: '#b16cea'
                        }
                      }}
                    >
                      • {link.text}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Need immediate assistance?
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
            color: 'white'
          }}
        >
          Contact Helpline
        </Button>
      </Box>
    </Container>
  );
};

export default Community; 