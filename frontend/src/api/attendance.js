import { apiClient } from './client';

export const attendanceApi = {
  // Mark attendance for a class or subject
  // payload: { class_id, subject_id, date, records: [{ student_id, status }] }
  markAttendance: async (payload) => {
    const response = await apiClient.post('/attendance/mark', payload);
    return response.data;
  },

  // Get student attendance history
  getStudentAttendance: async (studentId = 'me', month = null, year = null) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const url = !studentId || studentId === 'me' ? '/attendance/student/me' : `/attendance/student/${studentId}`;
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // Get student attendance summary (% and stats)
  getStudentAttendanceSummary: async (studentId = 'me', month = null, year = null) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const url = !studentId || studentId === 'me' ? '/attendance/student/me/summary' : `/attendance/student/${studentId}/summary`;
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // Get low attendance students for a class (<75%)
  getClassLowAttendance: async (classId, threshold = 75.0) => {
    const response = await apiClient.get(`/attendance/class/${classId}/low-attendance`, {
      params: { threshold }
    });
    return response.data;
  },

  // Broadcast low attendance notification to class
  notifyLowAttendance: async (classId, threshold = 75.0, customMessage = null) => {
    const response = await apiClient.post(`/attendance/class/${classId}/notify-low-attendance`, null, {
      params: { threshold, custom_message: customMessage }
    });
    return response.data;
  },
};
