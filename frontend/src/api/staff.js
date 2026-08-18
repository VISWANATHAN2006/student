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
};
