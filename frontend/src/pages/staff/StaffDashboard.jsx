import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { staffApi } from '../../api/staff';
import { attendanceApi } from '../../api/attendance';
import { academicApi } from '../../api/academic';
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
  GraduationCap,
  AlertTriangle,
  Bell,
} from 'lucide-react';

export const StaffDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowAttendanceList, setLowAttendanceList] = useState([]);
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await staffApi.getDashboard();
        setDashboard(data);
      } catch (err) {
        // Fallback demo data
        setDashboard({
          full_name: user?.full_name || '',
          role_type: user?.role_type || 'both',
          class_name: '',
          subject_names: [],
          total_students: 0,
          pending_marks_count: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  // Load low attendance once we know the first class
  useEffect(() => {
    const loadLowAttendance = async () => {
      try {
        const classes = await academicApi.getClasses();
        if (classes && classes.length > 0) {
          const data = await attendanceApi.getClassLowAttendance(classes[0].id, 75.0);
          setLowAttendanceList(data || []);
        }
      } catch (e) {
        // ignore – best effort
      }
    };
    loadLowAttendance();
  }, []);

  const handleNotifyLowAttendance = async () => {
    try {
      const classes = await academicApi.getClasses();
      if (!classes || classes.length === 0) return;
      setSendingAlert(true);
      await attendanceApi.notifyLowAttendance(classes[0].id, 75.0);
    } catch (e) {
      // ignore
    } finally {
      setSendingAlert(false);
    }
  };

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
            <Badge variant="cyan">👨‍🏫 Staff</Badge>
            <Badge variant="primary">Role: {dashboard?.role_type?.toUpperCase()}</Badge>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Welcome, {dashboard?.full_name || user?.full_name}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            {dashboard?.class_name ? (
              <>Class Teacher: <strong style={{ color: 'var(--text-primary)' }}>{dashboard.class_name}</strong> | </>
            ) : null}
            Teaching {dashboard?.subject_names?.length || 0} Subject(s)
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

      {/* ── LOW ATTENDANCE ALERT PANEL ── */}
      {lowAttendanceList.length > 0 && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.28)',
            borderLeft: '4px solid #f43f5e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
              <AlertTriangle size={18} />
              Low Attendance Alert — {lowAttendanceList.length} Student(s) Below 75%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {lowAttendanceList.slice(0, 4).map((s) => `${s.full_name} (${s.percentage}%)`).join(', ')}
              {lowAttendanceList.length > 4 ? ` and ${lowAttendanceList.length - 4} more...` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('mark-attendance')}
              style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                background: 'rgba(244,63,94,0.12)',
                border: '1px solid rgba(244,63,94,0.3)',
                color: '#fb7185', fontWeight: 600, fontSize: '0.825rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              <ArrowRight size={14} /> View Full List
            </button>
            <button
              onClick={handleNotifyLowAttendance}
              disabled={sendingAlert}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                border: 'none',
                color: '#fff', fontWeight: 700, fontSize: '0.825rem',
                cursor: sendingAlert ? 'not-allowed' : 'pointer',
                opacity: sendingAlert ? 0.75 : 1,
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(225,29,72,0.35)',
              }}
            >
              <Bell size={14} />
              {sendingAlert ? 'Sending...' : 'Broadcast Warning'}
            </button>
          </div>
        </div>
      )}

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
