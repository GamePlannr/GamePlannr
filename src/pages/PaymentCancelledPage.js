import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PaymentCancelledPage.css';

const PaymentCancelledPage = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-cancelled-page">
      <Navbar />
      
      <main className="cancelled-main">
        <div className="cancelled-container">
          <div className="cancelled-header">
            <div className="cancelled-icon">○</div>
            <h1>Payment Cancelled</h1>
            <p>Your payment was cancelled. No charges have been made.</p>
          </div>

          <div className="cancelled-content">
            <div className="cancelled-info">
              <h3>What happened?</h3>
              <p>You cancelled the payment process before completing it. Your session request is still pending and you can complete the payment at any time.</p>
              
              <h3>What's next?</h3>
              <p>You can return to your dashboard to complete the payment for this session, or explore other mentors if you'd like to make a different choice.</p>
            </div>

            <div className="cancelled-actions">
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Return to Dashboard
              </button>
              <button onClick={() => navigate('/mentors')} className="btn btn-secondary">
                Browse Mentors
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelledPage;
