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

  // Actualizar usuario por ID
  async updateUser(id: number, updates: Partial<SafeUser>) {
    await apiClient.put(`/users/${id}`, updates);
  },

  // Cambiar contraseña propia
  async changeOwnPassword(newPassword: string) {
    await apiClient.put('/users/password', {
      newPassword
    });
  }
}; 