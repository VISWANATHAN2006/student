import React, { useState, useEffect } from 'react';
import { marksApi } from '../../api/marks';
import { academicApi } from '../../api/academic';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ClipboardList,
  FileSpreadsheet,
  Upload,
  PlusCircle,
  Table,
  Layers,
  BookOpen,
  Award,
  CheckCircle,
  Download,
} from 'lucide-react';

export const ManageMarks = () => {
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'single' | 'bulk'
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('1');

  // Single Mark Form State
  const [singleForm, setSingleForm] = useState({
    student_id: '1',
    subject_id: '1',
    assessment_type: 'CIA-1',
    marks_obtained: '',
    max_marks: '20',
  });

  // Sheet Data State
  const [sheetData, setSheetData] = useState(null);
  const [loadingSheet, setLoadingSheet] = useState(false);

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkMaxMarks, setBulkMaxMarks] = useState(20);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const toast = useToast();

  // Load Classes and Subjects
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [classList, subjectList, studentList] = await Promise.allSettled([
          academicApi.getClasses(),
          academicApi.getSubjects(),
          adminApi.getStudentList(),
        ]);

        if (classList.status === 'fulfilled' && classList.value?.length > 0) {
          setClasses(classList.value);
          setSelectedClass(String(classList.value[0].id));
        } else {
          setClasses([
            { id: 1, name: 'III BCA - A', department: 'Computer Applications' },
            { id: 2, name: 'III BCA - B', department: 'Computer Applications' },
          ]);
        }

        if (subjectList.status === 'fulfilled' && subjectList.value?.length > 0) {
          setSubjects(subjectList.value);
          setSelectedSubject(String(subjectList.value[0].id));
          setSingleForm((prev) => ({ ...prev, subject_id: String(subjectList.value[0].id) }));
        } else {
          setSubjects([
            { id: 1, name: 'Java Programming', class_id: 1 },
            { id: 2, name: 'Data Structures', class_id: 1 },
            { id: 3, name: 'Database Systems', class_id: 1 },
          ]);
        }

        if (studentList.status === 'fulfilled' && studentList.value?.length > 0) {
          setStudents(studentList.value);
          setSingleForm((prev) => ({ ...prev, student_id: String(studentList.value[0].id) }));
        } else {
          setStudents([
            { id: 1, full_name: 'Viswanathan R', reg_no: '953621104001' },
            { id: 2, full_name: 'Aravind Kumar M', reg_no: '953621104002' },
            { id: 3, full_name: 'Divya Bharathi S', reg_no: '953621104003' },
            { id: 4, full_name: 'Gowtham Raj P', reg_no: '953621104004' },
          ]);
        }
      } catch (err) {
        // Fallback initialized
      }
    };

    fetchInitialData();
  }, []);

  // Fetch Class Sheet Matrix
  const loadSheet = async () => {
    setLoadingSheet(true);
    try {
      const data = await marksApi.getClassMarksSheet(
        parseInt(selectedClass, 10),
        parseInt(selectedSubject, 10)
      );
      setSheetData(data);
    } catch (err) {
      setSheetData({ assessment_columns: [], rows: [] });
      toast.error('Failed to load class marks sheet.');
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sheet') {
      loadSheet();
    }
  }, [selectedClass, selectedSubject, activeTab]);

  // Submit Single Mark
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      await marksApi.addMark({
        student_id: parseInt(singleForm.student_id, 10),
        subject_id: parseInt(singleForm.subject_id, 10),
        assessment_type: singleForm.assessment_type,
        marks_obtained: parseFloat(singleForm.marks_obtained),
        max_marks: parseFloat(singleForm.max_marks),
      });
      toast.success('Marks recorded successfully!');
      setSingleForm((prev) => ({ ...prev, marks_obtained: '' }));
      if (activeTab === 'sheet') loadSheet();
    } catch (err) {
      toast.error('Failed to save mark entry.');
    }
  };

  // Submit Bulk Excel Upload
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.warning('Please select an Excel (.xlsx / .xls) file to upload');
      return;
    }

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await marksApi.bulkUploadMarks({
        subjectId: selectedSubject,
        classId: selectedClass,
        maxMarks: bulkMaxMarks,
        file: bulkFile,
      });
      setBulkResult(res);
      toast.success(`Bulk upload processed! ${res.saved} records saved.`);
      setBulkFile(null);
      loadSheet();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to process bulk upload.');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ClipboardList size={28} color="var(--accent-amber)" />
            Marks &amp; Evaluation Center
          </h1>
          <p className="page-subtitle">
            Manage Continuous Internal Assessments (CIA), class marks matrices, and bulk Excel imports
          </p>
        </div>

        {/* Tab switcher */}
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
            onClick={() => setActiveTab('sheet')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activeTab === 'sheet' ? 'var(--grad-primary)' : 'transparent',
              color: activeTab === 'sheet' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Table size={16} /> Class Marks Sheet
          </button>

          <button
            onClick={() => setActiveTab('single')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activeTab === 'single' ? 'var(--grad-accent)' : 'transparent',
              color: activeTab === 'single' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <PlusCircle size={16} /> Individual Entry
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: activeTab === 'bulk' ? 'var(--grad-warning)' : 'transparent',
              color: activeTab === 'bulk' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <FileSpreadsheet size={16} /> Bulk Excel Upload
          </button>
        </div>
      </div>

      {/* Class & Subject Selector Filter */}
      <div className="card glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={15} /> Select Class Group
              </span>
            </label>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.department ? `(${c.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={15} /> Select Subject
              </span>
            </label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: CLASS MARKS SHEET MATRIX */}
      {activeTab === 'sheet' && (
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
              Class Evaluation Matrix
            </h3>
            <button onClick={loadSheet} className="btn btn-secondary btn-sm">
              Refresh Sheet
            </button>
          </div>

          {loadingSheet ? (
            <Loader text="Generating class marks sheet matrix..." />
          ) : !sheetData || sheetData.rows.length === 0 ? (
            <EmptyState
              title="No Marks Found"
              description="No marks have been entered for this subject & class section yet."
            />
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Register Number</th>
                    <th>Student Name</th>
                    {sheetData.assessment_columns.map((col) => (
                      <th key={col} style={{ textAlign: 'center' }}>
                        {col}
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', color: 'var(--accent-amber)' }}>
                      Total Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sheetData.rows.map((row, idx) => (
                    <tr key={row.student_id || idx}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.reg_no}</td>
                      <td style={{ fontWeight: 600 }}>{row.full_name}</td>
                      {sheetData.assessment_columns.map((col) => (
                        <td key={col} style={{ textAlign: 'center', fontWeight: 500 }}>
                          {row.marks[col] !== undefined && row.marks[col] !== null ? (
                            <span style={{ color: 'var(--text-primary)' }}>{row.marks[col]}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INDIVIDUAL STUDENT ENTRY */}
      {activeTab === 'single' && (
        <div className="card glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={22} color="var(--accent-cyan)" /> Enter Student Assessment Mark
          </h3>

          <form onSubmit={handleSingleSubmit}>
            <div className="form-group">
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={singleForm.student_id}
                onChange={(e) => setSingleForm({ ...singleForm, student_id: e.target.value })}
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.reg_no})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Assessment Type</label>
                <select
                  className="form-select"
                  value={singleForm.assessment_type}
                  onChange={(e) => setSingleForm({ ...singleForm, assessment_type: e.target.value })}
                  required
                >
                  <option value="CIA-1">CIA - 1</option>
                  <option value="CIA-2">CIA - 2</option>
                  <option value="CIA-3">CIA - 3</option>
                  <option value="Model Exam">Model Examination</option>
                  <option value="Assignment">Assignment / Seminar</option>
                  <option value="Semester Exam">End Semester Examination</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className="form-select"
                  value={singleForm.subject_id}
                  onChange={(e) => setSingleForm({ ...singleForm, subject_id: e.target.value })}
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Marks Obtained *</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="e.g. 18.5"
                  value={singleForm.marks_obtained}
                  onChange={(e) => setSingleForm({ ...singleForm, marks_obtained: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Marks *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="20"
                  value={singleForm.max_marks}
                  onChange={(e) => setSingleForm({ ...singleForm, max_marks: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Save / Update Mark
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: BULK EXCEL UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="card glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={22} color="#fbbf24" /> Bulk Upload Marks via Excel
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Upload entire class examination scores in <code>.xlsx</code> or <code>.xls</code> spreadsheet format.
          </p>

          <form onSubmit={handleBulkUpload}>
            <div className="form-group">
              <label className="form-label">Max Marks per Assessment</label>
              <input
                type="number"
                className="form-input"
                value={bulkMaxMarks}
                onChange={(e) => setBulkMaxMarks(Number(e.target.value))}
                required
              />
            </div>

            {/* File Drag and Drop Zone */}
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.01)',
                marginBottom: '1.5rem',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('excel-file-input').click()}
            >
              <Upload size={36} color="var(--primary-400)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {bulkFile ? bulkFile.name : 'Click or drop .xlsx spreadsheet here'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Supports Microsoft Excel (.xlsx, .xls) files up to 10MB
              </div>
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={(e) => setBulkFile(e.target.files[0])}
              />
            </div>

            {/* Template Information Card */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
                fontSize: '0.825rem',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                📋 Dynamic Excel Column Headers:
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                You must include a column named <code>Reg No</code>.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                <strong>All other columns</strong> will automatically become assessment names!<br/>
                <em>Example:</em> <code>Reg No</code> | <code>Unit Test 1</code> | <code>Midterm</code> | <code>Practical</code>
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-warning"
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={bulkLoading || !bulkFile}
            >
              {bulkLoading ? 'Processing Spreadsheet...' : 'Upload & Process Marks'}
            </button>
          </form>

          {/* Results box */}
          {bulkResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#34d399' }}>
                <CheckCircle size={18} /> Processed {bulkResult.total_rows} rows — {bulkResult.saved} marks saved!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
