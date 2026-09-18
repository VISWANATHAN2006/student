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

  // Get pre-registered students (optionally filtered by class_id and department)
  getPreRegistrations: async (classId = null, department = null) => {
    const params = {};
    if (classId) params.class_id = classId;
    if (department) params.department = department;
    const response = await apiClient.get('/staff/pre-register', { params });
    return response.data;
  },

  // Get assigned subjects for logged-in staff
  getAssignedSubjects: async () => {
    const response = await apiClient.get('/staff/me/assigned-subjects');
    return response.data;
  },

  // Get assigned subjects for a specific staff member (Admin)
  getStaffAssignedSubjects: async (staffId) => {
    const response = await apiClient.get(`/staff/${staffId}/assigned-subjects`);
    return response.data;
  },

  // Unassign subject (Admin)
  unassignSubject: async (assignmentId) => {
    const response = await apiClient.delete(`/staff/unassign-subject/${assignmentId}`);
    return response.data;
  },
};

