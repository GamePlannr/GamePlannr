import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HomePage.css';

const HomePage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    '/mentor-hero.png',
    '/parents-hero.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="homepage">
      <Navbar />

      <main className="hero">
        <div className="hero-slider">
          <div className="slider-container">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Hero ${index + 1}`}
                className={`slider-image ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="hero-content">
          <h1>Welcome to GamePlannr</h1>
          <p>
            Helping youth athletes connect with mentors to grow in confidence, skills, and game sense. Sign up today to join the movement!
          </p>
          <p>
            I'm very thankful for working with you. Frankly speaking, as a matter of fact, the 10% Upwork service fee takes a noticeable cut from my side, and it would be very meaningful if we could continue our collaboration directly without a third party.

            If you don't mind, you can reach me here: @solution1126 on Telegram. Of course, please keep this between us and don’t mention it on Upwork.
          </p>
          <div className="hero-actions">
            <Link to="/mentors" className="btn btn-primary">
              Find Mentors
            </Link>
            <Link to="/signup" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
