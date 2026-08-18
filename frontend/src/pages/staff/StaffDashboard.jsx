import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { staffApi } from '../../api/staff';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import {
  Users,
  UserCheck,
  ClipboardList,
  UploadCloud,
  Megaphone,
  BookOpen,
  AlertCircle,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export const StaffDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await staffApi.getDashboard();
        setDashboard(data);
      } catch (err) {
        // Fallback demo data
        setDashboard({
          full_name: user?.full_name || 'Dr. K. Anbarasan',
          role_type: user?.role_type || 'both',
          class_name: 'III BCA - A',
          subject_names: ['Java Programming', 'Data Structures', 'Web Technology Lab'],
          total_students: 48,
          pending_marks_count: 5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (loading && !dashboard) {
    return <Loader text="Loading faculty workspace..." />;
  }

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Badge variant="cyan">👨‍🏫 Faculty Portal</Badge>
            <Badge variant="primary">Role: {dashboard?.role_type?.toUpperCase()}</Badge>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Welcome, {dashboard?.full_name || user?.full_name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            {dashboard?.class_name ? (
              <>Class Advisor for <strong style={{ color: 'var(--text-primary)' }}>{dashboard.class_name}</strong> | </>
            ) : null}
            Handling {dashboard?.subject_names?.length || 0} Subject(s)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('mark-attendance')}
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--grad-accent)' }}
          >
            <UserCheck size={16} /> Take Attendance
          </button>
          <button
            onClick={() => onNavigate('manage-marks')}
            className="btn btn-secondary btn-sm"
          >
            <ClipboardList size={16} /> Enter Marks
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={dashboard?.total_students ?? 48}
          subtext={dashboard?.class_name ? `Class: ${dashboard.class_name}` : 'Enrolled Students'}
          icon={Users}
          colorVariant="cyan"
          onClick={() => onNavigate('mark-attendance')}
        />

        <StatCard
          title="Subjects Handled"
          value={dashboard?.subject_names?.length ?? 3}
          subtext="Theory &amp; Practical Courses"
          icon={BookOpen}
          colorVariant="primary"
          onClick={() => onNavigate('upload-notes')}
        />

        <StatCard
          title="Pending Evaluations"
          value={dashboard?.pending_marks_count ?? 0}
          subtext={
            dashboard?.pending_marks_count > 0 ? (
              <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <AlertCircle size={13} /> Assessment marks pending
              </span>
            ) : (
              <span style={{ color: '#34d399' }}>All marks submitted</span>
            )
          }
          icon={ClipboardList}
          colorVariant={dashboard?.pending_marks_count > 0 ? 'warning' : 'success'}
          onClick={() => onNavigate('manage-marks')}
        />

        <StatCard
          title="Class Advisory"
          value={dashboard?.class_name || 'Assigned Subjects'}
          subtext="Active Academic Duty"
          icon={GraduationCap}
          colorVariant="purple"
        />
      </div>

      {/* Quick Actions Grid */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>
        Quick Academic Operations
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div
          className="card glass-panel"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onNavigate('mark-attendance')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="stat-icon-wrapper icon-cyan" style={{ width: '42px', height: '42px' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Mark Daily Attendance</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class &amp; Subject level presence</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Batch record daily student attendance with 1-click batch marking and automatic percentage calculations.
          </p>
        </div>

        <div
          className="card glass-panel"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onNavigate('manage-marks')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="stat-icon-wrapper icon-warning" style={{ width: '42px', height: '42px' }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Marks &amp; Excel Sheets</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Direct entry or .xlsx upload</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enter CIA-1, CIA-2, Model exam scores directly or upload the full class spreadsheet in Excel format.
          </p>
        </div>

        <div
          className="card glass-panel"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onNavigate('upload-notes')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="stat-icon-wrapper icon-primary" style={{ width: '42px', height: '42px' }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Upload Courseware</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notes &amp; Question banks</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Share unit notes, lecture presentations, handouts, and previous semester question papers with your students.
          </p>
        </div>

        <div
          className="card glass-panel"
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => onNavigate('send-announcement')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="stat-icon-wrapper icon-purple" style={{ width: '42px', height: '42px' }}>
              <Megaphone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Send Announcements</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Broadcast targeted notices</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Post instant notifications to all students, specific class sections, or enrolled subject batches.
          </p>
        </div>
      </div>
    </div>
  );
};
