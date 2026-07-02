import api from '@/lib/api';
import { ApiResponse } from '@/types';

export interface LiveLocation {
  id: string;
  companyId: string;
  employeeId: string;
  attendanceId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    avatar: string | null;
    phone: string | null;
    department: { name: string } | null;
    designation: { name: string } | null;
    isOnline: boolean;
  };
  attendance: {
    id: string;
    checkInTime: string;
    totalDistance: number;
    totalWorkingTime: number;
  };
}

export const liveLocationService = {
  async getActiveLocations() {
    const { data } = await api.get<ApiResponse<LiveLocation[]>>('/live-locations');
    return data.data!;
  },
};
