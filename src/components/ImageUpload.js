import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import './ImageUpload.css';

const ImageUpload = ({ userId, currentImageUrl, onImageUploaded, required = false }) => {
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      if (userId === 'signup-temp') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          setPreview(dataUrl);
          onImageUploaded(dataUrl);
        };
        reader.readAsDataURL(file);
        setUploading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to upload images');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onImageUploaded(publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-section">
      <div className="image-preview">
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="no-image">
            <span>No image selected</span>
            {required && <span className="required-text">* Required</span>}
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="file-input"
        id="image-upload"
      />

      <label htmlFor="image-upload" className="upload-button">
        {uploading ? 'Uploading...' : 'Choose Image'}
      </label>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ImageUpload;