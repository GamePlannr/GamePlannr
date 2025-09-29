// ProfilePage.js (rolled back & clean)

import React, { useState, useEffect, useCallback } from 'react';
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
    profilePictureUrl: '',
    hourlyRate: '',
    teachingAreas: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
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
        profilePictureUrl: profile.profile_picture_url || '',
        hourlyRate: profile.hourly_rate || '',
        teachingAreas: profile.teaching_areas || []
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      profilePictureUrl: imageUrl
    }));
  };

  const fetchReviews = useCallback(async () => {
    if (!profile || profile.role !== 'mentor') return;
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          parent:parent_id (
            first_name,
            last_name
          )
        `
        )
        .eq('mentor_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setReviews(data || []);
      } else {
        console.error('Error fetching reviews:', error);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleTeachingAreaChange = (area) => {
    setFormData((prev) => ({
      ...prev,
      teachingAreas: prev.teachingAreas.includes(area)
        ? prev.teachingAreas.filter((a) => a !== area)
        : [...prev.teachingAreas, area]
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
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city,
        state: formData.state,
        sport: formData.sport,
        additional_sport: formData.additionalSport || null,
        bio: formData.bio,
        phone: formData.phone,
        experience: formData.experience,
        profile_picture_url: formData.profilePictureUrl,
        hourly_rate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : null,
        teaching_areas: formData.teachingAreas,
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
    'Basketball',
    'Football',
    'Soccer',
    'Baseball',
    'Tennis',
    'Swimming',
    'Track & Field',
    'Volleyball',
    'Golf',
    'Hockey',
    'Lacrosse',
    'Wrestling',
    'Gymnastics',
    'Martial Arts',
    'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
    'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
    'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
    'WI', 'WY'
  ];

  const teachingAreas = [
    'Offense',
    'Defense',
    'Footwork',
    'Conditioning / Fitness',
    'Confidence Building',
    'Teamwork / Communication',
    'Game IQ / Strategy'
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
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                min="1"
                max="100"
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>

            <div className="form-section">
              <h3>Location & Sport</h3>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                required
              >
                <option value="">Select Sport</option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                name="additionalSport"
                value={formData.additionalSport}
                onChange={handleChange}
              >
                <option value="">Additional Sport (optional)</option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {profile.role === 'mentor' && (
              <div className="form-section">
                <h3>Mentor Info</h3>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="Hourly Rate"
                  step="0.01"
                  min="0"
                />
                <div>
                  {teachingAreas.map((area) => (
                    <label key={area}>
                      <input
                        type="checkbox"
                        checked={formData.teachingAreas.includes(area)}
                        onChange={() => handleTeachingAreaChange(area)}
                      />
                      {area}
                    </label>
                  ))}
                </div>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Experience"
                  rows="4"
                />
              </div>
            )}

            <div className="form-section">
              <h3>About You</h3>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Bio"
                rows="4"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          {profile.role === 'mentor' && (
            <div className="reviews-section">
              <h2>Your Reviews</h2>
              {reviewsLoading ? (
                <div className="loading">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <strong>
                      {review.parent?.first_name} {review.parent?.last_name}
                    </strong>{' '}
                    ({new Date(review.created_at).toLocaleDateString()}):{' '}
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                    {review.comment && <p>{review.comment}</p>}
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;