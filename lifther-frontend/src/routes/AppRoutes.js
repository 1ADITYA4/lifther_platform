import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Stories from '../pages/Stories';
import CreateStory from '../pages/CreateStory';
import Donate from '../components/Donate';
import Community from '../pages/Community';
import Profile from '../components/Profile/index';
import DonationHistory from '../components/DonationHistory';
import Messages from '../components/Messages';
import Settings from '../components/Settings';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import RecipientRegistration from '../components/RecipientRegistration';
import VerificationForm from '../components/Verification/VerificationForm';

const AppRoutes = () => {
  return (
    <main className="main-content">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/create" element={<CreateStory />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <Donate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipient-registration"
          element={
            <ProtectedRoute>
              <RecipientRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/donations"
          element={
            <ProtectedRoute>
              <DonationHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <ProtectedRoute>
              <VerificationForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
  );
};

export default AppRoutes; 