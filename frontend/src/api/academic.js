import { apiClient } from './client';

export const academicApi = {
  // Get all classes
  getClasses: async () => {
    const response = await apiClient.get('/classes');
    return response.data;
  },

  // Create new class (Admin)
  createClass: async (data) => {
    const response = await apiClient.post('/classes', data);
    return response.data;
  },

  // Get subjects (optionally by class_id)
  getSubjects: async (classId = null) => {
    const params = classId ? { class_id: classId } : {};
    const response = await apiClient.get('/subjects', { params });
    return response.data;
  },

  // Create new subject (Admin)
  createSubject: async (data) => {
    const response = await apiClient.post('/subjects', data);
    return response.data;
  },
};
