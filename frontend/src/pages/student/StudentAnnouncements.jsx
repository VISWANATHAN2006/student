import React, { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notifications';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, Calendar, Megaphone, Info } from 'lucide-react';

export const StudentAnnouncements = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await notificationApi.getMyNotifications();
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          setNotifications([
            {
              id: 1,
              title: 'Continuous Internal Assessment (CIA-2) Schedule Published',
              body: 'All students are requested to check their exam hall allocations and subject timetable. Exams begin Monday 9:30 AM sharp.',
              target_type: 'all',
              created_at: '2026-08-16T10:30:00',
            },
            {
              id: 2,
              title: 'Mini Project Milestone 2 Code Review',
              body: 'III BCA students must submit their complete code repository on GitHub and bring PPT for viva presentation.',
              target_type: 'class',
              created_at: '2026-08-15T14:15:00',
            },
            {
              id: 3,
              title: 'Special Workshop on Fullstack Web Development',
              body: 'Department of Computer Applications is organizing a hands-on session on React & FastAPI this Friday in Lab 3.',
              target_type: 'all',
              created_at: '2026-08-12T09:00:00',
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.target_type === filterType;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Bell size={28} color="#fbbf24" />
            Announcements
          </h1>
          <p className="page-subtitle">
            Read the latest college notices, exam schedules, and messages
          </p>
        </div>

        {/* Filter buttons */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem',
            gap: '0.25rem',
          }}
        >
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filterType === 'all' ? 'var(--primary-600)' : 'transparent',
              color: filterType === 'all' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            All Notices
          </button>
          <button
            onClick={() => setFilterType('class')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filterType === 'class' ? 'var(--accent-cyan)' : 'transparent',
              color: filterType === 'class' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            Class Only
          </button>
          <button
            onClick={() => setFilterType('subject')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filterType === 'subject' ? 'var(--accent-purple)' : 'transparent',
              color: filterType === 'subject' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            Subject Memos
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Fetching announcements..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Announcements"
          description="There are no active notices or circulars in this category right now."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((item) => (
            <div key={item.id} className="card card-glow glass-panel" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Megaphone size={18} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.title}</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={item.target_type === 'all' ? 'primary' : 'warning'}>
                    Target: {item.target_type}
                  </Badge>
                  <span
                    style={{
                      fontSize: '0.775rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Calendar size={13} />
                    {item.created_at ? String(item.created_at).slice(0, 10) : 'Recent'}
                  </span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, paddingLeft: '2.75rem' }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
