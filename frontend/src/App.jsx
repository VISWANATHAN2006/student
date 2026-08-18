import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Loader } from './components/common/Loader';

// Auth & Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentMaterials } from './pages/student/StudentMaterials';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements';

// Staff Portal Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { MarkAttendance } from './pages/staff/MarkAttendance';
import { ManageMarks } from './pages/staff/ManageMarks';
import { UploadMaterials } from './pages/staff/UploadMaterials';
import { SendAnnouncement } from './pages/staff/SendAnnouncement';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageClasses } from './pages/admin/ManageClasses';
import { ManageStaff } from './pages/admin/ManageStaff';
import { ManageStudents } from './pages/admin/ManageStudents';

export const App = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [initialRole, setInitialRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Reset tab to dashboard on user/role change
  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.user_type]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <Loader text="Initializing BIEW Connect..." size={42} />
      </div>
    );
  }

  // If user is not authenticated, render Public Flows
  if (!isAuthenticated) {
    if (publicView === 'login') {
      return (
        <LoginPage
          initialRole={initialRole}
          onNavigateRegister={(role) => {
            setInitialRole(role);
            setPublicView('register');
          }}
          onNavigateBack={() => setPublicView('landing')}
        />
      );
    }

    if (publicView === 'register') {
      return (
        <RegisterPage
          initialRole={initialRole}
          onNavigateLogin={(role) => {
            setInitialRole(role);
            setPublicView('login');
          }}
          onNavigateBack={() => setPublicView('landing')}
        />
      );
    }

    return (
      <LandingPage
        onNavigateLogin={(role) => {
          setInitialRole(role);
          setPublicView('login');
        }}
        onNavigateRegister={(role) => {
          setInitialRole(role);
          setPublicView('register');
        }}
      />
    );
  }

  // Render Authenticated Portals based on user_type
  const role = user?.user_type || 'student';

  const renderContent = () => {
    // 1. STUDENT PORTAL
    if (role === 'student') {
      switch (activeTab) {
        case 'attendance':
          return <StudentAttendance />;
        case 'marks':
          return <StudentMarks />;
        case 'notes':
          return <StudentMaterials initialTab="notes" />;
        case 'question-bank':
          return <StudentMaterials initialTab="qb" />;
        case 'announcements':
          return <StudentAnnouncements />;
        case 'dashboard':
        default:
          return <StudentDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      }
    }

    // 2. STAFF PORTAL
    if (role === 'staff') {
      switch (activeTab) {
        case 'mark-attendance':
          return <MarkAttendance />;
        case 'manage-marks':
          return <ManageMarks />;
        case 'upload-notes':
          return <UploadMaterials defaultCategory="notes" />;
        case 'upload-qb':
          return <UploadMaterials defaultCategory="qb" />;
        case 'send-announcement':
          return <SendAnnouncement />;
        case 'dashboard':
        default:
          return <StaffDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      }
    }

    // 3. ADMIN PORTAL
    if (role === 'admin') {
      switch (activeTab) {
        case 'manage-classes':
          return <ManageClasses />;
        case 'manage-staff':
          return <ManageStaff />;
        case 'manage-students':
          return <ManageStudents />;
        case 'dashboard':
        default:
          return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      }
    }

    return <div>Unknown role</div>;
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar />
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
