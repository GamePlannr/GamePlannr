import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import './ProfilePage.css';

const ProfilePage = () => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    city: '',
    state: '',
    sport: '',
    bio: '',
    phone: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        age: profile.age || '',
        city: profile.city || '',
        state: profile.state || '',
        sport: profile.sport || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        experience: profile.experience || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: parseInt(formData.age),
        city: formData.city,
        state: formData.state,
        sport: formData.sport,
        bio: formData.bio,
        phone: formData.phone,
        experience: formData.experience,
        updated_at: new Date().toISOString()
      };

      const { error } = await updateProfile(updates);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const sports = [
    'Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Swimming',
    'Track & Field', 'Volleyball', 'Golf', 'Hockey', 'Lacrosse', 'Wrestling',
    'Gymnastics', 'Martial Arts', 'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
    'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
    'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
    'WI', 'WY'
  ];

  if (!profile) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Profile Settings</h1>
            <p>Update your personal information and preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Location & Sport</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sport">Primary Sport *</label>
                <select
                  id="sport"
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
            </div>

            {profile.role === 'mentor' && (
              <div className="form-section">
                <h3>Mentor Information</h3>
                <div className="form-group">
                  <label htmlFor="experience">Experience & Background</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell parents about your sports background, achievements, and coaching experience..."
                  />
                </div>
              </div>
            )}

            <div className="form-section">
              <h3>About You</h3>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
