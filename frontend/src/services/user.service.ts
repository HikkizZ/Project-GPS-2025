import { SafeUser } from '@/types';
import { apiClient } from '@/config/api.config';

export const userService = {
  // Obtener usuarios (con o sin filtros)
  async getUsers(filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/users?${queryParams}` : '/users';
    const data = await apiClient.get<{ data: SafeUser[] }>(url);
    return data;
  },

  // Actualizar usuario por id, rut o corporateEmail
  async updateUser(query: { id?: number; rut?: string; corporateEmail?: string }, updates: { role?: string; password?: string }) {
    const params = new URLSearchParams();
    if (query.id) params.append('id', String(query.id));
    if (query.rut) params.append('rut', query.rut);
    if (query.corporateEmail) params.append('corporateEmail', query.corporateEmail);
    await apiClient.put(`/users/update?${params.toString()}`, updates);
  },

  // Cambiar contraseña propia
  async changeOwnPassword(newPassword: string) {
    await apiClient.put('/users/password', {
      newPassword
    });
  }
}; 