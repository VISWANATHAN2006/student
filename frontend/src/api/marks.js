import { apiClient } from './client';

export const marksApi = {
  // Add/Update individual student mark
  addMark: async (payload) => {
    const response = await apiClient.post('/marks/add', payload);
    return response.data;
  },

  // Get marks for a student
  getStudentMarks: async (studentId) => {
    const response = await apiClient.get(`/marks/student/${studentId}`);
    return response.data;
  },

  // Get full class marks sheet for a subject
  getClassMarksSheet: async (classId, subjectId) => {
    const response = await apiClient.get(`/marks/class/${classId}/subject/${subjectId}/sheet`);
    return response.data;
  },

  // Bulk upload marks via Excel (.xlsx / .xls)
  bulkUploadMarks: async ({ subjectId, classId, maxMarks, file }) => {
    const formData = new FormData();
    formData.append('subject_id', subjectId);
    formData.append('class_id', classId);
    formData.append('max_marks_per_assessment', maxMarks || 20);
    formData.append('file', file);

    const response = await apiClient.post('/marks/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
