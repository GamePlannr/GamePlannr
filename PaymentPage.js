import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import ImageUpload from '../components/ImageUpload';
import Navbar from '../components/Navbar';
import './ProfilePage.css';

// ⭐ NEW — Format reviewer names (e.g., "Ryan K.")
const formatReviewerName = (first, last) => {
  if (!first) return '';
  if (!last) return first;

  const lastInitial = last.charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
};

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
        profilePictureUrl: profilePictureUrl,
        hourlyRate: profile.hourly_rate || '',
        teachingAreas: profile.teaching_areas || []
      });

      // Check for data URL images
      if (profilePictureUrl && profilePictureUrl.startsWith('data:')) {
        handleDataUrlUpload(profilePictureUrl);
      }
    }
  }, [profile]);

  const handleDataUrlUpload = async (dataUrl) => {
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${user.data.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.data.user.id);

      if (updateError) {
        console.error('Error updating profile picture URL:', updateError);
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePictureUrl: publicUrl
      }));
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

  const fetchReviews = useCallback(async () => {
    if (!profile || profile.role !== 'mentor') return;

    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          rating,
          comment,
          created_at,
          parent:parent_id (
            first_name,
            last_name
          )
        `)
        .eq('mentor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      setReviews(data || []);
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
    setFormData(prev => ({
      ...prev,
      teachingAreas: prev.teachingAreas.includes(area)
        ? prev.teachingAreas.filter(a => a !== area)
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
        age: parseInt(formData.age),
        city: formData.city,
        state: formData.state,
        sport: formData.sport,
        additional_sport: formData.additionalSport || null,
        bio: formData.bio,
        phone: formData.phone,
        experience: formData.experience,
        profile_picture_url: formData.profilePictureUrl,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
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

          {/* ... ALL YOUR EXISTING FORM CODE (unchanged) ... */}

          {/* Reviews Section */}
          {profile?.role === 'mentor' && (
            <div className="reviews-section">
              <h2>Your Reviews</h2>
              <p>See what parents are saying about your sessions</p>

              {reviewsLoading ? (
                <div className="loading">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">

                          {/* ⭐ UPDATED HERE */}
                          <span className="reviewer-name">
                            {formatReviewerName(
                              review.parent?.first_name,
                              review.parent?.last_name
                            )}
                          </span>

                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="review-rating">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="review-comment">"{review.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Keep delivering great sessions to earn your first review!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;