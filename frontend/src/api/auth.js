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

  // Forgot Password: payload { email, user_type? }
  forgotPassword: async (payload) => {
    const response = await apiClient.post('/auth/forgot-password', payload);
    return response.data;
  },

  // Verify Reset OTP: payload { email, otp }
  verifyResetOtp: async (payload) => {
    const response = await apiClient.post('/auth/verify-reset-otp', payload);
    return response.data;
  },

  // Reset Password: payload { email, otp, new_password }
  resetPassword: async (payload) => {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },
};

