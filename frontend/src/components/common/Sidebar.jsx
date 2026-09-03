import React, { useRef } from 'react';
import logo from '../../assets/logo.png';
import { apiClient } from '../../api/client';
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
  X,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const role = user?.user_type || 'student';

  const studentMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'Marks', icon: Award },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'question-bank', label: 'Question Bank', icon: FileQuestion },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const staffMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pre-register', label: 'Add Students', icon: UserCheck },
    { id: 'mark-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'manage-marks', label: 'Marks', icon: ClipboardList },
    { id: 'upload-notes', label: 'Upload Notes', icon: UploadCloud },
    { id: 'upload-qb', label: 'Upload Question Bank', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'manage-departments', label: 'Departments', icon: Layers },
    { id: 'manage-classes', label: 'Classes & Subjects', icon: BookOpen },
    { id: 'manage-staff', label: 'Staff', icon: Users },
    { id: 'manage-students', label: 'Students', icon: GraduationCap },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  let menuItems = studentMenu;
  if (role === 'staff') menuItems = staffMenu;
  else if (role === 'admin') menuItems = adminMenu;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
              STUDENT MANAGEMENT
            </span>
            <div
              style={{
                fontSize: '0.68rem',
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
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth <= 768) {
                  setIsOpen(false);
                }
              }}
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '6px', 
              background: 'var(--bg-main)', 
              overflow: 'hidden', 
              position: 'relative',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              flexShrink: 0
            }}
            onClick={() => document.getElementById('profile-upload').click()}
            title="Upload Profile Picture (Passport Size)"
          >
            {user?.profile_picture_url ? (
              <img src={`${apiClient.defaults.baseURL}${user.profile_picture_url}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', lineHeight: '1' }}>Add<br/>Photo</div>
            )}
            <input 
              type="file" 
              id="profile-upload" 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                try {
                  await apiClient.post('/profile/picture', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  window.location.reload();
                } catch (err) {
                  alert('Upload failed: ' + (err.response?.data?.detail || err.message));
                }
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || user?.email}
            </div>
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
