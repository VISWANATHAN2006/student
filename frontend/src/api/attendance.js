import { apiClient } from './client';

export const attendanceApi = {
  // Mark attendance for a class or subject
  // payload: { class_id, subject_id, date, records: [{ student_id, status }] }
  markAttendance: async (payload) => {
    const response = await apiClient.post('/attendance/mark', payload);
    return response.data;
  },

  // Get student attendance history
  getStudentAttendance: async (studentId, month = null, year = null) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await apiClient.get(`/attendance/student/${studentId}`, { params });
    return response.data;
  },

  // Get student attendance summary (% and stats)
  getStudentAttendanceSummary: async (studentId) => {
    const response = await apiClient.get(`/attendance/student/${studentId}/summary`);
    return response.data;
  },
};
