import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logo from '../../assets/logo.png';
import {
  Menu,
  ArrowLeft,
  X,
  GraduationCap,
  Users,
  ShieldCheck,
  UserPlus,
  Home,
  Sun,
  Moon,
  Server,
  RefreshCw,
  LogIn,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from './Modal';
import { setApiBaseURL } from '../../api/client';

export const PublicNavbar = ({
  currentView = 'landing',
  onNavigateHome,
  onNavigateLogin,
  onNavigateRegister,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('biew_api_url') || 'http://127.0.0.1:8000');
  
  const { theme, toggleTheme, backendOnline, checkingBackend, testBackend } = useAuth();
  const toast = useToast();

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiBaseURL(apiUrl);
    toast.success('API Base URL updated!');
    setShowConfigModal(false);
    testBackend();
  };

  const handleNav = (action) => {
    setIsDrawerOpen(false);
    if (action) action();
  };

  const handleBack = () => {
    if (currentView !== 'landing' && onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header
        className="glass-panel"
        style={{
          maxWidth: '100%',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        }}
      >
        {/* Left: 3-line Hamburger Menu Button + Back Button + Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <button
            className="btn-ghost hamburger-btn"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            title="Navigation Menu"
            style={{
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              flexShrink: 0,
            }}
          >
            <Menu size={22} />
          </button>

          {/* Back button - only rendered on inner/subpages, hidden on the first page */}
          {currentView !== 'landing' && (
            <button
              className="btn-ghost"
              onClick={handleBack}
              aria-label="Go back"
              title="Go back"
              style={{
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div
            onClick={() => onNavigateHome && onNavigateHome()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: onNavigateHome ? 'pointer' : 'default',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                flexShrink: 0,
              }}
            />
            <div className="navbar-brand-title" style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                STUDENT <span style={{ color: 'var(--primary-400)' }}>MANAGEMENT</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Portal
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
            }}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* Right Action - Home button on subpages */}
          {currentView !== 'landing' && (
            <button
              onClick={() => onNavigateHome && onNavigateHome()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Home size={15} /> Home
            </button>
          )}
        </div>
      </header>

      {/* Slide-over Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsDrawerOpen(false)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}

      {/* Slide-over Public Navigation Drawer */}
      <aside
        className={`sidebar ${isDrawerOpen ? 'open' : ''}`}
        style={{
          boxShadow: isDrawerOpen ? '8px 0 30px rgba(0, 0, 0, 0.6)' : 'none',
        }}
      >
        {/* Drawer Header */}
        <div
          className="sidebar-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '0 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div>
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.3px',
                }}
              >
                STUDENT <span style={{ color: 'var(--primary-400)' }}>MANAGEMENT</span>
              </span>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Menu
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="sidebar-nav">
          <div
            style={{
              padding: '0.4rem 0.75rem 0.2rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            Portals
          </div>

          <button
            className={`nav-item ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => handleNav(onNavigateHome)}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <button
            className={`nav-item ${currentView === 'login' ? 'active' : ''}`}
            onClick={() => handleNav(() => onNavigateLogin && onNavigateLogin('student'))}
          >
            <GraduationCap size={18} />
            <span>Student Portal</span>
          </button>

          <button
            className="nav-item"
            onClick={() => handleNav(() => onNavigateLogin && onNavigateLogin('staff'))}
          >
            <Users size={18} />
            <span>Staff Portal</span>
          </button>

          <button
            className="nav-item"
            onClick={() => handleNav(() => onNavigateLogin && onNavigateLogin('admin'))}
          >
            <ShieldCheck size={18} />
            <span>Admin Portal</span>
          </button>

          <div
            style={{
              margin: '0.75rem 0.5rem',
              borderTop: '1px solid var(--border-color)',
            }}
          />

          <div
            style={{
              padding: '0.2rem 0.75rem 0.2rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            Account
          </div>

          <button
            className={`nav-item ${currentView === 'register' ? 'active' : ''}`}
            onClick={() => handleNav(() => onNavigateRegister && onNavigateRegister('student'))}
          >
            <UserPlus size={18} />
            <span>Register Account</span>
          </button>
        </nav>

        {/* Drawer Footer */}
        <div className="sidebar-footer">
          {/* Server Status pill */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: backendOnline ? '#10b981' : '#f43f5e',
                  boxShadow: backendOnline ? '0 0 8px #10b981' : '0 0 8px #f43f5e',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Server: {backendOnline ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <button
              onClick={() => {
                setShowConfigModal(true);
                setIsDrawerOpen(false);
              }}
              className="btn-ghost"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              title="Server Settings"
            >
              <Server size={14} />
            </button>
          </div>

          {/* Theme switch in drawer */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} color="#fbbf24" /> Light Mode
              </>
            ) : (
              <>
                <Moon size={15} color="#6366f1" /> Dark Mode
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Backend API Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="FastAPI Server Connection Settings"
      >
        <form onSubmit={handleSaveApiUrl}>
          <div className="form-group">
            <label className="form-label">FastAPI Backend URL</label>
            <input
              type="text"
              className="form-input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              required
            />
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Default FastAPI server runs on <code>http://127.0.0.1:8000</code>.
            </span>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--primary-300)', marginBottom: '4px' }}>
              💡 How to run your backend:
            </div>
            <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px', margin: '4px 0' }}>
              cd Student_Manegment &amp;&amp; python -m uvicorn app.main:app --reload
            </code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                testBackend();
                toast.info('Testing connection...');
              }}
            >
              <RefreshCw size={15} /> Test Health
            </button>
            <button type="submit" className="btn btn-primary">
              Save &amp; Connect
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
