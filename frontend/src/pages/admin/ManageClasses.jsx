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
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);

  // Form states for Create Class
  const [className, setClassName] = useState('A');
  const [department, setDepartment] = useState('B.Tech (AI&DS)');
  const [classYear, setClassYear] = useState('2nd Year');
  const [classSection, setClassSection] = useState('A');
  const [namingFormat, setNamingFormat] = useState('section'); // 'section' ("A") or 'year_section' ("2nd Year - A")

  const [subjectName, setSubjectName] = useState('');
  const [subjectClassId, setSubjectClassId] = useState('');
  
  const [editClassForm, setEditClassForm] = useState({ id: null, name: '', department: '' });
  const [editSubjectForm, setEditSubjectForm] = useState({ id: null, name: '', class_id: '' });

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classList, subList, deptList] = await Promise.allSettled([
        academicApi.getClasses(),
        academicApi.getSubjects(selectedClassId ? parseInt(selectedClassId, 10) : null),
        academicApi.getDepartments(),
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

      if (deptList.status === 'fulfilled' && Array.isArray(deptList.value)) {
        setDepartments(deptList.value);
        if (deptList.value.length > 0 && !department) {
          setDepartment(deptList.value[0].name);
        }
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
    const finalName = namingFormat === 'year_section' ? `${classYear} - ${classSection}` : classSection;
    try {
      await academicApi.createClass({ name: finalName, department });
      toast.success(`Class "${finalName}" added to ${department} successfully!`);
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
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Building size={18} color="var(--primary-400)" />
              Active Classes ({classes.filter(c => deptFilter === 'ALL' || c.department === deptFilter).length})
            </h3>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dept:</span>
              <select
                className="form-select"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', minWidth: '150px' }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Class / Section</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes
                  .filter((c) => deptFilter === 'ALL' || c.department === deptFilter)
                  .map((c, idx) => (
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
        title="Create Academic Class (Department A / B)"
      >
        <form onSubmit={handleCreateClass}>
          {/* Department Selection */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Department *</label>
            {departments.length > 0 ? (
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech (AI&DS) or B.E (CSE)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            )}
          </div>

          {/* Academic Year */}
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year / Semester *</label>
              <select
                className="form-select"
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                required
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Class Section (A / B / C / D) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Class Section *</label>
              <select
                className="form-select"
                value={classSection}
                onChange={(e) => setClassSection(e.target.value)}
                required
              >
                <option value="A">Class A</option>
                <option value="B">Class B</option>
                <option value="C">Class C</option>
                <option value="D">Class D</option>
              </select>
            </div>
          </div>

          {/* Naming format option */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Class Name Stored As:</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="namingFormat"
                  value="section"
                  checked={namingFormat === 'section'}
                  onChange={() => setNamingFormat('section')}
                />
                Section Only (e.g. &quot;{classSection}&quot;)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="namingFormat"
                  value="year_section"
                  checked={namingFormat === 'year_section'}
                  onChange={() => setNamingFormat('year_section')}
                />
                Year &amp; Section (e.g. &quot;{classYear} - {classSection}&quot;)
              </label>
            </div>
          </div>

          {/* Preview Banner */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Preview: </span>
            <strong style={{ color: 'var(--primary-400)' }}>
              {namingFormat === 'year_section' ? `${classYear} - ${classSection}` : classSection}
            </strong>
            <span style={{ color: 'var(--text-muted)' }}> under </span>
            <strong style={{ color: 'var(--text-primary)' }}>{department}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
              placeholder="Enter subject / course title"
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
