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
import { PreRegisterStudents } from './pages/staff/PreRegisterStudents';
import { MarkAttendance } from './pages/staff/MarkAttendance';
import { ManageMarks } from './pages/staff/ManageMarks';
import { UploadMaterials } from './pages/staff/UploadMaterials';
import { SendAnnouncement } from './pages/staff/SendAnnouncement';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageDepartments } from './pages/admin/ManageDepartments';
import { ManageClasses } from './pages/admin/ManageClasses';
import { ManageStaff } from './pages/admin/ManageStaff';
import { ManageStudents } from './pages/admin/ManageStudents';

export const App = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [initialRole, setInitialRole] = useState('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState(['dashboard']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reset tab to dashboard on user/role change
  useEffect(() => {
    setActiveTab('dashboard');
    setTabHistory(['dashboard']);
  }, [user?.user_type]);

  const handleNavigateTab = (newTab) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, newTab]);
      setActiveTab(newTab);
    }
  };

  const handleBack = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop();
      const prevTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      setActiveTab(prevTab);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setTabHistory(['dashboard']);
    } else {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <Loader text="Initializing Student Management..." size={42} />
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
          return <StudentAttendance onBack={handleBack} />;
        case 'marks':
          return <StudentMarks onBack={handleBack} />;
        case 'notes':
          return <StudentMaterials initialTab="notes" onBack={handleBack} />;
        case 'question-bank':
          return <StudentMaterials initialTab="qb" onBack={handleBack} />;
        case 'announcements':
          return <StudentAnnouncements onBack={handleBack} />;
        case 'dashboard':
        default:
          return <StudentDashboard onNavigate={handleNavigateTab} />;
      }
    }

    // 2. STAFF PORTAL
    if (role === 'staff') {
      switch (activeTab) {
        case 'pre-register':
          return <PreRegisterStudents onBack={handleBack} />;
        case 'mark-attendance':
          return <MarkAttendance onBack={handleBack} />;
        case 'manage-marks':
          return <ManageMarks onBack={handleBack} />;
        case 'upload-notes':
          return <UploadMaterials defaultCategory="notes" onBack={handleBack} />;
        case 'upload-qb':
          return <UploadMaterials defaultCategory="qb" onBack={handleBack} />;
        case 'announcements':
          return <SendAnnouncement onBack={handleBack} />;
        case 'dashboard':
        default:
          return <StaffDashboard onNavigate={handleNavigateTab} />;
      }
    }

    // 3. ADMIN PORTAL
    if (role === 'admin') {
      switch (activeTab) {
        case 'manage-departments':
          return <ManageDepartments onBack={handleBack} />;
        case 'manage-classes':
          return <ManageClasses onBack={handleBack} />;
        case 'manage-staff':
          return <ManageStaff onBack={handleBack} />;
        case 'manage-students':
          return <ManageStudents onBack={handleBack} />;
        case 'announcements':
          return <SendAnnouncement onBack={handleBack} />;
        case 'dashboard':
        default:
          return <AdminDashboard onNavigate={handleNavigateTab} />;
      }
    }

    return <div>Unknown role</div>;
  };

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <div className="global-bg-watermark" />
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar activeTab={activeTab} setActiveTab={handleNavigateTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onBack={handleBack} />
        <div className="page-content-scroll">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
