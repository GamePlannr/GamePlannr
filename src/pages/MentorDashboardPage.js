import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './MentorDashboardPage.css';

const MentorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [sessionRequests, setSessionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (profile?.role !== 'mentor') {
      navigate('/dashboard');
      return;
    }

    fetchSessionRequests();
  }, [user, profile, navigate]);

  const fetchSessionRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('session_requests')
        .select(`
          *,
          parent:parent_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching session requests:', error);
        setError('Failed to load session requests');
        return;
      }

      setSessionRequests(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');
      setSuccess('');

      // Get the session request details
      const request = sessionRequests.find(req => req.id === requestId);
      if (!request) return;

      // Create a session in the sessions table
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            parent_id: request.parent_id,
            mentor_id: request.mentor_id,
            scheduled_date: request.preferred_date,
            scheduled_time: request.preferred_time,
            location: request.location,
            notes: request.notes,
            status: 'awaiting_payment',
            session_request_id: requestId
          }
        ])
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        setError('Failed to accept request. Please try again.');
        return;
      }

      // Update the session request status to 'accepted'
      const { error: updateError } = await supabase
        .from('session_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request status:', updateError);
        setError('Failed to update request status. Please try again.');
        return;
      }

      // Show success message
      setSuccess(`✅ Session request accepted! Session created and parent has been notified.`);
      
      // Refresh the session requests
      await fetchSessionRequests();

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/mentor-dashboard');
      }, 3000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('session_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) {
        console.error('Error declining request:', error);
        setError('Failed to decline request. Please try again.');
        return;
      }

      // Show success message
      setSuccess(`❌ Session request declined. Parent has been notified.`);
      
      // Refresh the session requests
      await fetchSessionRequests();

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/mentor-dashboard');
      }, 3000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending' },
      accepted: { class: 'status-accepted', text: 'Accepted' },
      declined: { class: 'status-declined', text: 'Declined' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="mentor-dashboard-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading session requests...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mentor-dashboard-page">
      <Navbar />
      
      <main className="mentor-dashboard-main">
        <div className="mentor-dashboard-container">
          <div className="dashboard-header">
            <h1>Mentor Dashboard</h1>
            <p>Manage your session requests and upcoming sessions</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchSessionRequests} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="dashboard-content">
            <div className="requests-section">
              <h2>Session Requests</h2>
              
              {sessionRequests.length === 0 ? (
                <div className="no-requests">
                  <div className="no-requests-icon">📋</div>
                  <h3>No Session Requests Yet</h3>
                  <p>When parents request sessions with you, they'll appear here for you to review and respond to.</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {sessionRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <div className="parent-info">
                          <div className="parent-avatar">
                            <span className="avatar-initials">
                              {request.parent?.first_name?.[0] || 'P'}{request.parent?.last_name?.[0] || 'P'}
                            </span>
                          </div>
                          <div className="parent-details">
                            <h3>{request.parent?.first_name} {request.parent?.last_name}</h3>
                            <p className="parent-email">{request.parent?.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="request-details">
                        <div className="detail-row">
                          <span className="detail-label">Date:</span>
                          <span className="detail-value">{formatDate(request.preferred_date)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time:</span>
                          <span className="detail-value">{formatTime(request.preferred_time)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{request.location}</span>
                        </div>
                        {request.notes && (
                          <div className="detail-row">
                            <span className="detail-label">Notes:</span>
                            <span className="detail-value">{request.notes}</span>
                          </div>
                        )}
                      </div>

                      {request.status === 'pending' && (
                        <div className="request-actions">
                          <button
                            className="btn btn-decline"
                            onClick={() => handleDeclineRequest(request.id)}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? 'Declining...' : 'Decline'}
                          </button>
                          <button
                            className="btn btn-accept"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? 'Accepting...' : 'Accept'}
                          </button>
                        </div>
                      )}

                      {request.status === 'accepted' && (
                        <div className="request-status-info">
                          <p className="status-message">✅ Request accepted! Session created and awaiting payment.</p>
                        </div>
                      )}

                      {request.status === 'declined' && (
                        <div className="request-status-info">
                          <p className="status-message">❌ Request declined.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentorDashboardPage;
