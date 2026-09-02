import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import { notificationApi } from '../../api/notifications';
import { StatCard } from '../../components/common/StatCard';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Bell,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  User,
  GraduationCap
} from 'lucide-react';

export const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [dashData, noticesData] = await Promise.allSettled([
          studentsApi.getDashboard(),
          notificationApi.getMyNotifications(),
        ]);

        if (dashData.status === 'fulfilled') {
          setStats(dashData.value);
        } else {
          setStats({
            full_name: user?.full_name || '',
            reg_no: user?.reg_no || '',
            class_name: '',
            attendance_percentage: 0,
            total_marks_obtained: 0,
            total_max_marks: 0,
            subject_count: 0,
            unread_notification_count: 0,
          });
        }

        if (noticesData.status === 'fulfilled' && Array.isArray(noticesData.value)) {
          setRecentNotices(noticesData.value.slice(0, 4));
        } else {
          setRecentNotices([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  if (loading && !stats) {
    return <Loader text="Loading your student profile and metrics..." />;
  }

  const marksPercentage = stats?.total_max_marks > 0
    ? ((stats.total_marks_obtained / stats.total_max_marks) * 100).toFixed(1)
    : '0';

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Badge variant="primary">🎓 Student Portal</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reg No: <strong>{stats?.reg_no || '953621104001'}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Welcome back, {stats?.full_name || user?.full_name}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Class: <strong style={{ color: 'var(--text-primary)' }}>{stats?.class_name || 'Enrolled Class'}</strong> | Semester Academic Progress Overview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('attendance')}
            className="btn btn-primary btn-sm"
          >
            <CalendarCheck size={16} /> Attendance Tracker
          </button>
          <button
            onClick={() => onNavigate('notes')}
            className="btn btn-secondary btn-sm"
          >
            <BookOpen size={16} /> View Notes
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendance_percentage ?? 0}%`}
          subtext={
            stats?.attendance_percentage >= 75 ? (
              <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <CheckCircle2 size={13} /> Eligible for exams (&gt;75%)
              </span>
            ) : (
              <span style={{ color: '#fb7185' }}>⚠ Low Attendance Warning (&lt;75%)</span>
            )
          }
          icon={CalendarCheck}
          colorVariant={stats?.attendance_percentage >= 75 ? 'success' : 'danger'}
          onClick={() => onNavigate('attendance')}
        />

        <StatCard
          title="Internal Marks Total"
          value={`${stats?.total_marks_obtained ?? 0} / ${stats?.total_max_marks ?? 0}`}
          subtext={`Cumulative Score: ${marksPercentage}%`}
          icon={Award}
          colorVariant="warning"
          onClick={() => onNavigate('marks')}
        />

        <StatCard
          title="Active Subjects"
          value={stats?.subject_count ?? 6}
          subtext="Enrolled this semester"
          icon={BookOpen}
          colorVariant="cyan"
          onClick={() => onNavigate('notes')}
        />

        <StatCard
          title="Notices &amp; Circulars"
          value={recentNotices.length}
          subtext="Latest announcements"
          icon={Bell}
          colorVariant="purple"
          onClick={() => onNavigate('announcements')}
        />
      </div>

      {/* Two Column Layout: Performance Chart & Recent Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Attendance & Performance Progress Meter */}
        <div className="card glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary-400)" /> Attendance Health Meter
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target: 85%+</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Present Percentage</span>
              <strong style={{ color: stats?.attendance_percentage >= 75 ? '#34d399' : '#fb7185' }}>
                {stats?.attendance_percentage ?? 0}%
              </strong>
            </div>

            <div
              style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, stats?.attendance_percentage || 0))}%`,
                  height: '100%',
                  background:
                    stats?.attendance_percentage >= 75 ? 'var(--grad-success)' : 'var(--grad-danger)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 1s ease-in-out',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span>0%</span>
              <span style={{ color: '#fbbf24' }}>75% Minimum Required</span>
              <span>100%</span>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Quick Navigation Shortcuts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                onClick={() => onNavigate('attendance')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
              >
                <span>Full Attendance Log</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('marks')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
              >
                <span>Grade Breakdown</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('notes')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
              >
                <span>Syllabus Notes</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('question-bank')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between' }}
              >
                <span>Question Bank</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Announcements Feed */}
        <div className="card glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="#fbbf24" /> Official Announcements
            </h3>
            <button
              onClick={() => onNavigate('announcements')}
              className="btn-ghost btn-sm"
              style={{ fontSize: '0.8rem', color: 'var(--primary-400)' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentNotices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No announcements right now
              </div>
            ) : (
              recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notice.title}</span>
                    <Badge variant={notice.target_type === 'all' ? 'primary' : 'warning'} size="sm">
                      {notice.target_type}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {notice.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
