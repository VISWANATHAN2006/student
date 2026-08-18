import { apiClient } from './client';

export const authApi = {
  // Login: payload { email, password, user_type }
  login: async (payload) => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  // Register Student
  registerStudent: async (payload) => {
    const response = await apiClient.post('/auth/register/student', payload);
    return response.data;
  },

  // Register Staff
  registerStaff: async (payload) => {
    const response = await apiClient.post('/auth/register/staff', payload);
    return response.data;
  },

  // Register Admin
  registerAdmin: async (payload) => {
    const response = await apiClient.post('/auth/register/admin', payload);
    return response.data;
  },

  // Check Email Availability
  checkEmail: async (email) => {
    const response = await apiClient.get('/auth/check-email', { params: { email } });
    return response.data;
  },
};
