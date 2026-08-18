import { apiClient } from './client';

export const filesApi = {
  // NOTES
  getNotes: async (subjectId = null) => {
    const params = subjectId ? { subject_id: subjectId } : {};
    const response = await apiClient.get('/notes', { params });
    return response.data;
  },

  uploadNote: async ({ subjectId, title, file }) => {
    const formData = new FormData();
    formData.append('subject_id', subjectId);
    formData.append('title', title);
    formData.append('file', file);

    const response = await apiClient.post('/notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // QUESTION BANK
  getQuestionBank: async (subjectId = null) => {
    const params = subjectId ? { subject_id: subjectId } : {};
    const response = await apiClient.get('/question-bank', { params });
    return response.data;
  },

  uploadQuestionBank: async ({ subjectId, title, file }) => {
    const formData = new FormData();
    formData.append('subject_id', subjectId);
    formData.append('title', title);
    formData.append('file', file);

    const response = await apiClient.post('/question-bank/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
