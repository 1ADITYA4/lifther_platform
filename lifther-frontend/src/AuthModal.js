import React, { useState } from 'react';
import './AuthModal.css';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const AuthModal = ({ onClose }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>&times;</button>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
        <button className="auth-modal-google" onClick={handleGoogleSignIn} disabled={loading}>
          <span className="auth-modal-google-icon">G</span> Continue with Google
        </button>
        <div className="auth-modal-or">or</div>
        <form onSubmit={handleSubmit} className="auth-modal-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <div className="auth-modal-error">{error}</div>}
          <button type="submit" className="auth-modal-btn" disabled={loading}>
            {loading ? (isSignup ? 'Signing Up...' : 'Logging In...') : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>
        <div className="auth-modal-toggle">
          {isSignup ? 'Already have an account?' : `Don't have an account?`}{' '}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 