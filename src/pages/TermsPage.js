// pages/TermsPage.js
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

        {/* What is GamePlannr */}
        <section className="terms-section">
          <h2>What is GamePlannr?</h2>
          <p>
            GamePlannr is a platform that connects parents and young athletes with teen mentors for coaching,
            skill development, and athletic guidance. GamePlannr facilitates introductions between families
            and mentors but does <strong>not</strong> employ, supervise, or oversee mentoring activities.
          </p>
        </section>

        {/* Platform Disclaimer */}
        <section className="terms-section">
          <h2>Platform Disclaimer</h2>
          <p>
            GamePlannr is <strong>not</strong> an employer. Mentors are not employees, agents, or contractors
            of GamePlannr. All sessions, communication, scheduling, and payment arrangements are made
            independently between families and mentors.
          </p>

          <p>
            GamePlannr does not train or supervise mentors, guarantee outcomes, oversee session conduct,
            or verify communication outside the platform.
          </p>
        </section>

        {/* No Background Checks */}
        <section className="terms-section">
          <h2>No Background Checks</h2>
          <p>
            GamePlannr does <strong>not</strong> perform background checks, screening, or identity verification
            on mentors or families. Users are fully responsible for verifying any information they consider
            important for safety or suitability.
          </p>
        </section>

        {/* Assumption of Risk */}
        <section className="terms-section">
          <h2>Assumption of Risk & Release of Liability</h2>
          <p>
            Sports and physical activities involve inherent risks, including injury, accidents, or property damage.
            By participating in mentoring sessions, families and mentors:
          </p>

          <ul className="safety-tips">
            <li>Voluntarily assume all risks associated with physical activity.</li>
            <li>Acknowledge that sessions are optional and conducted at their own discretion.</li>
            <li>
              Release GamePlannr from any liability for injuries, accidents, damages, or losses related
              to mentoring sessions.
            </li>
          </ul>
        </section>

        {/* Indemnification */}
        <section className="terms-section">
          <h2>Indemnification</h2>
          <p>
            Users agree to indemnify and hold harmless GamePlannr, its founders, and affiliates from any claims,
            damages, or losses resulting from:
          </p>

          <ul className="safety-tips">
            <li>User actions or behavior</li>
            <li>Participation in mentoring sessions</li>
            <li>Disputes between families and mentors</li>
            <li>Communications or arrangements made outside the platform</li>
          </ul>
        </section>

        {/* Payment Disclaimer */}
        <section className="terms-section">
          <h2>Payment Disclaimer</h2>
          <p>
            GamePlannr does not manage, guarantee, or insure any payments between families and mentors.
            Any compensation, reimbursement, or arrangements are private and made directly between users.
          </p>

          <p>
            GamePlannr may collect a platform or booking fee for connecting users, but this does not
            create any employment, contractual, or supervisory relationship.
          </p>
        </section>

        {/* Junior Mentors */}
        <section className="terms-section">
          <h2>Junior Mentors (Under 14)</h2>
          <p>
            GamePlannr welcomes young athletes under 14 as <strong>Junior Mentors</strong>, who participate in a
            supervised, parent-led environment. Junior Mentors are not workers or contractors and take part
            informally.
          </p>

          <h3>Parental Involvement is Required</h3>
          <p>
            Parents/guardians of Junior Mentors must:
          </p>

          <ul className="safety-tips">
            <li>Be present or nearby during all sessions</li>
            <li>Handle communication and scheduling</li>
            <li>Ensure safety, conduct, and transportation</li>
          </ul>
        </section>

        {/* Safety Tips */}
        <section className="terms-section">
          <h2>Safety Tips for Families</h2>
          <ul className="safety-tips">
            <li>Always communicate through trusted methods and verify information.</li>
            <li>
              Parents should be present or nearby during sessions, especially for younger mentors or mentees.
            </li>
            <li>Meet in public or familiar locations when possible.</li>
            <li>Set clear expectations about goals, timing, communication, and supervision.</li>
          </ul>
        </section>

        {/* User Eligibility */}
        <section className="terms-section">
          <h2>User Eligibility</h2>
          <p>
            Parents must be at least 18 years old to create an account. Mentors under 18 must have parental
            permission and involvement. Users agree not to misrepresent their age, identity, or experience.
          </p>
        </section>

        {/* Contact */}
        <section className="terms-section">
          <h2>Need Help?</h2>
          <p>
            If you have any questions or need support, please contact us at:{' '}
            <a href="mailto:gameplannrhq@gmail.com" className="contact-link">
              gameplannrhq@gmail.com
            </a>
          </p>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;