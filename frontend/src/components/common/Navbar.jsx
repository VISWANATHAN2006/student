import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Sun,
  Moon,
  LogOut,
  Server,
  RefreshCw,
  Settings,
  Shield,
  User,
  BookOpen
} from 'lucide-react';
import { Modal } from './Modal';
import { setApiBaseURL } from '../../api/client';

export const Navbar = () => {
  const { user, logout, backendOnline, checkingBackend, testBackend, theme, toggleTheme } = useAuth();
  const toast = useToast();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('biew_api_url') || 'http://127.0.0.1:8000');

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiBaseURL(apiUrl);
    toast.success('API Base URL updated!');
    setShowConfigModal(false);
    testBackend();
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'admin') return 'badge-danger';
    if (role === 'staff') return 'badge-cyan';
    return 'badge-primary';
  };

  return (
    <>
      <header className="navbar glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div>
              <span style={{ color: 'var(--text-primary)' }}>BIEW</span>{' '}
              <span style={{ color: 'var(--primary-400)' }}>Connect</span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Backend Status Pill */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="btn-ghost"
            title="Click to configure Backend API URL"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: backendOnline
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${
                backendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
              }`,
              fontSize: '0.775rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: backendOnline ? '#10b981' : '#f43f5e',
                boxShadow: backendOnline
                  ? '0 0 8px #10b981'
                  : '0 0 8px #f43f5e',
              }}
            />
            <span style={{ color: backendOnline ? '#34d399' : '#fb7185' }}>
              {checkingBackend
                ? 'Checking API...'
                : backendOnline
                ? 'Backend Online'
                : 'Backend Offline (8000)'}
            </span>
            <Settings size={13} style={{ opacity: 0.7 }} />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            aria-label="Toggle theme"
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
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* User Profile Pill */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.35rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {user.full_name?.charAt(0) || 'U'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name}</span>
                <span
                  className={`badge ${getRoleBadgeVariant(user.user_type)}`}
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.05rem 0.4rem',
                    marginTop: '2px',
                    width: 'fit-content',
                  }}
                >
                  {user.user_type}
                </span>
              </div>

              <button
                onClick={logout}
                className="btn-ghost"
                title="Logout"
                style={{
                  marginLeft: '0.25rem',
                  padding: '0.35rem',
                  color: 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

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
              cd Student_Manegment &amp;&amp; uvicorn app.main:app --reload
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
