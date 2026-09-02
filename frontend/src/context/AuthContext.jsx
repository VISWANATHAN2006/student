import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { checkBackendHealth } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('biew_auth_token') || null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('biew_theme') || 'dark');
  const [loading, setLoading] = useState(true);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('biew_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check backend health once on initial mount
  const testBackend = useCallback(async () => {
    setCheckingBackend(true);
    const health = await checkBackendHealth();
    setBackendOnline(health.ok);
    setCheckingBackend(false);
    return health.ok;
  }, []);

  useEffect(() => {
    testBackend();
  }, [testBackend]);

  // Load existing session on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('biew_user');
    const savedToken = localStorage.getItem('biew_auth_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('biew_user');
        localStorage.removeItem('biew_auth_token');
      }
    }
    setLoading(false);
  }, []);

  // Listen for unauthorized events from the API interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('biew_auth_token');
      localStorage.removeItem('biew_user');
    };
    window.addEventListener('biew:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('biew:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password, userType) => {
    // Attempt live API login first
    try {
      const data = await authApi.login({ email, password, user_type: userType });
      const userData = {
        id: data.user_id,
        full_name: data.full_name,
        user_type: data.user_type,
        email: email,
      };
      setToken(data.access_token);
      setUser(userData);
      localStorage.setItem('biew_auth_token', data.access_token);
      localStorage.setItem('biew_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Login failed';
      throw new Error(detail);
    }
  };

  // Quick Demo Login for instant testing/demonstration without needing manual DB seeding
  const loginDemo = (role) => {
    let mockUser = {
      id: 1,
      full_name: 'Student User',
      email: 'student@biew.edu.in',
      user_type: 'student',
      reg_no: '',
      class_name: '',
    };

    if (role === 'staff') {
      mockUser = {
        id: 101,
        full_name: 'Faculty Staff',
        email: 'staff@biew.edu.in',
        user_type: 'staff',
        role_type: 'both',
        department: '',
      };
    } else if (role === 'admin') {
      mockUser = {
        id: 999,
        full_name: 'Administrator',
        email: 'admin@biew.edu.in',
        user_type: 'admin',
        designation: 'Admin',
      };
    }

    const mockToken = 'mock_jwt_token_biew_' + role;
    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem('biew_auth_token', mockToken);
    localStorage.setItem('biew_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('biew_auth_token');
    localStorage.removeItem('biew_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        loginDemo,
        logout,
        backendOnline,
        checkingBackend,
        testBackend,
        theme,
        toggleTheme,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
