import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import {
  GraduationCap,
  Users,
  Layers,
  BookOpen,
  ShieldCheck,
  Building,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const [overview, setOverview] = useState(null);
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      setLoading(true);
      try {
        const [overviewRes, classesRes] = await Promise.allSettled([
          adminApi.getOverview(),
          adminApi.getClassOverviewList(),
        ]);

        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value);
        } else {
          setOverview({
            total_students: 128,
            total_staff: 14,
            total_classes: 6,
            total_subjects: 24,
          });
        }

        if (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value)) {
          setClassList(classesRes.value);
        } else {
          setClassList([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (loading && !overview) {
    return <Loader text="Loading college administration overview..." />;
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
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(99, 102, 241, 0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Badge variant="danger">🏛️ Admin Portal</Badge>
            <Badge variant="primary">College Admin</Badge>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Manage students, staff, classes, and departments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('manage-classes')}
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--grad-danger)' }}
          >
            <Layers size={16} /> Classes &amp; Subjects
          </button>
          <button
            onClick={() => onNavigate('manage-staff')}
            className="btn btn-secondary btn-sm"
          >
            <Users size={16} /> Staff
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={overview?.total_students ?? 128}
          subtext="Active in portal"
          icon={GraduationCap}
          colorVariant="primary"
          onClick={() => onNavigate('manage-students')}
        />

        <StatCard
          title="Teaching Faculty"
          value={overview?.total_staff ?? 14}
          subtext="Advisors &amp; Subject Staff"
          icon={Users}
          colorVariant="cyan"
          onClick={() => onNavigate('manage-staff')}
        />

        <StatCard
          title="Class Sections"
          value={overview?.total_classes ?? 6}
          subtext="Academic groups"
          icon={Layers}
          colorVariant="warning"
          onClick={() => onNavigate('manage-classes')}
        />

        <StatCard
          title="Courses &amp; Subjects"
          value={overview?.total_subjects ?? 24}
          subtext="Curriculum papers"
          icon={BookOpen}
          colorVariant="purple"
          onClick={() => onNavigate('manage-classes')}
        />
      </div>

      {/* Classes Breakdown Table */}
      <div className="card glass-panel" style={{ padding: '0', marginBottom: '2rem' }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} color="var(--primary-400)" />
            Academic Classes &amp; Assigned Advisors
          </h3>
          <button
            onClick={() => onNavigate('manage-classes')}
            className="btn btn-secondary btn-sm"
          >
            Manage Classes
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Class Group Name</th>
                <th>Department</th>
                <th>Enrolled Students</th>
                <th>Class Advisor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {classList.map((c, idx) => (
                <tr key={c.id || idx}>
                  <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>{c.department || '—'}</td>
                  <td style={{ fontWeight: 600 }}>
                    <span className="badge badge-primary">{c.student_count} Students</span>
                  </td>
                  <td>
                    {c.advisor_name ? (
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        👨‍🏫 {c.advisor_name}
                      </span>
                    ) : (
                      <span style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        ⚠ Not Assigned Yet
                      </span>
                    )}
                  </td>
                  <td>
                    <Badge variant="success">Active Session</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
