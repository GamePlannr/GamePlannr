import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './MentorDashboardPage.css';

const MentorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [sessionRequests, setSessionRequests] = useState([]);
  const [confirmedSessions, setConfirmedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSessionRequests = useCallback(async () => {
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
  }, [user.id]);

  const fetchConfirmedSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          parent:parent_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('mentor_id', user.id)
        .in('status', ['paid', 'confirmed'])
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching confirmed sessions:', error);
        return;
      }

      setConfirmedSessions(data || []);
    } catch (err) {
      console.error('Unexpected error fetching confirmed sessions:', err);
    }
  }, [user.id]);

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
    fetchConfirmedSessions();
  }, [user, profile, navigate, fetchSessionRequests, fetchConfirmedSessions]);

  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');
      setSuccess('');

      // Get the session request details
      const request = sessionRequests.find(req => req.id === requestId);
      if (!request) return;

      // Create a session in the sessions table
      console.log('Creating session with data:', {
        parent_id: request.parent_id,
        mentor_id: request.mentor_id,
        scheduled_date: request.preferred_date,
        scheduled_time: request.preferred_time,
        location: request.location,
        status: 'awaiting_payment',
        session_request_id: requestId
      });

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            parent_id: request.parent_id,
            mentor_id: request.mentor_id,
            scheduled_date: request.preferred_date,
            scheduled_time: request.preferred_time,
            location: request.location,
            status: 'awaiting_payment',
            session_request_id: requestId
          }
        ])
        .select()
        .single();

      console.log('Session creation result:', { sessionData, sessionError });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        setError(`Failed to accept request: ${sessionError.message}`);
        return;
      }

      // Update the session request status to 'accepted'
      const { error: updateError } = await supabase
        .from('session_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request status:', updateError);
        setError(`Failed to update request status: ${updateError.message}`);
        return;
      }

      // Show success message
      setSuccess(`✓ Session request accepted! Session created and parent has been notified.`);
      
      // Refresh the session requests
      await fetchSessionRequests();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/mentor-dashboard');
      }, 2000);

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
        setError(`Failed to decline request: ${error.message}`);
        return;
      }

      // Show success message
      setSuccess(`✕ Session request declined. Parent has been notified.`);
      
      // Refresh the session requests
      await fetchSessionRequests();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/mentor-dashboard');
      }, 2000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      setSuccess('✓ Session marked as completed. Parent can now rate the session.');
      await fetchConfirmedSessions();
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
            <h1>Welcome back, {profile?.first_name}!</h1>
            <p>Role: {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}</p>
            <h2>Mentor Dashboard</h2>
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
                  <div className="no-requests-icon">📄</div>
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
                            {request.parent?.profile_picture_url ? (
                              <img 
                                src={request.parent.profile_picture_url} 
                                alt={`${request.parent.first_name} ${request.parent.last_name}`}
                                className="parent-avatar-image"
                              />
                            ) : (
                              <span className="avatar-initials">
                                {request.parent?.first_name?.[0] || 'P'}{request.parent?.last_name?.[0] || 'P'}
                              </span>
                            )}
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
                        {request.payment_method && (
                          <div className="detail-row">
                            <span className="detail-label">Payment Method:</span>
                            <span className="detail-value payment-method">
                              {request.payment_method === 'other' 
                                ? request.other_payment_method 
                                : request.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                              }
                            </span>
                          </div>
                        )}
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
                          <p className="status-message">✓ Request accepted! Session created and awaiting payment.</p>
                        </div>
                      )}

                      {request.status === 'declined' && (
                        <div className="request-status-info">
                          <p className="status-message">✕ Request declined.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sessions-section">
              <h2>Your Confirmed Sessions</h2>
              
              {confirmedSessions.length === 0 ? (
                <div className="no-sessions">
                  <div className="no-sessions-icon">📆</div>
                  <h3>No Confirmed Sessions Yet</h3>
                  <p>Your confirmed sessions will appear here once parents complete payment for accepted requests.</p>
                </div>
              ) : (
                <div className="sessions-grid">
                  {confirmedSessions.map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <div className="parent-info">
                          <div className="parent-avatar">
                            {session.parent?.profile_picture_url ? (
                              <img 
                                src={session.parent.profile_picture_url} 
                                alt={`${session.parent.first_name} ${session.parent.last_name}`}
                                className="parent-avatar-image"
                              />
                            ) : (
                              <span className="avatar-initials">
                                {session.parent?.first_name?.[0] || 'P'}{session.parent?.last_name?.[0] || 'P'}
                              </span>
                            )}
                          </div>
                          <div className="parent-details">
                            <h3>{session.parent?.first_name} {session.parent?.last_name}</h3>
                            <p className="parent-email">{session.parent?.email}</p>
                          </div>
                        </div>
                        <div className="session-status">
                          <span className={`status-badge status-${session.status}`}>
                            {session.status === 'paid' && '✓ Paid'}
                            {session.status === 'confirmed' && '✓ Confirmed'}
                            {session.status === 'completed' && '✓ Completed'}
                          </span>
                          {session.status === 'confirmed' && (
                            <button
                              className="btn btn-complete"
                              onClick={() => handleMarkCompleted(session.id)}
                              disabled={actionLoading === session.id}
                            >
                              {actionLoading === session.id ? 'Processing...' : 'Mark as Completed'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="session-details">
                        <div className="detail-row">
                          <span className="detail-label">Date:</span>
                          <span className="detail-value">{formatDate(session.scheduled_date)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time:</span>
                          <span className="detail-value">{formatTime(session.scheduled_time)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{session.location}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value">
                            {session.status === 'paid' ? 'Payment completed, awaiting confirmation' : 'Session confirmed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mentor-actions">
              <Link to="/profile" className="action-card">
                <h3>Update Profile</h3>
                <p>Keep your mentor profile current</p>
              </Link>
              <Link to="/mentors" className="action-card">
                <h3>View Public Profile</h3>
                <p>See how parents see your profile</p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentorDashboardPage;
