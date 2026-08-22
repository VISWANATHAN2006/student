import React, { useState, useEffect } from 'react';
import { staffApi } from '../../api/staff';
import { academicApi } from '../../api/academic';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { UserCheck, Plus, ListPlus } from 'lucide-react';

export const PreRegisterStudents = () => {
  const [preregs, setPreregs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    reg_no: '',
    full_name: '',
    department: '',
    class_id: ''
  });
  
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [preregRes, deptRes, classRes] = await Promise.allSettled([
        staffApi.getPreRegistrations(),
        academicApi.getDepartments(),
        academicApi.getClasses()
      ]);
      
      if (preregRes.status === 'fulfilled') setPreregs(preregRes.value || []);
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value || []);
      if (classRes.status === 'fulfilled') setClasses(classRes.value || []);
      
    } catch (err) {
      toast.error('Failed to load pre-registration data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.reg_no || !formData.full_name) return;
    
    setSubmitting(true);
    try {
      await staffApi.bulkPreRegister([
        {
          reg_no: formData.reg_no.trim(),
          full_name: formData.full_name.trim(),
          department: formData.department || null,
          class_id: formData.class_id ? parseInt(formData.class_id) : null
        }
      ]);
      toast.success('Student pre-registered successfully');
      setFormData({ reg_no: '', full_name: '', department: '', class_id: '' });
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to pre-register student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <UserCheck size={28} color="var(--primary-400)" />
            Pre-Register Students
          </h1>
          <p className="page-subtitle">Authorize students to create accounts on the portal</p>
        </div>
      </div>

      <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        <h2 className="form-title">Authorize a Student</h2>
        <form onSubmit={handleAdd} className="form-layout">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Register Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.reg_no}
                onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Department (Optional)</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Class (Optional)</label>
              <select
                className="form-select"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authorizing...' : <><Plus size={18} /> Authorize Student Registration</>}
          </button>
        </form>
      </div>

      <div className="card glass-panel" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Authorized Students ({preregs.length})</h3>
        </div>
        
        {loading ? (
          <Loader text="Loading authorized list..." />
        ) : preregs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students have been pre-registered yet.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Register No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preregs.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.reg_no}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.full_name}</td>
                    <td>{p.department || '—'}</td>
                    <td>
                      <Badge variant="cyan">Authorized</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
