// Signup.js — full rollback to working version

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [role, setRole] = useState('parent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          city,
          state,
          role
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Join GamePlannr</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSignup}>
        <label>First Name</label>
        <input value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <label>Last Name</label>
        <input value={lastName} onChange={e => setLastName(e.target.value)} required />
        <label>City</label>
        <input value={city} onChange={e => setCity(e.target.value)} required />
        <label>State</label>
        <input value={state} onChange={e => setState(e.target.value)} required />
        <label>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="parent">I'm a parent</option>
          <option value="mentor">I'm a mentor</option>
        </select>
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default Signup;