import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import ImageUpload from '../components/ImageUpload';
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
    additionalSport: '',
    bio: '',
    phone: '',
    experience: '',
    profilePictureUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      const profilePictureUrl = profile.profile_picture_url || '';
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        age: profile.age || '',
        city: profile.city || '',
        state: profile.state || '',
        sport: profile.sport || '',
        additionalSport: profile.additional_sport || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        experience: profile.experience || '',
        profilePictureUrl: profilePictureUrl
      });

      // Check if profile picture is still a data URL and upload it
      if (profilePictureUrl && profilePictureUrl.startsWith('data:')) {
        handleDataUrlUpload(profilePictureUrl);
      }
    }
  }, [profile]);

  const handleDataUrlUpload = async (dataUrl) => {
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) return;

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${user.data.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);
      
      if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.data.user.id);
      
      if (updateError) {
        console.error('Error updating profile picture URL:', updateError);
        return;
      }
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        profilePictureUrl: publicUrl
      }));
      
      console.log('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Error handling data URL upload:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: imageUrl
    }));
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
        additional_sport: formData.additionalSport || null,
        bio: formData.bio,
        phone: formData.phone,
        experience: formData.experience,
        profile_picture_url: formData.profilePictureUrl,
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
              <h3>Profile Picture</h3>
              <ImageUpload
                userId={profile?.id}
                currentImageUrl={formData.profilePictureUrl}
                onImageUploaded={handleImageUpload}
              />
            </div>

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

              <div className="form-group">
                <label htmlFor="additionalSport">Additional Sport (Optional)</label>
                <select
                  id="additionalSport"
                  name="additionalSport"
                  value={formData.additionalSport}
                  onChange={handleChange}
                >
                  <option value="">Select an additional sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <small className="field-help">
                  {profile?.role === 'mentor' 
                    ? 'Select another sport you can coach if applicable' 
                    : 'Select another sport your child is interested in'
                  }
                </small>
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
