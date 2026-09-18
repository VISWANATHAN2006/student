import React, { useState, useEffect } from 'react';
import { staffApi } from '../../api/staff';
import { academicApi } from '../../api/academic';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import {
  UserCheck,
  Plus,
  ListPlus,
  Users,
  CheckSquare,
  Square,
  Layers,
  Building,
  UploadCloud,
  FileText,
  Trash2,
  Filter,
} from 'lucide-react';

export const PreRegisterStudents = () => {
  const [preregs, setPreregs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Workflow Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Bulk Student Staging Rows
  const [stagedStudents, setStagedStudents] = useState([
    { id: 1, reg_no: '', full_name: '', selected: true },
    { id: 2, reg_no: '', full_name: '', selected: true },
    { id: 3, reg_no: '', full_name: '', selected: true },
  ]);

  // Paste Tool State
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Authorized List Selection
  const [selectedPreregIds, setSelectedPreregIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Single Form State
  const [singleForm, setSingleForm] = useState({
    reg_no: '',
    full_name: '',
  });

  const toast = useToast();

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadPreregs();
  }, [selectedClassId, selectedDept]);

  const loadMetadata = async () => {
    try {
      const [deptRes, classRes] = await Promise.allSettled([
        academicApi.getDepartments(),
        academicApi.getClasses(),
      ]);

      if (deptRes.status === 'fulfilled' && deptRes.value?.length > 0) {
        setDepartments(deptRes.value);
      }
      if (classRes.status === 'fulfilled' && classRes.value?.length > 0) {
        setClasses(classRes.value);
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const loadPreregs = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getPreRegistrations(
        selectedClassId ? parseInt(selectedClassId, 10) : null,
        selectedDept || null
      );
      setPreregs(data || []);
      setSelectedPreregIds(new Set());
    } catch (err) {
      toast.error('Failed to load student pre-registrations');
    } finally {
      setLoading(false);
    }
  };

  // Filter classes based on selected department
  const filteredClasses = selectedDept
    ? classes.filter((c) => !c.department || c.department.toLowerCase() === selectedDept.toLowerCase())
    : classes;

  // Staged Rows Handlers
  const handleStagedChange = (id, field, value) => {
    setStagedStudents((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleToggleSelectStaged = (id) => {
    setStagedStudents((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: !row.selected } : row))
    );
  };

  const handleToggleSelectAllStaged = () => {
    const allSelected = stagedStudents.every((r) => r.selected);
    setStagedStudents((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  };

  const handleAddRow = () => {
    const newId = stagedStudents.length > 0 ? Math.max(...stagedStudents.map((r) => r.id)) + 1 : 1;
    setStagedStudents((prev) => [...prev, { id: newId, reg_no: '', full_name: '', selected: true }]);
  };

  const handleRemoveRow = (id) => {
    if (stagedStudents.length <= 1) {
      setStagedStudents([{ id: 1, reg_no: '', full_name: '', selected: true }]);
      return;
    }
    setStagedStudents((prev) => prev.filter((r) => r.id !== id));
  };

  // Quick Paste Parser
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      setShowPasteModal(false);
      return;
    }
    const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map((line, idx) => {
      // Split by comma or tab
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      const reg_no = parts[0]?.trim() || '';
      const full_name = parts[1]?.trim() || '';
      return {
        id: Date.now() + idx,
        reg_no,
        full_name,
        selected: true,
      };
    }).filter((r) => r.reg_no || r.full_name);

    if (parsed.length > 0) {
      setStagedStudents(parsed);
      toast.success(`Loaded ${parsed.length} student entries from text!`);
    } else {
      toast.warning('Could not parse any valid lines (Format: RegNo, Full Name)');
    }
    setShowPasteModal(false);
    setPasteText('');
  };

  // Submit Selected Staged Students (Bulk Add Workflow)
  const handleBulkAddSelected = async () => {
    const selectedRows = stagedStudents.filter((r) => r.selected && r.reg_no.trim() && r.full_name.trim());
    if (selectedRows.length === 0) {
      toast.warning('Please enter Reg No & Name and ensure at least one student is selected.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = selectedRows.map((r) => ({
        reg_no: r.reg_no.trim(),
        full_name: r.full_name.trim(),
        department: selectedDept || null,
        class_id: selectedClassId ? parseInt(selectedClassId, 10) : null,
      }));

      const res = await staffApi.bulkPreRegister(payload);
      toast.success(res.message || `Successfully added ${selectedRows.length} students!`);
      // Reset staging
      setStagedStudents([
        { id: 1, reg_no: '', full_name: '', selected: true },
        { id: 2, reg_no: '', full_name: '', selected: true },
        { id: 3, reg_no: '', full_name: '', selected: true },
      ]);
      loadPreregs();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to bulk add students.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Single Student
  const handleSingleAdd = async (e) => {
    e.preventDefault();
    if (!singleForm.reg_no.trim() || !singleForm.full_name.trim()) return;

    setSubmitting(true);
    try {
      await staffApi.bulkPreRegister([
        {
          reg_no: singleForm.reg_no.trim(),
          full_name: singleForm.full_name.trim(),
          department: selectedDept || null,
          class_id: selectedClassId ? parseInt(selectedClassId, 10) : null,
        },
      ]);
      toast.success('Student pre-registered successfully!');
      setSingleForm({ reg_no: '', full_name: '' });
      loadPreregs();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to pre-register student');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter existing preregs
  const displayPreregs = preregs.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.reg_no && p.reg_no.toLowerCase().includes(q)) ||
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q))
    );
  });

  const handleToggleSelectPrereg = (id) => {
    setSelectedPreregIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllPreregs = () => {
    if (selectedPreregIds.size === displayPreregs.length) {
      setSelectedPreregIds(new Set());
    } else {
      setSelectedPreregIds(new Set(displayPreregs.map((p) => p.id)));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <UserCheck size={28} color="var(--primary-400)" />
            Student Enrollment &amp; Pre-Registration
          </h1>
          <p className="page-subtitle">
            Authorize new students by Department and Class, and manage cohort enrollment with bulk addition
          </p>
        </div>
      </div>

      {/* STEP 1: SELECT DEPARTMENT & CLASS (Filter Header) */}
      <div className="card glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Step 1: Select Target Department &amp; Class / Section
          </h3>
        </div>

        <div className="form-grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={15} /> Select Department
              </span>
            </label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedClassId(''); // reset class when department changes
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={15} /> Select Year / Class Section
              </span>
            </label>
            <select
              className="form-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">All Classes in Department</option>
              {filteredClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.department ? `(${c.department})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: BULK STUDENT ADD WORKFLOW */}
      <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListPlus size={20} color="var(--primary-400)" />
              Step 2: Add Students to{' '}
              <span style={{ color: 'var(--accent-cyan)' }}>
                {selectedClassId
                  ? classes.find((c) => String(c.id) === String(selectedClassId))?.name || 'Selected Class'
                  : selectedDept || 'Selected Group'}
              </span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Enter or paste student records. Check the students you want to enroll and click &quot;Add Selected Students&quot;.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={15} /> Paste Multi-Line List
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} /> Add Row
            </button>
          </div>
        </div>

        {/* Staging Table */}
        <div className="table-container" style={{ marginBottom: '1.25rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleToggleSelectAllStaged}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                    title="Select All Rows"
                  >
                    {stagedStudents.every((r) => r.selected) ? (
                      <CheckSquare size={17} color="var(--accent-cyan)" />
                    ) : (
                      <Square size={17} color="var(--text-muted)" />
                    )}
                  </button>
                </th>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ width: '220px' }}>Register Number *</th>
                <th>Full Name *</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stagedStudents.map((row, idx) => (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleSelectStaged(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {row.selected ? (
                        <CheckSquare size={17} color="var(--accent-cyan)" />
                      ) : (
                        <Square size={17} color="var(--text-muted)" />
                      )}
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 23BCA101"
                      style={{ padding: '0.4rem 0.65rem', fontFamily: 'var(--font-mono)' }}
                      value={row.reg_no}
                      onChange={(e) => handleStagedChange(row.id, 'reg_no', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Anand Kumar"
                      style={{ padding: '0.4rem 0.65rem' }}
                      value={row.full_name}
                      onChange={(e) => handleStagedChange(row.id, 'full_name', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}
                      title="Remove Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit Actions Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Selected: <strong style={{ color: 'var(--accent-cyan)' }}>{stagedStudents.filter((r) => r.selected).length}</strong> of{' '}
            <strong>{stagedStudents.length}</strong> candidates ready to add
          </div>

          <button
            type="button"
            onClick={handleBulkAddSelected}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={17} />
            {submitting ? 'Adding Students...' : 'Add Selected Students'}
          </button>
        </div>
      </div>

      {/* STEP 3: ROSTER OF AUTHORIZED STUDENTS */}
      <div className="card glass-panel" style={{ padding: 0 }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--accent-cyan)" />
              Authorized Students Roster ({displayPreregs.length})
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Students pre-registered and permitted to create accounts for this department &amp; class
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search Reg No or Name..."
              className="form-input"
              style={{ width: '220px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={loadPreregs} className="btn btn-secondary btn-sm">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <Loader text="Loading student enrollment list..." />
        ) : displayPreregs.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No authorized students found for the selected department &amp; class filter.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={handleToggleSelectAllPreregs}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                      title="Select All"
                    >
                      {selectedPreregIds.size === displayPreregs.length ? (
                        <CheckSquare size={17} color="var(--accent-cyan)" />
                      ) : (
                        <Square size={17} color="var(--text-muted)" />
                      )}
                    </button>
                  </th>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Register No</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayPreregs.map((p, idx) => {
                  const isChecked = selectedPreregIds.has(p.id);
                  const classObj = classes.find((c) => c.id === p.class_id);
                  return (
                    <tr key={p.id} style={{ background: isChecked ? 'rgba(6, 182, 212, 0.05)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelectPrereg(p.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {isChecked ? (
                            <CheckSquare size={17} color="var(--accent-cyan)" />
                          ) : (
                            <Square size={17} color="var(--text-muted)" />
                          )}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.reg_no}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.full_name}</td>
                      <td>{p.department || '—'}</td>
                      <td>{classObj ? classObj.name : '—'}</td>
                      <td>
                        <Badge variant="cyan">Authorized</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK PASTE MODAL */}
      {showPasteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Paste Multi-Line Student List
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Paste one student per line in <code>Register_No, Full_Name</code> or tab-separated format:
            </p>
            <textarea
              className="form-input"
              rows={8}
              placeholder={`23BCA101, Anand Kumar\n23BCA102, Bhavana R\n23BCA103, Chandru M`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '1.25rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParsePaste}
                className="btn btn-primary"
              >
                Load into Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
