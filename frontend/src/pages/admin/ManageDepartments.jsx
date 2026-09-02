import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/academic';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { Layers, Plus, Trash2, Edit2 } from 'lucide-react';

export const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [newDept, setNewDept] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDept, setEditDept] = useState({ id: null, name: '' });
  const toast = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await academicApi.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    
    setSubmitting(true);
    try {
      await academicApi.createDepartment({ name: newDept.trim() });
      toast.success('Department added successfully');
      setNewDept('');
      loadDepartments();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to add department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDept.name.trim()) return;
    
    setSubmitting(true);
    try {
      await academicApi.updateDepartment(editDept.id, { name: editDept.name.trim() });
      toast.success('Department updated successfully');
      setShowEditModal(false);
      loadDepartments();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await academicApi.deleteDepartment(id);
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete department. It may be in use.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Layers size={28} color="var(--primary-400)" />
            Manage Departments
          </h1>
          <p className="page-subtitle">Add and configure college departments</p>
        </div>
      </div>

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
        <h2 className="form-title">Add New Department</h2>
        <form onSubmit={handleAddDept} className="form-layout">
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="Enter department name"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : <><Plus size={18} /> Add Department</>}
          </button>
        </form>
      </div>

      <div className="card glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Departments ({departments.length})</h3>
        </div>
        
        {loading ? (
          <Loader text="Loading departments..." />
        ) : departments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No departments found. Add one above.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => (
                  <tr key={dept.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditDept({ id: dept.id, name: dept.name });
                            setShowEditModal(true);
                          }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleDelete(dept.id)}
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Department"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              value={editDept.name}
              onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
