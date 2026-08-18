import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  BookOpen,
  FileQuestion,
  Bell,
  UserCheck,
  ClipboardList,
  UploadCloud,
  FileText,
  Megaphone,
  BarChart3,
  Layers,
  Users,
  GraduationCap,
  LogOut,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const role = user?.user_type || 'student';

  const studentMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'My Marks & Grades', icon: Award },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'question-bank', label: 'Question Bank', icon: FileQuestion },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const staffMenu = [
    { id: 'dashboard', label: 'Staff Overview', icon: LayoutDashboard },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: UserCheck },
    { id: 'manage-marks', label: 'Manage Marks & Sheet', icon: ClipboardList },
    { id: 'upload-notes', label: 'Upload Study Notes', icon: UploadCloud },
    { id: 'upload-qb', label: 'Upload Question Bank', icon: FileText },
    { id: 'send-announcement', label: 'Send Announcement', icon: Megaphone },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'College Overview', icon: BarChart3 },
    { id: 'manage-classes', label: 'Classes & Subjects', icon: Layers },
    { id: 'manage-staff', label: 'Staff & Assignments', icon: Users },
    { id: 'manage-students', label: 'Students Roster', icon: GraduationCap },
  ];

  let menuItems = studentMenu;
  if (role === 'staff') menuItems = staffMenu;
  else if (role === 'admin') menuItems = adminMenu;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
          }}
        >
          🎓
        </div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            BIEW CONNECT
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            {role} portal
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.full_name || user?.email}
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
