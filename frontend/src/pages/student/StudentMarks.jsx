import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marksApi } from '../../api/marks';
import { academicApi } from '../../api/academic';
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
  HelpCircle,
} from 'lucide-react';

export const StudentMarks = () => {
  const { user } = useAuth();
  const [marksList, setMarksList] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 1;
        const [marksRes, subsRes] = await Promise.allSettled([
          marksApi.getStudentMarks(studentId),
          academicApi.getSubjects(),
        ]);

        if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value)) {
          const map = {};
          subsRes.value.forEach((s) => {
            map[s.id] = s.name;
          });
          setSubjectsMap(map);
        }

        if (marksRes.status === 'fulfilled' && marksRes.value) {
          setMarksList(marksRes.value);
        } else {
          setMarksList([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [user?.id]);

  const totalObtained = marksList.reduce((acc, m) => acc + (m.marks_obtained || 0), 0);
  const totalMax = marksList.reduce((acc, m) => acc + (m.max_marks || 0), 0);
  const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  const getPerformanceBadge = (pct) => {
    if (pct >= 85) return <Badge variant="success">Grade A+ (Distinction)</Badge>;
    if (pct >= 70) return <Badge variant="primary">Grade A (First Class)</Badge>;
    if (pct >= 50) return <Badge variant="warning">Grade B (Second Class)</Badge>;
    return <Badge variant="danger">Needs Improvement</Badge>;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Award size={28} color="var(--accent-amber)" />
            Internal Assessment Report
          </h1>
          <p className="page-subtitle">
            Continuous Internal Assessment (CIA), Model Exams, and Term Scores
          </p>
        </div>
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
          title="Total Marks Scored"
          value={`${totalObtained} / ${totalMax}`}
          subtext="Cumulative score achieved"
          icon={Award}
          colorVariant="primary"
        />

        <StatCard
          title="Total Evaluations"
          value={marksList.length}
          subtext="Assessment entries recorded"
          icon={BarChart}
          colorVariant="cyan"
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {marksList.map((m, idx) => {
                  const subjectName = subjectsMap[m.subject_id] || `Subject #${m.subject_id}`;
                  const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100).toFixed(1) : 0;
                  const isPassed = Number(pct) >= 50;

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
                          {pct}%
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
    </div>
  );
};
