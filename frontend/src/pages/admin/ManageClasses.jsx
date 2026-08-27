import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/academic';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  BookOpen,
  Plus,
  Building,
  CheckCircle,
  Hash,
  Trash2,
  Edit2
} from 'lucide-react';

export const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);

  // Form states
  const [className, setClassName] = useState('');
  const [department, setDepartment] = useState('Computer Applications');
  const [subjectName, setSubjectName] = useState('');
  const [subjectClassId, setSubjectClassId] = useState('');
  
  const [editClassForm, setEditClassForm] = useState({ id: null, name: '', department: '' });
  const [editSubjectForm, setEditSubjectForm] = useState({ id: null, name: '', class_id: '' });

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classList, subList] = await Promise.allSettled([
        academicApi.getClasses(),
        academicApi.getSubjects(selectedClassId ? parseInt(selectedClassId, 10) : null),
      ]);

      if (classList.status === 'fulfilled' && Array.isArray(classList.value)) {
        setClasses(classList.value);
        if (!subjectClassId && classList.value.length > 0) {
          setSubjectClassId(String(classList.value[0].id));
        }
      } else {
        setClasses([]);
      }

      if (subList.status === 'fulfilled' && Array.isArray(subList.value)) {
        setSubjects(subList.value);
      } else {
        setSubjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClassId]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await academicApi.createClass({ name: className, department });
      toast.success(`Class group "${className}" created successfully!`);
      setClassName('');
      setShowClassModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create class');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await academicApi.createSubject({
        name: subjectName,
        class_id: parseInt(subjectClassId, 10),
      });
      toast.success(`Subject "${subjectName}" created successfully!`);
      setSubjectName('');
      setShowSubjectModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create subject');
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      await academicApi.updateClass(editClassForm.id, {
        name: editClassForm.name,
        department: editClassForm.department,
      });
      toast.success('Class updated successfully!');
      setShowEditClassModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class? This may fail if there are assigned students or subjects.')) return;
    try {
      await academicApi.deleteClass(id);
      toast.success('Class deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete class');
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      await academicApi.updateSubject(editSubjectForm.id, {
        name: editSubjectForm.name,
        class_id: parseInt(editSubjectForm.class_id, 10),
      });
      toast.success('Subject updated successfully!');
      setShowEditSubjectModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await academicApi.deleteSubject(id);
      toast.success('Subject deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  const getClassName = (cid) => {
    const c = classes.find((item) => item.id === cid);
    return c ? c.name : `Class #${cid}`;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Layers size={28} color="var(--primary-400)" />
            Academic Structure: Classes &amp; Subjects
          </h1>
          <p className="page-subtitle">
            Configure institutional degree batches, class sections, and map curriculum course papers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowClassModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Create Class
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Classes List */}
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="var(--primary-400)" />
              Active Classes ({classes.length})
            </h3>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Class Name</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td>{c.department || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditClassForm({ id: c.id, name: c.name, department: c.department || '' });
                            setShowEditClassModal(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleDeleteClass(c.id)}
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subjects List */}
        <div className="card glass-panel" style={{ padding: '0' }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--accent-cyan)" />
              Curriculum Subjects ({subjects.length})
            </h3>

            {/* Filter by class */}
            <select
              className="form-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: '150px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject Name</th>
                  <th>Mapped Class</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td>
                      <Badge variant="cyan" size="sm">
                        {getClassName(s.class_id)}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditSubjectForm({ id: s.id, name: s.name, class_id: String(s.class_id) });
                            setShowEditSubjectModal(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleDeleteSubject(s.id)}
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE CLASS MODAL */}
      <Modal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        title="Create New Academic Class Section"
      >
        <form onSubmit={handleCreateClass}>
          <div className="form-group">
            <label className="form-label">Class / Section Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. III BCA - A, II B.Sc CS"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Computer Applications"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowClassModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Class
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE SUBJECT MODAL */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="Add Subject to Class Group"
      >
        <form onSubmit={handleCreateSubject}>
          <div className="form-group">
            <label className="form-label">Target Class *</label>
            <select
              className="form-select"
              value={subjectClassId}
              onChange={(e) => setSubjectClassId(e.target.value)}
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.department ? `(${c.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject Course Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python Programming &amp; Frameworks"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
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
              Save Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CLASS MODAL */}
      <Modal
        isOpen={showEditClassModal}
        onClose={() => setShowEditClassModal(false)}
        title="Edit Academic Class Section"
      >
        <form onSubmit={handleUpdateClass}>
          <div className="form-group">
            <label className="form-label">Class / Section Name *</label>
            <input
              type="text"
              className="form-input"
              value={editClassForm.name}
              onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <input
              type="text"
              className="form-input"
              value={editClassForm.department}
              onChange={(e) => setEditClassForm({ ...editClassForm, department: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditClassModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SUBJECT MODAL */}
      <Modal
        isOpen={showEditSubjectModal}
        onClose={() => setShowEditSubjectModal(false)}
        title="Edit Subject"
      >
        <form onSubmit={handleUpdateSubject}>
          <div className="form-group">
            <label className="form-label">Target Class *</label>
            <select
              className="form-select"
              value={editSubjectForm.class_id}
              onChange={(e) => setEditSubjectForm({ ...editSubjectForm, class_id: e.target.value })}
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.department ? `(${c.department})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject Course Title *</label>
            <input
              type="text"
              className="form-input"
              value={editSubjectForm.name}
              onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditSubjectModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
