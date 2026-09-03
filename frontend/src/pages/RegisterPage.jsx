import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/auth';
import { academicApi } from '../api/academic';
import { PublicNavbar } from '../components/common/PublicNavbar';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ChevronLeft,
  User,
  Mail,
  Lock,
  Calendar,
  Building,
  Hash,
} from 'lucide-react';

export const RegisterPage = ({ initialRole = 'student', onNavigateLogin, onNavigateBack }) => {
  const [role, setRole] = useState(initialRole);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    reg_no: '',
    roll_no: '',
    umis_id: '',
    department: '',
    branch: 'BCA',
    class_id: '',
    dob: '',
    email: '',
    password: '',
  });

  // Staff Form State
  const [staffForm, setStaffForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role_type: 'both', // "advisor" | "subject" | "both"
    department: '',
  });

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    full_name: '',
    email: '',
    password: '',
    designation: 'Principal',
  });

  // Fetch available classes for student registration dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const list = await academicApi.getClasses();
        if (list && list.length > 0) {
          setClasses(list);
          setStudentForm((prev) => ({ ...prev, class_id: String(list[0].id) }));
        } else {
          setStudentForm((prev) => ({ ...prev, class_id: '' }));
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setStudentForm((prev) => ({ ...prev, class_id: '' }));
      }
    };

    const fetchDepartments = async () => {
      try {
        const list = await academicApi.getDepartments();
        if (list && list.length > 0) {
          setDepartments(list);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };

    fetchClasses();
    fetchDepartments();
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.registerStudent({
        ...studentForm,
        class_id: parseInt(studentForm.class_id, 10),
        dob: studentForm.dob || null,
        umis_id: studentForm.umis_id || null,
      });
      toast.success('Student registered successfully! Please sign in.');
      onNavigateLogin('student');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.registerStaff(staffForm);
      toast.success('Staff registered successfully! Please sign in.');
      onNavigateLogin('staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.registerAdmin(adminForm);
      toast.success('Admin registered successfully! Please sign in.');
      onNavigateLogin('admin');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
        currentView="register"
        onNavigateHome={onNavigateBack}
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={(r) => setRole(r)}
      />

      <div
        className="page-content-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <button
            onClick={onNavigateBack}
            className="btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}
          >
            <ChevronLeft size={16} /> Back to Home
          </button>

        <div className="card card-glow glass-panel" style={{ padding: '2.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Account</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Choose your role and enter your details to sign up
            </p>
          </div>

          {/* Role selector tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.4rem',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('student')}
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
              }}
            >
              <GraduationCap size={15} /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('staff')}
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
              }}
            >
              <Users size={15} /> Staff
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
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
              }}
            >
              <ShieldCheck size={15} /> Admin
            </button>
          </div>

          {/* STUDENT FORM */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} autoComplete="off">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                    value={studentForm.full_name}
                    onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Class / Section *</label>
                  <select
                    className="form-select"
                    value={studentForm.class_id}
                    onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                    required
                  >
                    <option value="" disabled hidden>Select Class / Section</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.department ? `(${c.department})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Register Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter register number"
                    value={studentForm.reg_no}
                    onChange={(e) => setStudentForm({ ...studentForm, reg_no: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter roll number"
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  >
                    <option value="" disabled hidden>Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="BCA"
                    value={studentForm.branch}
                    onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">UMIS ID (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional state UMIS ID"
                    value={studentForm.umis_id}
                    onChange={(e) => setStudentForm({ ...studentForm, umis_id: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={studentForm.dob}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@biew.edu.in"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Student Account...' : 'Register Student Account'}
              </button>
            </form>
          )}

          {/* STAFF FORM */}
          {role === 'staff' && (
            <form onSubmit={handleStaffSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Faculty Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={staffForm.full_name}
                  onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Staff Role Type *</label>
                  <select
                    className="form-select"
                    value={staffForm.role_type}
                    onChange={(e) => setStaffForm({ ...staffForm, role_type: e.target.value })}
                    required
                  >
                    <option value="both">Class Advisor &amp; Subject Teacher (Both)</option>
                    <option value="advisor">Class Advisor Only</option>
                    <option value="subject">Subject Teacher Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  >
                    <option value="" disabled hidden>Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="faculty@biew.edu.in"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', background: 'var(--grad-accent)' }}
                disabled={loading}
              >
                {loading ? 'Creating Staff Account...' : 'Register Staff Account'}
              </button>
            </form>
          )}

          {/* ADMIN FORM */}
          {role === 'admin' && (
            <form onSubmit={handleAdminSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Admin / Principal Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={adminForm.full_name}
                  onChange={(e) => setAdminForm({ ...adminForm, full_name: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter designation"
                  value={adminForm.designation}
                  onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="principal@biew.edu.in"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', background: 'var(--grad-danger)' }}
                disabled={loading}
              >
                {loading ? 'Creating Admin Account...' : 'Register Admin Account'}
              </button>
            </form>
          )}

          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}
          >
            Already have an account?{' '}
            <button
              onClick={() => onNavigateLogin(role)}
              style={{
                color: 'var(--primary-400)',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
