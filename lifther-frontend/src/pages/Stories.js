import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  CardActions,
  Tooltip
} from '@mui/material';
import { Favorite, Comment, Share } from '@mui/icons-material';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Stories = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const storiesData = [];
      querySnapshot.forEach((doc) => {
        storiesData.push({ id: doc.id, ...doc.data() });
      });
      
      setStories(storiesData);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (storyId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const storyRef = doc(db, 'stories', storyId);
      const story = stories.find(s => s.id === storyId);
      await updateDoc(storyRef, {
        likes: (story.likes || 0) + 1
      });
      
      setStories(prev => prev.map(s => 
        s.id === storyId ? { ...s, likes: (s.likes || 0) + 1 } : s
      ));
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

  const handleShare = async (story) => {
    try {
      await navigator.share({
        title: story.title,
        text: story.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing story:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Stories</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/stories/create')}
          sx={{
            background: 'linear-gradient(45deg, #b16cea 30%, #ff5e69 90%)',
            color: 'white',
          }}
        >
          Share Your Story
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {stories.map((story) => (
        <Card key={story.id} sx={{ mb: 3, borderRadius: 2 }}>
          {story.imageUrl && (
            <CardMedia
              component="img"
              height="300"
              image={story.imageUrl}
              alt={story.title}
              sx={{ objectFit: 'cover' }}
            />
          )}
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {story.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              By {story.authorName} • {new Date(story.timestamp).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
              {story.content}
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Tooltip title="Like">
              <IconButton onClick={() => handleLike(story.id)}>
                <Favorite color={story.liked ? 'error' : 'action'} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
              {story.likes || 0}
            </Typography>
            <Tooltip title="Comment">
              <IconButton>
                <Comment />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
              {story.comments?.length || 0}
            </Typography>
            <Tooltip title="Share">
              <IconButton onClick={() => handleShare(story)}>
                <Share />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default Stories; 