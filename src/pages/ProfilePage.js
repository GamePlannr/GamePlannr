// ProfilePage.js (clean rollback to working version — no data: upload handling)

import React, { useState, useEffect, useCallback } from 'react'; import { Link } from 'react-router-dom'; import { useAuth } from '../contexts/AuthContext'; import { supabase } from '../utils/supabase'; import ImageUpload from '../components/ImageUpload'; import Navbar from '../components/Navbar'; import './ProfilePage.css';

const ProfilePage = () => { const { profile, updateProfile } = useAuth(); const [formData, setFormData] = useState({ firstName: '', lastName: '', age: '', city: '', state: '', sport: '', additionalSport: '', bio: '', phone: '', experience: '', profilePictureUrl: '', hourlyRate: '', teachingAreas: [] }); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [reviews, setReviews] = useState([]); const [reviewsLoading, setReviewsLoading] = useState(false);

useEffect(() => { if (profile) { setFormData({ firstName: profile.first_name || '', lastName: profile.last_name || '', age: profile.age || '', city: profile.city || '', state: profile.state || '', sport: profile.sport || '', additionalSport: profile.additional_sport || '', bio: profile.bio || '', phone: profile.phone || '', experience: profile.experience || '', profilePictureUrl: profile.profile_picture_url || '', hourlyRate: profile.hourly_rate || '', teachingAreas: profile.teaching_areas || [] }); } }, [profile]);

const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

const handleImageUpload = (imageUrl) => { setFormData(prev => ({ ...prev, profilePictureUrl: imageUrl })); };

const fetchReviews = useCallback(async () => { if (!profile || profile.role !== 'mentor') return;

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

useEffect(() => { fetchReviews(); }, [fetchReviews]);

const handleTeachingAreaChange = (area) => { setFormData(prev => ({ ...prev, teachingAreas: prev.teachingAreas.includes(area) ? prev.teachingAreas.filter(a => a !== area) : [...prev.teachingAreas, area] })); };

const handleSubmit = async (e) => { e.preventDefault(); setError(''); setSuccess(''); setLoading(true);

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

const sports = [ 'Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Swimming', 'Track & Field', 'Volleyball', 'Golf', 'Hockey', 'Lacrosse', 'Wrestling', 'Gymnastics', 'Martial Arts', 'Other' ];

const states = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

const teachingAreas = [ 'Offense', 'Defense', 'Footwork', 'Conditioning / Fitness', 'Confidence Building', 'Teamwork / Communication', 'Game IQ / Strategy' ];

if (!profile) { return <div className="loading">Loading...</div>; }

return ( <div className="profile-page"> <Navbar /> {/* ...UI remains the same... */} </div> ); };

export default ProfilePage;

