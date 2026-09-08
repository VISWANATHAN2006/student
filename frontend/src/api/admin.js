import { apiClient } from './client';

export const adminApi = {
  // College overview counters
  getOverview: async () => {
    const response = await apiClient.get('/admin/overview');
    return response.data;
  },

  // List all staff members
  getStaffList: async () => {
    const response = await apiClient.get('/admin/staff');
    return response.data;
  },

  // List all students (with optional classId filter)
  getStudentList: async (classId = null) => {
    const params = classId ? { class_id: classId } : {};
    const response = await apiClient.get('/admin/students', { params });
    return response.data;
  },

  // List classes with student count & advisor name
  getClassOverviewList: async () => {
    const response = await apiClient.get('/admin/classes');
    return response.data;
  },
};
