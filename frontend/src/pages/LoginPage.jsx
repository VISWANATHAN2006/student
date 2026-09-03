import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PublicNavbar } from '../components/common/PublicNavbar';
import logo from '../assets/logo.png';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Zap,
  ChevronLeft,
  Server,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage = ({
  initialRole = 'student',
  onNavigateRegister,
  onNavigateBack,
}) => {
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginDemo, backendOnline } = useAuth();
  const toast = useToast();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, role);
      toast.success(`Welcome back! Signed in as ${role.toUpperCase()}`);
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials or start FastAPI server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (selectedRole) => {
    loginDemo(selectedRole || role);
    toast.success(`Signed in as Demo ${selectedRole || role}!`);
  };

  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="global-bg-watermark" />
      <PublicNavbar
        currentView="login"
        onNavigateHome={onNavigateBack}
        onNavigateLogin={(r) => handleRoleChange(r)}
        onNavigateRegister={onNavigateRegister}
      />

      <div
        className="page-content-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
          }}
        >
        {/* Card */}
        <div className="card card-glow glass-panel" style={{ padding: '2.25rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                background: 'transparent',
              }}
            >
              <img src={logo} alt="College Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign In</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Choose your role and enter your details to sign in
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.4rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                background: role === 'student' ? 'var(--primary-600)' : 'transparent',
                color: role === 'student' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <GraduationCap size={15} /> Student
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('staff')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                background: role === 'staff' ? 'var(--accent-cyan)' : 'transparent',
                color: role === 'staff' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={15} /> Staff
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                background: role === 'admin' ? 'var(--accent-rose)' : 'transparent',
                color: role === 'admin' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={15} /> Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="auth_user_email"
                  id="auth_user_email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  required
                />
                <Mail
                  size={17}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="auth_user_secret"
                  id="auth_user_secret"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  autoComplete="new-password"
                  required
                />
                <Lock
                  size={17}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-muted)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Sign In as ${role === 'student' ? 'Student' : role === 'staff' ? 'Staff' : 'Admin'}`}
            </button>
          </form>



          {/* Register Link */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}
          >
            Need an account?{' '}
            <button
              onClick={() => onNavigateRegister(role)}
              style={{
                color: 'var(--primary-400)',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
