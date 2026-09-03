import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marksApi } from '../../api/marks';
import { academicApi } from '../../api/academic';
import { attendanceApi } from '../../api/attendance';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Award,
  BookOpen,
  BarChart,
  Percent,
  CheckCircle,
  FileText,
  Printer,
  X,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   Print-only CSS injected once as a <style> element
   ───────────────────────────────────────────────────── */
const PRINT_STYLE = `
@media print {
  body > * { display: none !important; }
  #biew-report-card-printable,
  #biew-report-card-printable * { display: unset !important; visibility: visible !important; }
  #biew-report-card-printable {
    position: fixed !important;
    inset: 0 !important;
    z-index: 99999 !important;
    background: #fff !important;
    padding: 24px 32px !important;
    font-family: 'Times New Roman', Times, serif !important;
    font-size: 12pt !important;
    color: #000 !important;
    overflow: visible !important;
  }
  .no-print { display: none !important; }
}
`;

/* ─────────────────────────────────────────────────────
   Helper: grade from percentage
   ───────────────────────────────────────────────────── */
const getGrade = (pct) => {
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  return 'F';
};

const getGradePoints = (pct) => {
  if (pct >= 90) return 10;
  if (pct >= 80) return 9;
  if (pct >= 70) return 8;
  if (pct >= 60) return 7;
  if (pct >= 50) return 6;
  return 0;
};

/* ─────────────────────────────────────────────────────
   Printable Marksheet Component
   ───────────────────────────────────────────────────── */
const PrintableMarksheet = ({ user, marksList, subjectsMap, attendanceSummary, onClose }) => {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalObtained = marksList.reduce((acc, m) => acc + (m.marks_obtained || 0), 0);
  const totalMax = marksList.reduce((acc, m) => acc + (m.max_marks || 0), 0);
  const overallPct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
  const overallGrade = getGrade(Number(overallPct));

  const attPct = attendanceSummary?.percentage ?? null;

  return (
    <>
      {/* Inject print style once */}
      <style>{PRINT_STYLE}</style>

      {/* Dark overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        className="no-print"
      />

      {/* Modal shell */}
      <div
        style={{
          position: 'fixed', inset: '2rem', zIndex: 9999,
          background: '#fff',
          borderRadius: '12px',
          overflow: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top action bar (hidden on print) */}
        <div
          className="no-print"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.85rem 1.5rem',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <FileText size={20} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Official Marksheet / Report Card</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: '0.55rem 1.25rem', borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f9cf9, #6366f1)',
                color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                border: 'none', cursor: 'pointer',
              }}
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.55rem 0.75rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            PRINTABLE CONTENT
            ═══════════════════════════════════════════ */}
        <div
          id="biew-report-card-printable"
          style={{
            padding: '36px 48px',
            fontFamily: "'Times New Roman', Times, serif",
            color: '#111',
            background: '#fff',
            flex: 1,
          }}
        >
          {/* ── INSTITUTION HEADER ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <tbody>
              <tr>
                {/* Emblem placeholder */}
                <td style={{ width: '90px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '3px double #1e3a5f',
                    background: 'linear-gradient(135deg,#1e3a5f,#2d6ba0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                  }}>
                    <span style={{ fontSize: 28, userSelect: 'none' }}>🎓</span>
                  </div>
                </td>

                {/* College info */}
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{
                    fontSize: '11pt', fontWeight: 700, letterSpacing: '0.5px',
                    color: '#1e3a5f', textTransform: 'uppercase',
                  }}>
                    Bharathiyar Institute of Engineering for Women
                  </div>
                  <div style={{ fontSize: '9.5pt', color: '#444', margin: '4px 0 2px' }}>
                    Deviyakurichi – 636 112, Salem District, Tamil Nadu
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#555' }}>
                    Affiliated to Anna University, Chennai &nbsp;|&nbsp; AICTE Approved
                  </div>
                  <div style={{
                    marginTop: '6px', fontWeight: 700, fontSize: '12pt',
                    textDecoration: 'underline', textTransform: 'uppercase',
                    letterSpacing: '1px', color: '#1e3a5f',
                  }}>
                    Internal Assessment Report Card
                  </div>
                </td>

                {/* Date / Ref */}
                <td style={{ width: '110px', verticalAlign: 'top', textAlign: 'right', fontSize: '8.5pt', color: '#555' }}>
                  <div>Date:</div>
                  <div style={{ fontWeight: 700, color: '#111' }}>{today}</div>
                  <div style={{ marginTop: '6px' }}>Academic Year:</div>
                  <div style={{ fontWeight: 700, color: '#111' }}>2025 – 2026</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Divider */}
          <div style={{ borderTop: '3px solid #1e3a5f', borderBottom: '1px solid #1e3a5f', height: 4, marginBottom: '14px' }} />

          {/* ── STUDENT INFO BLOCK ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10.5pt' }}>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '6px', width: '33%' }}>
                  <span style={{ color: '#555' }}>Student Name:</span>
                  <br />
                  <strong style={{ fontSize: '11.5pt' }}>{user?.full_name || '—'}</strong>
                </td>
                <td style={{ paddingBottom: '6px', width: '33%' }}>
                  <span style={{ color: '#555' }}>Register Number:</span>
                  <br />
                  <strong style={{ fontFamily: 'Courier New, monospace', fontSize: '11pt' }}>
                    {user?.reg_no || `STU-${String(user?.id || '').padStart(4, '0')}`}
                  </strong>
                </td>
                <td style={{ paddingBottom: '6px', width: '33%' }}>
                  <span style={{ color: '#555' }}>Roll Number:</span>
                  <br />
                  <strong>{user?.roll_no || '—'}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <span style={{ color: '#555' }}>Department:</span>
                  <br />
                  <strong>{user?.department || 'Computer Applications'}</strong>
                </td>
                <td>
                  <span style={{ color: '#555' }}>Class / Section:</span>
                  <br />
                  <strong>{user?.class_name || '—'}</strong>
                </td>
                <td>
                  <span style={{ color: '#555' }}>Semester:</span>
                  <br />
                  <strong>Current Semester</strong>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── MARKS TABLE ── */}
          <div style={{ fontWeight: 700, fontSize: '10.5pt', marginBottom: '6px', textDecoration: 'underline' }}>
            Subject-wise Assessment Score Details
          </div>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '10pt', marginBottom: '14px',
          }}>
            <thead>
              <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Subject Name</th>
                <th style={thStyle}>Assessment Type</th>
                <th style={thStyle}>Marks Obtained</th>
                <th style={thStyle}>Max Marks</th>
                <th style={thStyle}>Percentage</th>
                <th style={thStyle}>Grade</th>
                <th style={thStyle}>Grade Points</th>
                <th style={thStyle}>Result</th>
              </tr>
            </thead>
            <tbody>
              {marksList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: '16px' }}>
                    No marks recorded yet.
                  </td>
                </tr>
              ) : (
                marksList.map((m, idx) => {
                  const subjectName = subjectsMap[m.subject_id] || `Subject #${m.subject_id}`;
                  const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100) : 0;
                  const grade = getGrade(pct);
                  const gp = getGradePoints(pct);
                  const passed = pct >= 50;
                  return (
                    <tr key={m.id || idx} style={{ background: idx % 2 === 0 ? '#f8f9fb' : '#fff' }}>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#555' }}>{idx + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{subjectName}</td>
                      <td style={tdStyle}>{m.assessment_type}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{m.marks_obtained}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{m.max_marks}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{pct.toFixed(1)}%</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>{grade}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{gp}</td>
                      <td style={{
                        ...tdStyle, textAlign: 'center', fontWeight: 700,
                        color: passed ? '#15803d' : '#b91c1c',
                      }}>
                        {passed ? 'PASS' : 'FAIL'}
                      </td>
                    </tr>
                  );
                })
              )}
              {/* Totals row */}
              {marksList.length > 0 && (
                <tr style={{ background: '#e8edf5', fontWeight: 700 }}>
                  <td colSpan={3} style={{ ...tdStyle, textAlign: 'right', fontStyle: 'italic' }}>
                    TOTAL / AGGREGATE
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{totalObtained.toFixed(1)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{totalMax.toFixed(1)}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{overallPct}%</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{overallGrade}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {getGradePoints(Number(overallPct))}
                  </td>
                  <td style={{
                    ...tdStyle, textAlign: 'center',
                    color: Number(overallPct) >= 50 ? '#15803d' : '#b91c1c',
                  }}>
                    {Number(overallPct) >= 50 ? 'PASS' : 'FAIL'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── ATTENDANCE SUMMARY ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 700, fontSize: '10.5pt', marginBottom: '6px', textDecoration: 'underline' }}>
                    Attendance Summary
                  </div>
                  <table style={{ borderCollapse: 'collapse', fontSize: '10pt' }}>
                    <tbody>
                      {[
                        ['Total Classes Conducted', attendanceSummary?.total_marked ?? '—'],
                        ['Classes Attended (Present)', attendanceSummary?.present ?? '—'],
                        ['Classes Absent', attendanceSummary?.absent ?? '—'],
                        ['Leave / On-Duty', attendanceSummary?.leave ?? '—'],
                        ['Overall Attendance %', attPct !== null ? `${attPct}%` : '—'],
                      ].map(([label, val]) => (
                        <tr key={label}>
                          <td style={{ padding: '3px 12px 3px 0', color: '#444', whiteSpace: 'nowrap' }}>{label}:</td>
                          <td style={{ padding: '3px 0', fontWeight: 600 }}>{val}</td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '3px 12px 3px 0', color: '#444' }}>Exam Eligibility Status:</td>
                        <td style={{
                          padding: '3px 0', fontWeight: 700,
                          color: attPct === null ? '#777' : attPct >= 75 ? '#15803d' : '#b91c1c',
                        }}>
                          {attPct === null ? '—'
                            : attPct >= 75 ? '✅ ELIGIBLE'
                            : '⚠️ DETAINED / NOT ELIGIBLE'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                {/* Grade legend */}
                <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '10.5pt', marginBottom: '6px', textDecoration: 'underline' }}>
                    Grading Scale
                  </div>
                  <table style={{ borderCollapse: 'collapse', fontSize: '9.5pt', width: '100%' }}>
                    <thead>
                      <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                        <th style={{ padding: '4px 8px', textAlign: 'center' }}>Marks Range</th>
                        <th style={{ padding: '4px 8px', textAlign: 'center' }}>Grade</th>
                        <th style={{ padding: '4px 8px', textAlign: 'center' }}>Grade Points</th>
                        <th style={{ padding: '4px 8px', textAlign: 'center' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['90 – 100', 'O', '10', 'Outstanding'],
                        ['80 – 89', 'A+', '9', 'Excellent'],
                        ['70 – 79', 'A', '8', 'Very Good'],
                        ['60 – 69', 'B+', '7', 'Good'],
                        ['50 – 59', 'B', '6', 'Average'],
                        ['Below 50', 'F', '0', 'Fail / Arrear'],
                      ].map(([range, grade, gp, desc], i) => (
                        <tr key={grade} style={{ background: i % 2 === 0 ? '#f8f9fb' : '#fff' }}>
                          <td style={{ padding: '3px 8px', textAlign: 'center' }}>{range}</td>
                          <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: 700 }}>{grade}</td>
                          <td style={{ padding: '3px 8px', textAlign: 'center' }}>{gp}</td>
                          <td style={{ padding: '3px 8px' }}>{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── SIGNATURE BLOCKS ── */}
          <div style={{ borderTop: '1px solid #ccc', paddingTop: '24px', marginTop: '8px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  {['Class Teacher', 'Head of Department', 'Controller of Examinations', 'Principal'].map((role) => (
                    <td key={role} style={{ textAlign: 'center', padding: '0 12px' }}>
                      <div style={{ borderTop: '1px solid #333', width: '140px', margin: '0 auto 6px', paddingTop: '4px' }} />
                      <div style={{ fontWeight: 700, fontSize: '9.5pt' }}>{role}</div>
                      <div style={{ fontSize: '8.5pt', color: '#555' }}>Signature with Seal</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: '18px', textAlign: 'center',
            fontSize: '8pt', color: '#777', borderTop: '1px dashed #ccc', paddingTop: '8px',
          }}>
            This is a computer-generated Internal Assessment Report. Valid for official academic records. |&nbsp;
            Generated on {today} from BIEW Connect Student Management System.
          </div>
        </div>
      </div>
    </>
  );
};

/* Reusable table cell styles */
const thStyle = {
  padding: '7px 10px', textAlign: 'left',
  border: '1px solid #2d5991', fontSize: '10pt',
};
const tdStyle = {
  padding: '6px 10px',
  border: '1px solid #d1d5db',
};


/* ─────────────────────────────────────────────────────
   Main StudentMarks Page
   ───────────────────────────────────────────────────── */
export const StudentMarks = () => {
  const { user } = useAuth();
  const [marksList, setMarksList] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 1;
        const [marksRes, subsRes, attRes] = await Promise.allSettled([
          marksApi.getStudentMarks(studentId),
          academicApi.getSubjects(),
          attendanceApi.getStudentAttendanceSummary(studentId),
        ]);

        if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value)) {
          const map = {};
          subsRes.value.forEach((s) => { map[s.id] = s.name; });
          setSubjectsMap(map);
        }

        if (marksRes.status === 'fulfilled' && marksRes.value) {
          setMarksList(marksRes.value);
        } else {
          setMarksList([]);
        }

        if (attRes.status === 'fulfilled' && attRes.value) {
          setAttendanceSummary(attRes.value);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.id]);

  const totalObtained = marksList.reduce((acc, m) => acc + (m.marks_obtained || 0), 0);
  const totalMax = marksList.reduce((acc, m) => acc + (m.max_marks || 0), 0);
  const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  const getPerformanceBadge = (pct) => {
    if (pct >= 85) return <Badge variant="success">Grade O (Outstanding)</Badge>;
    if (pct >= 70) return <Badge variant="primary">Grade A (Good)</Badge>;
    if (pct >= 50) return <Badge variant="warning">Grade B (Average)</Badge>;
    return <Badge variant="danger">Needs Improvement</Badge>;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Award size={28} color="var(--accent-amber)" />
            My Marks
          </h1>
          <p className="page-subtitle">
            View your test marks, exam scores, and official grade report
          </p>
        </div>

        {/* Report Card Button */}
        <button
          id="download-report-card-btn"
          onClick={() => setShowReportCard(true)}
          style={{
            padding: '0.65rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6ba0 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(30,58,95,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,58,95,0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(30,58,95,0.4)';
          }}
        >
          <FileText size={17} />
          Download Report Card (PDF)
        </button>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          title="Overall Percentage"
          value={`${overallPercentage}%`}
          subtext={getPerformanceBadge(Number(overallPercentage))}
          icon={Percent}
          colorVariant="warning"
        />

        <StatCard
          title="Total Marks"
          value={`${totalObtained} / ${totalMax}`}
          subtext="Total marks scored"
          icon={Award}
          colorVariant="primary"
        />

        <StatCard
          title="Tests Conducted"
          value={marksList.length}
          subtext="Recorded exams"
          icon={BarChart}
          colorVariant="cyan"
        />

        <StatCard
          title="Attendance"
          value={attendanceSummary ? `${attendanceSummary.percentage}%` : '—'}
          subtext={
            attendanceSummary
              ? attendanceSummary.percentage >= 75
                ? <span style={{ color: '#34d399' }}>✓ Exam Eligible</span>
                : <span style={{ color: '#fb7185' }}>⚠ Below 75% Threshold</span>
              : 'Loading...'
          }
          icon={CheckCircle}
          colorVariant={attendanceSummary?.percentage >= 75 ? 'success' : 'danger'}
        />
      </div>

      {/* Marks Table */}
      <div className="card glass-panel" style={{ padding: '0' }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--accent-amber)" />
            Subject-wise Assessment Breakdown
          </h3>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Official Internal Records
          </span>
        </div>

        {loading ? (
          <Loader text="Loading your marks and grade sheet..." />
        ) : marksList.length === 0 ? (
          <EmptyState
            title="No Marks Recorded Yet"
            description="Faculty has not published any internal assessment marks for your roll number yet."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject Name</th>
                  <th>Assessment Type</th>
                  <th>Score Obtained</th>
                  <th>Max Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {marksList.map((m, idx) => {
                  const subjectName = subjectsMap[m.subject_id] || `Subject #${m.subject_id}`;
                  const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100) : 0;
                  const isPassed = pct >= 50;
                  const grade = getGrade(pct);

                  return (
                    <tr key={m.id || idx}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{subjectName}</td>
                      <td>
                        <Badge variant="primary">{m.assessment_type}</Badge>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {m.marks_obtained}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.max_marks}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: isPassed ? '#34d399' : '#fb7185' }}>
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: '0.9rem',
                          color: isPassed ? 'var(--accent-amber)' : '#fb7185',
                        }}>
                          {grade}
                        </span>
                      </td>
                      <td>
                        {isPassed ? (
                          <Badge variant="success">Passed</Badge>
                        ) : (
                          <Badge variant="danger">Arrear / Re-test</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Card Modal */}
      {showReportCard && (
        <PrintableMarksheet
          user={user}
          marksList={marksList}
          subjectsMap={subjectsMap}
          attendanceSummary={attendanceSummary}
          onClose={() => setShowReportCard(false)}
        />
      )}
    </div>
  );
};
