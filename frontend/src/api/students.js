import { apiClient } from './client';

export const studentsApi = {
  // Get student dashboard overview
  getDashboard: async () => {
    const response = await apiClient.get('/students/me/dashboard');
    return response.data;
  },
};
