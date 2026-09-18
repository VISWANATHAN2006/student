import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { PublicNavbar } from '../components/common/PublicNavbar';
import logo from '../assets/logo.png';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const ForgotPasswordPage = ({
  initialRole = 'student',
  onNavigateLogin,
  onNavigateRegister,
  onNavigateBack,
}) => {
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1); // 1: Request Code, 2: Verify & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpPreview, setDevOtpPreview] = useState(null);

  const toast = useToast();

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setStep(1);
    setOtp('');
    setDevOtpPreview(null);
  };

  const handleRequestCode = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.warning('Please enter your registered email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword({
        email: cleanEmail,
        user_type: role,
      });

      toast.success(res.message || 'Recovery code sent successfully!');
      if (res.otp_preview) {
        setDevOtpPreview(res.otp_preview);
      }
      setStep(2);
      setResendCooldown(45);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      toast.warning('Please enter the 6-digit reset code');
      return;
    }
    if (cleanOtp.length !== 6) {
      toast.warning('Reset code must be exactly 6 digits');
      return;
    }
    if (!newPassword) {
      toast.warning('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: cleanEmail,
        otp: cleanOtp,
        new_password: newPassword,
      });

      toast.success(res.message || 'Password reset successfully! Please sign in.');
      if (onNavigateLogin) {
        onNavigateLogin(role);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <div className="global-bg-watermark" />
      <PublicNavbar
        currentView="login"
        onNavigateHome={onNavigateBack}
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
      />

      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1.5rem 5rem 1.5rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          {/* Main Card */}
          <div className="card card-glow glass-panel" style={{ padding: '2.25rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  background: 'transparent',
                }}
              >
                <img
                  src={logo}
                  alt="College Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
              </h2>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.35rem',
                  lineHeight: '1.4',
                }}
              >
                {step === 1
                  ? 'Select your role and enter your registered email to receive a recovery code'
                  : `Enter the 6-digit code sent to ${email} and choose a new password`}
              </p>
            </div>

            {/* Role Switcher Tabs (Step 1 only) */}
            {step === 1 && (
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
            )}

            {/* STEP 1: Request Code Form */}
            {step === 1 && (
              <form onSubmit={handleRequestCode} autoComplete="off">
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Registered Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. name@biew.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      autoComplete="off"
                      required
                    />
                    <Mail
                      size={17}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Sending Code...
                    </>
                  ) : (
                    <>
                      Send Recovery Code <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP & Reset Password Form */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} autoComplete="off">
                {/* Dev Mode OTP preview banner */}
                {devOtpPreview && (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} color="var(--primary-400)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        Recovery Code: <strong>{devOtpPreview}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtpPreview)}
                      style={{
                        background: 'var(--primary-600)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {/* 6-Digit OTP Field */}
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Change Email
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                      }}
                      maxLength={6}
                      style={{
                        paddingLeft: '2.5rem',
                        letterSpacing: '0.35rem',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        fontFamily: 'var(--font-mono)',
                      }}
                      required
                    />
                    <KeyRound
                      size={17}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  </div>
                </div>

                {/* New Password Field */}
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                      autoComplete="new-password"
                      required
                    />
                    <Lock
                      size={17}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
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
                        color: 'var(--text-muted)',
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                      autoComplete="new-password"
                      required
                    />
                    <Lock
                      size={17}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Reset Password
                    </>
                  )}
                </button>

                {/* Resend Code Link */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    textAlign: 'center',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-400)',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Back to Login Link */}
            <div
              style={{
                marginTop: '1.75rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.25rem',
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              <button
                type="button"
                onClick={() => onNavigateLogin && onNavigateLogin(role)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
