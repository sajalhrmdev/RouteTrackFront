import api from '@/lib/api';
import { Employee, PaginatedResponse, ApiResponse } from '@/types';

export const employeeService = {
  async getAll(params?: Record<string, string>) {
    const { data } = await api.get<PaginatedResponse<Employee>>('/employees', { params });
    return data;
  },

  async getMe() {
    const { data } = await api.get<ApiResponse<Employee>>('/employees/me');
    return data.data!;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data.data!;
  },

  async create(employee: Partial<Employee>) {
    const { data } = await api.post<ApiResponse<Employee>>('/employees', employee);
    return data.data!;
  },

  async update(id: string, employee: Partial<Employee>) {
    const { data } = await api.put<ApiResponse<Employee>>(`/employees/${id}`, employee);
    return data.data!;
  },

  async delete(id: string) {
    await api.delete(`/employees/${id}`);
  },

  async getStats() {
    const { data } = await api.get<ApiResponse>('/employees/stats');
    return data.data;
  },
};
