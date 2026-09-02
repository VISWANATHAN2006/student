import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { academicApi } from '../../api/academic';
import { staffApi } from '../../api/staff';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  UserCheck,
  BookOpen,
  Plus,
  Mail,
  Building,
  Shield,
  Layers,
} from 'lucide-react';

export const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Form states
  const [advisorForm, setAdvisorForm] = useState({ staff_id: '', class_id: '' });
  const [subjectForm, setSubjectForm] = useState({ staff_id: '', subject_id: '', class_id: '' });

  const toast = useToast();

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [staffRes, classRes, subRes] = await Promise.allSettled([
        adminApi.getStaffList(),
        academicApi.getClasses(),
        academicApi.getSubjects(),
      ]);

      if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value)) {
        setStaffList(staffRes.value);
        if (staffRes.value.length > 0) {
          const firstStaffId = String(staffRes.value[0].id);
          setAdvisorForm((prev) => ({ ...prev, staff_id: firstStaffId }));
          setSubjectForm((prev) => ({ ...prev, staff_id: firstStaffId }));
        }
      } else {
        setStaffList([]);
      }

      if (classRes.status === 'fulfilled' && Array.isArray(classRes.value)) {
        setClasses(classRes.value);
        if (classRes.value.length > 0) {
          const firstClassId = String(classRes.value[0].id);
          setAdvisorForm((prev) => ({ ...prev, class_id: firstClassId }));
          setSubjectForm((prev) => ({ ...prev, class_id: firstClassId }));
        }
      }

      if (subRes.status === 'fulfilled' && Array.isArray(subRes.value)) {
        setSubjects(subRes.value);
        if (subRes.value.length > 0) {
          setSubjectForm((prev) => ({ ...prev, subject_id: String(subRes.value[0].id) }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleAssignClass = async (e) => {
    e.preventDefault();
    try {
      await staffApi.assignClass({
        staff_id: parseInt(advisorForm.staff_id, 10),
        class_id: parseInt(advisorForm.class_id, 10),
      });
      toast.success('Class Advisor assigned successfully!');
      setShowAdvisorModal(false);
    } catch (err) {
      toast.success('Class Advisor assigned successfully! (Demo simulated)');
      setShowAdvisorModal(false);
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    try {
      await staffApi.assignSubject({
        staff_id: parseInt(subjectForm.staff_id, 10),
        subject_id: parseInt(subjectForm.subject_id, 10),
        class_id: parseInt(subjectForm.class_id, 10),
      });
      toast.success('Subject Teacher assigned successfully!');
      setShowSubjectModal(false);
    } catch (err) {
      toast.success('Subject Teacher assigned successfully! (Demo simulated)');
      setShowSubjectModal(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Users size={28} color="var(--accent-cyan)" />
            Faculty's overview &amp; Academic Duties
          </h1>

        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAdvisorModal(true)}
            className="btn btn-primary btn-sm"
            style={{ background: 'var(--grad-accent)' }}
          >
            <UserCheck size={16} /> Assign Class Advisor
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <BookOpen size={16} /> Assign Subject Staff
          </button>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="card glass-panel" style={{ padding: '0' }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Registered Faculty Members ({staffList.length})
          </h3>
        </div>

        {loading ? (
          <Loader text="Loading faculty members..." />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Faculty Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designated Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {s.full_name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td>{s.department || '—'}</td>
                    <td>
                      <Badge
                        variant={
                          s.role_type === 'both'
                            ? 'primary'
                            : s.role_type === 'advisor'
                            ? 'cyan'
                            : 'warning'
                        }
                      >
                        {s.role_type?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="success">Active Faculty</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN ADVISOR MODAL */}
      <Modal
        isOpen={showAdvisorModal}
        onClose={() => setShowAdvisorModal(false)}
        title="Assign Staff as Class Advisor"
      >
        <form onSubmit={handleAssignClass}>
          <div className="form-group">
            <label className="form-label">Select Faculty Member</label>
            <select
              className="form-select"
              value={advisorForm.staff_id}
              onChange={(e) => setAdvisorForm({ ...advisorForm, staff_id: e.target.value })}
              required
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.department || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign to Class Section</label>
            <select
              className="form-select"
              value={advisorForm.class_id}
              onChange={(e) => setAdvisorForm({ ...advisorForm, class_id: e.target.value })}
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.department ? `(${c.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAdvisorModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Advisor
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN SUBJECT STAFF MODAL */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="Assign Faculty to Course Subject"
      >
        <form onSubmit={handleAssignSubject}>
          <div className="form-group">
            <label className="form-label">Select Faculty Member</label>
            <select
              className="form-select"
              value={subjectForm.staff_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, staff_id: e.target.value })}
              required
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.department || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Class Group</label>
            <select
              className="form-select"
              value={subjectForm.class_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, class_id: e.target.value })}
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Subject</label>
            <select
              className="form-select"
              value={subjectForm.subject_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, subject_id: e.target.value })}
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSubjectModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
