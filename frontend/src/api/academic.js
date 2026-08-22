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

  // Get departments
  getDepartments: async () => {
    const response = await apiClient.get('/departments');
    return response.data;
  },

  // Create department
  createDepartment: async (data) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },

  // Delete department (Admin)
  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },

  // Update department (Admin)
  updateDepartment: async (id, data) => {
    const response = await apiClient.put(`/departments/${id}`, data);
    return response.data;
  },

  // Delete class (Admin)
  deleteClass: async (id) => {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  },

  // Update class (Admin)
  updateClass: async (id, data) => {
    const response = await apiClient.put(`/classes/${id}`, data);
    return response.data;
  },

  // Delete subject (Admin)
  deleteSubject: async (id) => {
    const response = await apiClient.delete(`/subjects/${id}`);
    return response.data;
  },

  // Update subject (Admin)
  updateSubject: async (id, data) => {
    const response = await apiClient.put(`/subjects/${id}`, data);
    return response.data;
  },
};
