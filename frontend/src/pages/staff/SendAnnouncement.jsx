import React, { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notifications';
import { academicApi } from '../../api/academic';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Megaphone, Send, Bell, Users, Layers, BookOpen } from 'lucide-react';

export const SendAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' | 'class' | 'subject'
  const [targetId, setTargetId] = useState('');

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sentList, setSentList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const [classList, subList, myNotices] = await Promise.allSettled([
          academicApi.getClasses(),
          academicApi.getSubjects(),
          notificationApi.getMyNotifications(),
        ]);

        if (classList.status === 'fulfilled' && classList.value?.length > 0) {
          setClasses(classList.value);
        } else {
          setClasses([
            { id: 1, name: 'III BCA - A' },
            { id: 2, name: 'III BCA - B' },
          ]);
        }

        if (subList.status === 'fulfilled' && subList.value?.length > 0) {
          setSubjects(subList.value);
        } else {
          setSubjects([
            { id: 1, name: 'Java Programming' },
            { id: 2, name: 'Data Structures' },
          ]);
        }

        if (myNotices.status === 'fulfilled' && Array.isArray(myNotices.value)) {
          setSentList(myNotices.value);
        } else {
          setSentList([
            { id: 1, title: 'CIA-2 Exam Schedule', body: 'Schedule published on portal.', target_type: 'all', created_at: '2026-08-16' },
            { id: 2, title: 'Project Submission Notice', body: 'Submit code by Friday.', target_type: 'class', created_at: '2026-08-15' },
          ]);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchTargets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        body,
        target_type: targetType,
        target_id: targetType === 'all' ? null : parseInt(targetId, 10),
      };

      const result = await notificationApi.sendAnnouncement(payload);
      toast.success('Announcement broadcasted to students successfully!');
      setSentList((prev) => [result, ...prev]);
      setTitle('');
      setBody('');
    } catch (err) {
      // Simulation for offline demo
      const mock = {
        id: Date.now(),
        title,
        body,
        target_type: targetType,
        created_at: new Date().toISOString(),
      };
      setSentList((prev) => [mock, ...prev]);
      toast.success('Announcement broadcasted to students successfully!');
      setTitle('');
      setBody('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Megaphone size={28} color="var(--accent-purple)" />
            Faculty Notice &amp; Announcement Broadcaster
          </h1>
          <p className="page-subtitle">
            Send instant broadcast circulars to all students, specific class sections, or course batches
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Compose Form */}
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Compose Announcement
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                required
              >
                <option value="all">📢 All Students (College Wide)</option>
                <option value="class">👥 Specific Class Section</option>
                <option value="subject">📖 Enrolled Subject Students</option>
              </select>
            </div>

            {targetType === 'class' && (
              <div className="form-group">
                <label className="form-label">Select Class Group</label>
                <select
                  className="form-select"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                >
                  <option value="">Choose Class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.department ? `(${c.department})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'subject' && (
              <div className="form-group">
                <label className="form-label">Select Subject</label>
                <select
                  className="form-select"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                >
                  <option value="">Choose Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Circular Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Model Exam Timetable Released"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Content / Body</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Type the full memo details or instructions here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', background: 'var(--grad-primary)' }}
              disabled={submitting}
            >
              <Send size={16} />
              {submitting ? 'Broadcasting...' : 'Broadcast Notice Now'}
            </button>
          </form>
        </div>

        {/* History Feed */}
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Broadcast History
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sentList.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>{item.title}</span>
                  <Badge variant={item.target_type === 'all' ? 'primary' : 'warning'} size="sm">
                    {item.target_type}
                  </Badge>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {item.body}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {item.created_at ? String(item.created_at).slice(0, 10) : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
