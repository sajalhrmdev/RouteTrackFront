import api from '@/lib/api';
import { AuthResponse, ApiResponse } from '@/types';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data.data!;
  },

  async register(email: string, password: string, name: string, companyName: string) {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      email, password, name, companyName,
    });
    return data.data!;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token', { refreshToken }
    );
    return data.data!;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async getMe() {
    const { data } = await api.get<ApiResponse>('/auth/me');
    return data.data;
  },
};
