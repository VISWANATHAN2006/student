import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi } from '../../api/attendance';
import { StatCard } from '../../components/common/StatCard';
import { AttendanceBadge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
} from 'lucide-react';

export const StudentAttendance = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 1;
        const [sumRes, recRes] = await Promise.allSettled([
          attendanceApi.getStudentAttendanceSummary(studentId),
          attendanceApi.getStudentAttendance(studentId, month || null, year || null),
        ]);

        if (sumRes.status === 'fulfilled') {
          setSummary(sumRes.value);
        } else {
          setSummary({
            total_marked: 0,
            present: 0,
            absent: 0,
            leave: 0,
            percentage: 0,
          });
        }

        if (recRes.status === 'fulfilled' && recRes.value) {
          setRecords(recRes.value);
        } else {
          setRecords([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.id, month, year]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <CalendarCheck size={28} color="var(--primary-400)" />
            My Attendance
          </h1>
          <p className="page-subtitle">
            Track your daily attendance and monthly records
          </p>
        </div>

        {/* Filter by Month / Year */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: '130px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            className="form-select"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ width: '110px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Attendance"
          value={`${summary?.percentage ?? 0}%`}
          subtext={summary?.percentage >= 75 ? 'Good (Above 75%)' : 'Low (Below 75%)'}
          icon={CalendarCheck}
          colorVariant={summary?.percentage >= 75 ? 'success' : 'danger'}
        />

        <StatCard
          title="Days Present"
          value={summary?.present ?? 0}
          subtext="Classes attended"
          icon={CheckCircle}
          colorVariant="success"
        />

        <StatCard
          title="Days Absent"
          value={summary?.absent ?? 0}
          subtext="Classes missed"
          icon={XCircle}
          colorVariant="danger"
        />

        <StatCard
          title="Leave Days"
          value={summary?.leave ?? 0}
          subtext="Approved leave"
          icon={Clock}
          colorVariant="warning"
        />
      </div>

      {/* Attendance Log Table */}
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
            <Calendar size={18} color="var(--primary-400)" />
            Session Attendance History
          </h3>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Showing {records.length} records
          </span>
        </div>

        {loading ? (
          <Loader text="Fetching attendance records..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No Attendance Records"
            description="No attendance data has been marked for the selected time period yet."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Type / Session</th>
                  <th>Status</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                    <td>
                      {r.subject_id
                        ? `Subject Session (ID #${r.subject_id})`
                        : 'Full Day Class Attendance'}
                    </td>
                    <td>
                      <AttendanceBadge status={r.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {r.status === 'present' ? 'Attended on time' : r.status === 'leave' ? 'Permission / On Duty' : 'Absent marked'}
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
