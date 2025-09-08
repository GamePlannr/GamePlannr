import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('Logging out...');
      await signOut();
      console.log('Logout successful');
      // The AuthContext will automatically update the user state
      // and the component will re-render showing Sign In/Sign Up buttons
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="nav-link">
            <img src="/gameplannr-logo.png" alt="GamePlannr Logo" className="nav-logo-img" />
          </Link>
        </div>
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/mentors" className="nav-link">
            Find Mentors
          </Link>
          <Link to="/terms" className="nav-link">
            Terms & Safety
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="nav-link">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="nav-link">
                Sign In
              </Link>
              <Link to="/signup" className="nav-link nav-link-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
