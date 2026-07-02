import api from '@/lib/api';
import { Department, ApiResponse } from '@/types';

export const departmentService = {
  async getAll() {
    const { data } = await api.get<ApiResponse<Department[]>>('/departments');
    return data.data!;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return data.data!;
  },

  async create(department: Partial<Department>) {
    const { data } = await api.post<ApiResponse<Department>>('/departments', department);
    return data.data!;
  },

  async update(id: string, department: Partial<Department>) {
    const { data } = await api.put<ApiResponse<Department>>(`/departments/${id}`, department);
    return data.data!;
  },

  async delete(id: string) {
    await api.delete(`/departments/${id}`);
  },
};
