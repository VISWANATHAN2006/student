import React from 'react';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ onNavigateLogin, onNavigateRegister }) => {
  const { loginDemo, backendOnline } = useAuth();

  const handleQuickDemo = (role) => {
    loginDemo(role);
  };

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
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <GraduationCap size={24} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              BIEW <span style={{ color: 'var(--primary-400)' }}>CONNECT</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigateLogin('student')}
            className="btn btn-secondary btn-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigateRegister('student')}
            className="btn btn-primary btn-sm"
          >
            Register Student <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 2rem 5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--primary-300)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} /> Next-Gen Student Management System
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            maxWidth: '900px',
            margin: '0 auto 1.25rem',
          }}
        >
          Empowering Academic Excellence for <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Students, Faculty &amp; Admin</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Streamline daily attendance, internal marks calculation, Excel sheet evaluations, study material distribution, and college-wide circulars in one unified portal.
        </p>

        {/* Portal Entry Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
            textAlign: 'left',
          }}
        >
          {/* Student Card */}
          <div className="card card-glow glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <GraduationCap size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Student Portal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '54px' }}>
              Check attendance percentage, view internal marks, download notes, question banks, and receive circulars.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigateLogin('student')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                Student Login
              </button>
              <button
                onClick={() => handleQuickDemo('student')}
                className="btn btn-secondary btn-sm"
                title="Quick demo access"
              >
                <Zap size={14} /> Quick Demo
              </button>
            </div>
          </div>

          {/* Staff Card */}
          <div className="card card-glow glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Faculty &amp; Staff</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '54px' }}>
              Mark daily attendance, submit marks, upload class marks sheets via Excel, distribute notes, and broadcast notices.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigateLogin('staff')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, background: 'var(--grad-accent)' }}
              >
                Staff Login
              </button>
              <button
                onClick={() => handleQuickDemo('staff')}
                className="btn btn-secondary btn-sm"
                title="Quick demo access"
              >
                <Zap size={14} /> Quick Demo
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <div className="card card-glow glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid rgba(244, 63, 94, 0.3)',
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Principal &amp; Admin</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '54px' }}>
              Manage college classes, create subjects, assign Class Advisors &amp; Subject Teachers, and monitor college stats.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigateLogin('admin')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, background: 'var(--grad-danger)' }}
              >
                Admin Login
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="btn btn-secondary btn-sm"
                title="Quick demo access"
              >
                <Zap size={14} /> Quick Demo
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ marginTop: '5rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Engineered for Modern Academic Institutions
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div className="card">
              <Calendar size={28} color="#34d399" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>Instant Attendance</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Batch mark class or subject attendance in seconds with real-time % calculation.
              </p>
            </div>

            <div className="card">
              <Award size={28} color="#fbbf24" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>Excel Bulk Marks</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Upload entire class marks sheets in .xlsx format with automated validation.
              </p>
            </div>

            <div className="card">
              <BookOpen size={28} color="#818cf8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>Study Repository</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Organized notes &amp; previous year question papers mapped to class subjects.
              </p>
            </div>

            <div className="card">
              <Server size={28} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>FastAPI Backend</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Powered by high-performance Python FastAPI with SQLAlchemy and MySQL.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
