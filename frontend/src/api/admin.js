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

  // List all students
  getStudentList: async () => {
    const response = await apiClient.get('/admin/students');
    return response.data;
  },

  // List classes with student count & advisor name
  getClassOverviewList: async () => {
    const response = await apiClient.get('/admin/classes');
    return response.data;
  },
};
