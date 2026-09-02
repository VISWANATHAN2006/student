import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PublicNavbar } from '../components/common/PublicNavbar';

export const LandingPage = ({ onNavigateLogin, onNavigateRegister }) => {
  const { loginDemo } = useAuth();

  return (
    <div style={{ height: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Background Decorative Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(124, 58, 237, 0.05) 60%, transparent 80%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      />

      {/* Top Navbar with 3-line Menu */}
      <PublicNavbar
        currentView="landing"
        onNavigateHome={() => {}}
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
      />

      {/* Hero Section */}
      <div className="page-content-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          
          <h1
            style={{
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              maxWidth: '900px',
              margin: '0 auto 1.25rem',
            }}
          >
            STUDENT <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MANAGEMENT</span>
          </h1>

          <p
            style={{
              fontSize: '1.5rem',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Welcome!!!
          </p>

        </main>
      </div>
    </div>
  );
};
