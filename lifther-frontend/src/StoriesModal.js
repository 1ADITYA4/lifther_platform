import React, { useState, useEffect } from 'react';
import './StoriesModal.css';

const API_URL = 'http://localhost:3000/stories'; // Change if backend runs on different port

const categories = ['Education', 'Housing', 'Medical', 'Food', 'General Support'];

const StoriesModal = ({ onClose, user }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: user?.displayName || '',
    category: categories[0],
    story: '',
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch stories from backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setStories(data);
        setLoading(false);
      });
  }, []);

  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Add new story (with image upload)
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('story', form.story);
    formData.append('date', new Date().toISOString().slice(0, 10));
    formData.append('userId', user?.uid || 'guest');
    if (form.image) formData.append('image', form.image);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setStories([data, ...stories]);
      setShowForm(false);
      setForm({ name: user?.displayName || '', category: categories[0], story: '', image: null });
    } catch (err) {
      alert('Failed to share story');
    }
    setSubmitting(false);
  };

  // Delete story
  const handleDelete = async id => {
    if (!window.confirm('Delete this story?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setStories(stories.filter(s => s._id !== id));
  };

  // Edit story (UI/logic can be added similarly)

  return (
    <div className="stories-modal-backdrop">
      <div className="stories-modal">
        <button className="stories-modal-close" onClick={onClose}>&times;</button>
        <h2>Stories of Strength</h2>
        <p className="stories-modal-desc">Read and share real stories of single mothers overcoming challenges with the help of this community.</p>
        <button className="stories-modal-share-btn" onClick={() => setShowForm(true)}>
          Share Your Story
        </button>
        {showForm && (
          <form className="stories-modal-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleFormChange}
              required
              disabled={submitting}
            />
            <select
              name="category"
              value={form.category}
              onChange={handleFormChange}
              disabled={submitting}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <textarea
              name="story"
              placeholder="Share your story..."
              value={form.story}
              onChange={handleFormChange}
              required
              rows={4}
              disabled={submitting}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFormChange}
              disabled={submitting}
            />
            <button type="submit" className="stories-modal-btn" disabled={submitting}>
              {submitting ? 'Sharing...' : 'Share Story'}
            </button>
          </form>
        )}
        <div className="stories-modal-list">
          {loading ? (
            <div>Loading stories...</div>
          ) : stories.length === 0 ? (
            <div>No stories yet. Be the first to share!</div>
          ) : stories.map((s, i) => (
            <div className="stories-modal-card" key={s._id || i}>
              <img src={s.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&h=400&facepad=2'} alt={s.name} className="stories-modal-card-img" />
              <div className="stories-modal-card-content">
                <div className="stories-modal-card-header">
                  <span className="stories-modal-card-name">{s.name}</span>
                  <span className="stories-modal-card-category">{s.category}</span>
                  {user && (user.uid === s.userId) && (
                    <span className="stories-modal-card-delete" onClick={() => handleDelete(s._id)} title="Delete">🗑️</span>
                  )}
                </div>
                <div className="stories-modal-card-date">{s.date}</div>
                <div className="stories-modal-card-story">{s.story}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesModal; 