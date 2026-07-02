import api from '@/lib/api';
import { DashboardStats, ApiResponse } from '@/types';

export const dashboardService = {
  async getStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data!;
  },

  async getAttendanceTrend(days = 30) {
    const { data } = await api.get<ApiResponse<Record<string, number>>>('/dashboard/attendance-trend', {
      params: { days },
    });
    return data.data!;
  },

  async getDistanceTrend(days = 7) {
    const { data } = await api.get<ApiResponse<Record<string, number>>>('/dashboard/distance-trend', {
      params: { days },
    });
    return data.data!;
  },
};
