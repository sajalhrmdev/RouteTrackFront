import api from '@/lib/api';
import { Notification, ApiResponse } from '@/types';

export const notificationService = {
  async getAll(params?: Record<string, string>) {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  async markAsRead(id: string) {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.put('/notifications/read-all');
  },

  async delete(id: string) {
    await api.delete(`/notifications/${id}`);
  },
};
