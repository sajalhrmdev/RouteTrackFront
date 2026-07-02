import api from '@/lib/api';
import { Attendance, PaginatedResponse, ApiResponse } from '@/types';

export const attendanceService = {
  async checkIn(latitude: number, longitude: number, accuracy?: number, address?: string) {
    const { data } = await api.post<ApiResponse<Attendance>>('/attendance/check-in', {
      latitude, longitude, accuracy, address,
    });
    return data.data!;
  },

  async checkOut(latitude: number, longitude: number, accuracy?: number, address?: string) {
    const { data } = await api.post<ApiResponse<Attendance>>('/attendance/check-out', {
      latitude, longitude, accuracy, address,
    });
    return data.data!;
  },

  async getToday() {
    const { data } = await api.get<ApiResponse<Attendance[]>>('/attendance/today');
    return data.data!;
  },

  async getCheckedIn() {
    const { data } = await api.get<ApiResponse<Attendance[]>>('/attendance/checked-in');
    return data.data!;
  },

  async getHistory(params?: Record<string, string>) {
    const { data } = await api.get<PaginatedResponse<Attendance>>('/attendance/history', { params });
    return data;
  },

  async getEmployeeToday(employeeId: string) {
    const { data } = await api.get<ApiResponse<Attendance>>(`/attendance/employee/${employeeId}/today`);
    return data.data;
  },

  async getStats() {
    const { data } = await api.get<ApiResponse>('/attendance/stats');
    return data.data;
  },
};
