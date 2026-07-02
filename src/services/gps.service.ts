import api from '@/lib/api';
import { GpsLocation, RouteHistory, ApiResponse } from '@/types';

export const gpsService = {
  async recordLocation(latitude: number, longitude: number, extra?: Partial<GpsLocation>) {
    const { data } = await api.post<ApiResponse<GpsLocation>>('/gps/location', {
      latitude, longitude, ...extra,
    });
    return data.data!;
  },

  async recordBatch(locations: Partial<GpsLocation>[], attendanceId: string) {
    const { data } = await api.post('/gps/batch', { locations, attendanceId });
    return data;
  },

  async getRouteHistory(employeeId: string, date: string) {
    const { data } = await api.get<ApiResponse<RouteHistory>>(`/gps/history/${employeeId}`, {
      params: { date },
    });
    return data.data!;
  },

  async getLastLocation(employeeId: string) {
    const { data } = await api.get<ApiResponse<GpsLocation>>(`/gps/last/${employeeId}`);
    return data.data;
  },
};
