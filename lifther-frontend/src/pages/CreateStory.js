import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const CreateStory = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      if (imageFile) {
        const imageRef = ref(storage, `stories/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const storyData = {
        ...formData,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        imageUrl,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
      };

      await addDoc(collection(db, 'stories'), storyData);
      navigate('/stories');
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Share Your Story
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Your Story"
            name="content"
            multiline
            rows={6}
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="Share your journey..."
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="story-image"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="story-image">
              <IconButton
                color="primary"
                component="span"
                sx={{
                  mr: 2,
                  background: 'rgba(177, 108, 234, 0.1)',
                  '&:hover': {
                    background: 'rgba(177, 108, 234, 0.2)',
                  }
                }}
              >
                <PhotoCamera />
              </IconButton>
              Add Image
            </label>
          </Box>

          {imagePreview && (
            <Box sx={{ mt: 2, mb: 3 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px'
                }}
              />
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/stories')}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                flex: 1,
                background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff5e69 30%, #b16cea 90%)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Share Story'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateStory; 