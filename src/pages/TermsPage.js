import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './TermsPage.css';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <Navbar />
      
      <div className="terms-container">
        <h1 className="terms-title">Terms & Safety</h1>
        
        <section className="terms-section">
          <h2>What is GamePlannr?</h2>
          <p>
            GamePlannr is a platform that connects parents and young athletes with teen mentors for coaching and skills development. 
            We facilitate connections between families and mentors but do not employ or supervise mentors.
          </p>
        </section>

        <section className="terms-section">
          <h2>Platform Disclaimer</h2>
          <p>
            GamePlannr is not an employer. Mentors are not employees, contractors, or agents of GamePlannr. 
            Sessions, scheduling, and payment are arranged independently between families and mentors. 
            <strong>GamePlannr is not an employer.</strong> We assume no responsibility for conduct, quality, or outcomes.
          </p>
        </section>

        <section className="terms-section">
          <h2>Liability Disclaimer</h2>
          <p>
            Participants acknowledge that GamePlannr is not responsible for physical injuries, accidents, or damages 
            during mentoring sessions. Activities are arranged at the discretion of families, and it is the responsibility 
            of parents and mentors to ensure safe environments.
          </p>
        </section>

        <section className="terms-section">
          <h2>Junior Mentors (Under 14)</h2>
          <p>
            GamePlannr welcomes young athletes under 14 as <strong>Junior Mentors</strong>, who offer guidance in a supervised, 
            parent-led setting. Junior Mentors are not workers or contractors, and their participation is informal.
          </p>
          <h3>Parental involvement is required for Junior Mentors</h3>
          <p>
            Parental involvement is required for Junior Mentors, including help with scheduling and in-person supervision. 
            Any payment is private and not facilitated by GamePlannr.
          </p>
        </section>

        <section className="terms-section">
          <h2>Safety Tips for Families</h2>
          <ul className="safety-tips">
            <li>Always communicate through trusted methods and verify information.</li>
            <li>Parents should be present or nearby during sessions, especially for younger mentors or mentees.</li>
            <li>Set clear expectations in advance regarding goals, timing, and safety.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Need Help?</h2>
          <p>
            If you have any questions or need support, please contact us at{' '}
            <a href="mailto:gameplannrhq@gmail.com" className="contact-link">
              gameplannrhq@gmail.com
            </a>.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;
