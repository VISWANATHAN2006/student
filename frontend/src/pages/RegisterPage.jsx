import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/auth';
import { academicApi } from '../api/academic';
import { PublicNavbar } from '../components/common/PublicNavbar';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Calendar,
  Building,
  Hash,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const RegisterPage = ({ initialRole = 'student', onNavigateLogin, onNavigateBack }) => {
  // Primary roles requested: 'student' or 'staff' (with subtle 'admin' toggle)
  const [role, setRole] = useState(initialRole === 'admin' ? 'admin' : (initialRole === 'staff' ? 'staff' : 'student'));
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStudentPwd, setShowStudentPwd] = useState(false);
  const [showStaffPwd, setShowStaffPwd] = useState(false);
  const [showAdminPwd, setShowAdminPwd] = useState(false);
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

  // Fetch available classes and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classList, deptList] = await Promise.allSettled([
          academicApi.getClasses(),
          academicApi.getDepartments(),
        ]);

        if (classList.status === 'fulfilled' && classList.value?.length > 0) {
          setClasses(classList.value);
          setStudentForm((prev) => ({ ...prev, class_id: String(classList.value[0].id) }));
        }

        if (deptList.status === 'fulfilled' && deptList.value?.length > 0) {
          setDepartments(deptList.value);
        }
      } catch (err) {
        console.error('Failed to fetch registration metadata:', err);
      }
    };

    fetchData();
  }, []);

  // Filter classes by selected student department
  const filteredClasses = studentForm.department
    ? classes.filter((c) => !c.department || c.department.toLowerCase() === studentForm.department.toLowerCase())
    : classes;

  const handleDepartmentChange = (deptName) => {
    setStudentForm((prev) => {
      const matchingClasses = classes.filter(
        (c) => !c.department || c.department.toLowerCase() === deptName.toLowerCase()
      );
      return {
        ...prev,
        department: deptName,
        class_id: matchingClasses.length > 0 ? String(matchingClasses[0].id) : prev.class_id,
      };
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentForm.class_id) {
      toast.warning('Please select a valid Class / Section.');
      return;
    }
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
        currentView="register"
        onNavigateHome={onNavigateBack}
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={(r) => setRole(r)}
      />

      {/* FULL PAGE SCROLLABLE CONTAINER */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1.25rem 6rem 1.25rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '660px', margin: '0 auto' }}>
          <div className="card card-glow glass-panel" style={{ padding: '2.25rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Select your institutional role to load relevant registration details
              </p>
            </div>

            {/* PROMINENT USER ROLE SELECTION: STUDENT VS STAFF */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                }}
              >
                Select User Role *
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                }}
              >
                {/* Student Role Card */}
                <div
                  id="role-select-student"
                  onClick={() => setRole('student')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: role === 'student' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    background: role === 'student' ? 'rgba(99, 102, 241, 0.14)' : 'var(--bg-card)',
                    boxShadow: role === 'student' ? '0 0 24px rgba(99, 102, 241, 0.28)' : 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                  }}
                >
                  {role === 'student' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: 'var(--primary-400)',
                      }}
                    >
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: role === 'student' ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto',
                    }}
                  >
                    <GraduationCap size={26} color={role === 'student' ? '#fff' : 'var(--text-secondary)'} />
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: role === 'student' ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    Student
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Access marks, attendance, notes &amp; academic portal
                  </div>
                </div>

                {/* Staff Role Card */}
                <div
                  id="role-select-staff"
                  onClick={() => setRole('staff')}
                  style={{
                    cursor: 'pointer',
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: role === 'staff' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    background: role === 'staff' ? 'rgba(6, 182, 212, 0.14)' : 'var(--bg-card)',
                    boxShadow: role === 'staff' ? '0 0 24px rgba(6, 182, 212, 0.28)' : 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                  }}
                >
                  {role === 'staff' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: role === 'staff' ? 'var(--grad-accent)' : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto',
                    }}
                  >
                    <Users size={26} color={role === 'staff' ? '#fff' : 'var(--text-secondary)'} />
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: role === 'staff' ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    Staff
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Manage classes, student attendance, marks &amp; materials
                  </div>
                </div>
              </div>

              {/* Subtle Admin Link */}
              <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setRole(role === 'admin' ? 'student' : 'admin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: role === 'admin' ? 'var(--accent-rose)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'underline',
                  }}
                >
                  <ShieldCheck size={14} />
                  {role === 'admin' ? '← Switch to Student / Staff Registration' : 'Register as College Administrator'}
                </button>
              </div>
            </div>

            {/* ROLE SPECIFIC FIELDS */}

            {/* 1. STUDENT REGISTRATION FORM */}
            {role === 'student' && (
              <form onSubmit={handleStudentSubmit} autoComplete="off">
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Register Number *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 23BCA101"
                        value={studentForm.reg_no}
                        onChange={(e) => setStudentForm({ ...studentForm, reg_no: e.target.value })}
                        autoComplete="off"
                        required
                      />
                    </div>

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
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Roll Number *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 101"
                        value={studentForm.roll_no}
                        onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={studentForm.department}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        required
                      >
                        <option value="" disabled hidden>
                          Select Department
                        </option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Class / Section *</label>
                      <select
                        className="form-select"
                        value={studentForm.class_id}
                        onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                        required
                      >
                        <option value="" disabled hidden>
                          Select Class Group
                        </option>
                        {filteredClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.department ? `(${c.department})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="BCA / CSE"
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
                        placeholder="State Higher Ed UMIS ID"
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
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showStudentPwd ? 'text' : 'password'}
                          className="form-input"
                          placeholder="••••••••"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          autoComplete="new-password"
                          style={{ paddingRight: '2.75rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPwd((v) => !v)}
                          aria-label={showStudentPwd ? 'Hide password' : 'Show password'}
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
                        >
                          {showStudentPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '1.5rem',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Creating Student Account...' : 'Complete Student Registration'}
                  </button>
                </div>
              </form>
            )}

            {/* 2. STAFF REGISTRATION FORM */}
            {role === 'staff' && (
              <form onSubmit={handleStaffSubmit} autoComplete="off">
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Faculty Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. K. Ramesh"
                      value={staffForm.full_name}
                      onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-select"
                        value={staffForm.department}
                        onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                        required
                      >
                        <option value="" disabled hidden>
                          Select Department
                        </option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

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
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Staff Email Address *</label>
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
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showStaffPwd ? 'text' : 'password'}
                          className="form-input"
                          placeholder="••••••••"
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                          autoComplete="new-password"
                          style={{ paddingRight: '2.75rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffPwd((v) => !v)}
                          aria-label={showStaffPwd ? 'Hide password' : 'Show password'}
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
                        >
                          {showStaffPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '1.5rem',
                      padding: '0.85rem',
                      background: 'var(--grad-accent)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Creating Staff Account...' : 'Complete Staff Registration'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. ADMIN REGISTRATION FORM */}
            {role === 'admin' && (
              <form onSubmit={handleAdminSubmit} autoComplete="off">
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
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
                      placeholder="Principal / Dean / Administrator"
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
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showAdminPwd ? 'text' : 'password'}
                          className="form-input"
                          placeholder="••••••••"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          autoComplete="new-password"
                          style={{ paddingRight: '2.75rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPwd((v) => !v)}
                          aria-label={showAdminPwd ? 'Hide password' : 'Show password'}
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
                        >
                          {showAdminPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '1.5rem',
                      padding: '0.85rem',
                      background: 'var(--grad-danger)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Creating Admin Account...' : 'Complete Admin Registration'}
                  </button>
                </div>
              </form>
            )}

            {/* Footer Navigation */}
            <div
              style={{
                marginTop: '1.75rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              Already registered on the portal?{' '}
              <button
                type="button"
                onClick={() => onNavigateLogin(role === 'admin' ? 'admin' : (role === 'staff' ? 'staff' : 'student'))}
                style={{
                  color: 'var(--primary-400)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                Sign In here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
