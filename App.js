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

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/signin" />;
};

// Public Route component for auth pages
const AuthRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/mentors" element={<MentorSearchPage />} />

            {/* Session & mentor routes */}
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

            {/* Payment routes */}
            <Route
              path="/payment/:sessionId"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            {/* ⚡ Payment success page should NOT require login
                so Stripe redirect works even if session expired */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />

            <Route
              path="/payment-cancelled"
              element={
                <ProtectedRoute>
                  <PaymentCancelledPage />
                </ProtectedRoute>
              }
            />

            {/* Auth routes */}
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

            {/* Protected routes */}
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