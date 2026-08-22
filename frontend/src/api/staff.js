import { apiClient } from './client';

export const staffApi = {
  // Get staff dashboard stats
  getDashboard: async () => {
    const response = await apiClient.get('/staff/me/dashboard');
    return response.data;
  },

  // Assign Class Advisor (Admin only)
  assignClass: async ({ staff_id, class_id }) => {
    const response = await apiClient.post('/staff/assign-class', { staff_id, class_id });
    return response.data;
  },

  // Assign Subject Staff (Admin only)
  assignSubject: async ({ staff_id, subject_id, class_id }) => {
    const response = await apiClient.post('/staff/assign-subject', { staff_id, subject_id, class_id });
    return response.data;
  },

  // Pre-register students (Staff)
  bulkPreRegister: async (studentsData) => {
    const response = await apiClient.post('/staff/pre-register', { students: studentsData });
    return response.data;
  },

  // Get pre-registered students
  getPreRegistrations: async () => {
    const response = await apiClient.get('/staff/pre-register');
    return response.data;
  },
};
