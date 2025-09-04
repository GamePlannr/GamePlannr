import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="loading">Please sign in to access the dashboard.</div>;
  }

  if (!profile) {
    return (
      <div className="loading">
        <p>Loading your profile...</p>
        <p>If this takes too long, please check the browser console for errors.</p>
      </div>
    );
  }

  const isParent = profile.role === 'parent';
  const isMentor = profile.role === 'mentor';

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Welcome back, {profile.first_name}!</h1>
            <p>Role: {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
          </div>

          <div className="dashboard-content">
            {isParent && (
              <div className="parent-dashboard">
                <div className="dashboard-section">
                  <h2>Find a Mentor</h2>
                  <p>Search for local sports mentors in your area</p>
                  <Link to="/mentors" className="btn btn-primary">
                    Browse Mentors
                  </Link>
                </div>

                <div className="dashboard-section">
                  <h2>Your Sessions</h2>
                  <p>View your upcoming and past training sessions</p>
                  <div className="sessions-placeholder">
                    <p>No sessions yet. Find a mentor to get started!</p>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Quick Actions</h2>
                  <div className="quick-actions">
                    <Link to="/profile" className="action-card">
                      <h3>Update Profile</h3>
                      <p>Keep your information current</p>
                    </Link>
                    <Link to="/mentors" className="action-card">
                      <h3>Find Mentors</h3>
                      <p>Search by sport and location</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {isMentor && (
              <div className="mentor-dashboard">
                <div className="dashboard-section">
                  <h2>Session Requests</h2>
                  <p>Review and respond to session requests from parents</p>
                  <div className="requests-placeholder">
                    <p>No pending requests at the moment.</p>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Your Sessions</h2>
                  <p>Manage your upcoming and completed sessions</p>
                  <div className="sessions-placeholder">
                    <p>No sessions scheduled yet.</p>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Quick Actions</h2>
                  <div className="quick-actions">
                    <Link to="/profile" className="action-card">
                      <h3>Update Profile</h3>
                      <p>Keep your mentor profile current</p>
                    </Link>
                    <Link to="/availability" className="action-card">
                      <h3>Set Availability</h3>
                      <p>Update when you're available</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
