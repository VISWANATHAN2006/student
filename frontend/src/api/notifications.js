import { apiClient } from './client';

export const notificationApi = {
  // Send announcement (Staff/Admin)
  // payload: { title, body, target_type: 'all'|'class'|'subject', target_id: number|null }
  sendAnnouncement: async (payload) => {
    const response = await apiClient.post('/notifications/send', payload);
    return response.data;
  },

  // Get notifications for current logged in user
  getMyNotifications: async () => {
    const response = await apiClient.get('/notifications/me');
    return response.data;
  },
};
