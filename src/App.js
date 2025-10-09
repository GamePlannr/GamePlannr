import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import MentorSearchPage from './pages/MentorSearchPage';
import SessionRequestPage from './pages/SessionRequestPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';

// ✅ Improved Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <p>Loading your account...</p>
      </div>
    );
  }

  // If not logged in, redirect to sign-in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Otherwise, show the protected page
  return children;
};

// ✅ Public Route component for signup/signin
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 🌎 Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/mentors" element={<MentorSearchPage />} />

            {/* 🚪 Auth routes (for signup/signin) */}
            <Route
              path="/signup"
              element={
                <AuthRoute>
                  <SignUpPage />
                </AuthRoute>
              }
            />
            <Route
              path="/signin"
              element={
                <AuthRoute>
                  <SignInPage />
                </AuthRoute>
              }
            />

            {/* 🔐 Protected routes (require login) */}
            <Route
              path="/request-session/:mentorId"
              element={
                <ProtectedRoute>
                  <SessionRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor-dashboard"
              element={
                <ProtectedRoute>
                  <MentorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:sessionId"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-cancelled"
              element={
                <ProtectedRoute>
                  <PaymentCancelledPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;