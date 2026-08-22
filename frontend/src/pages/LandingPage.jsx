import React from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const LandingPage = ({ onNavigateLogin }) => {
  const { loginDemo } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
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
        }}
      />

      {/* Landing Nav */}
      <header
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src={logo} 
            alt="Bharathiyar Institute Logo" 
            style={{ 
              height: '50px', 
              width: '50px', 
              borderRadius: '50%',
              objectFit: 'cover'
            }} 
          />
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              STUDENT <span style={{ color: 'var(--primary-400)' }}>MANAGEMENT</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigateLogin('student')}
            className="btn btn-primary btn-sm"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem 5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        
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
          Welcome Staff and Students!
        </p>

      </main>
    </div>
  );
};
