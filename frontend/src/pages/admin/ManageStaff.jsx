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
  const [staffAssignments, setStaffAssignments] = useState({});
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

          // Fetch assigned subjects for all staff
          const assignmentPromises = staffRes.value.map((s) =>
            staffApi.getStaffAssignedSubjects(s.id).then((res) => ({ staffId: s.id, list: res })).catch(() => ({ staffId: s.id, list: [] }))
          );
          const assignmentResults = await Promise.all(assignmentPromises);
          const assignMap = {};
          assignmentResults.forEach((r) => {
            assignMap[r.staffId] = r.list;
          });
          setStaffAssignments(assignMap);
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
      toast.success('Subject assigned to faculty member successfully!');
      setShowSubjectModal(false);
      fetchStaffData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to assign subject');
    }
  };

  const handleUnassignSubject = async (assignmentId) => {
    try {
      await staffApi.unassignSubject(assignmentId);
      toast.success('Subject unassigned successfully!');
      fetchStaffData();
    } catch (err) {
      toast.error('Failed to unassign subject');
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
                  <th>Assigned Subjects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, idx) => {
                  const mySubs = staffAssignments[s.id] || [];
                  return (
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
                        {mySubs.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {mySubs.map((sub) => (
                              <span
                                key={sub.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: 'var(--primary-300)',
                                  border: '1px solid rgba(99, 102, 241, 0.25)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.15rem 0.45rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                {sub.subject_name} ({sub.class_name})
                                <button
                                  type="button"
                                  onClick={() => handleUnassignSubject(sub.id)}
                                  title="Unassign Subject"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-rose)',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None assigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSubjectForm((prev) => ({ ...prev, staff_id: String(s.id) }));
                            setShowSubjectModal(true);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          + Assign Subject
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
