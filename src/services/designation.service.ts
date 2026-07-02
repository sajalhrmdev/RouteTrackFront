import api from '@/lib/api';
import { Designation, ApiResponse } from '@/types';

export const designationService = {
  async getAll() {
    const { data } = await api.get<ApiResponse<Designation[]>>('/designations');
    return data.data!;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Designation>>(`/designations/${id}`);
    return data.data!;
  },

  async create(designation: Partial<Designation>) {
    const { data } = await api.post<ApiResponse<Designation>>('/designations', designation);
    return data.data!;
  },

  async update(id: string, designation: Partial<Designation>) {
    const { data } = await api.put<ApiResponse<Designation>>(`/designations/${id}`, designation);
    return data.data!;
  },

  async delete(id: string) {
    await api.delete(`/designations/${id}`);
  },
};
