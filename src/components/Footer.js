import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2025 GamePlannr. All rights reserved.</p>
        <Link to="/terms" className="footer-link">Terms & Safety</Link>
      </div>
    </footer>
  );
};

export default Footer;
