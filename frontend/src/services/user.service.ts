import { apiClient } from '@/config/api.config';
import { SafeUser, UpdateUserData } from '@/types';

class UserService {
  async getAllUsers(): Promise<SafeUser[]> {
    try {
      const data = await apiClient.get<{ data: SafeUser[] }>('/users/');
      return data.data || [];
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw error;
    }
  }

  async updateUser(id: number, rut: string, updates: { role?: string, password?: string }): Promise<void> {
    try {
      await apiClient.put(`/users/${id}`, updates);
    } catch (error) {
      console.error('Error en updateUser:', error);
      throw error;
    }
  }

  async deleteUser(userId: number, rut: string): Promise<void> {
    try {
      await apiClient.delete(`/users/delete?id=${userId}`);
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  }

  async searchUsers(query: any): Promise<{ users?: SafeUser[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const data = await apiClient.get<{ status: string; data: SafeUser[]; message: string }>(
        `/users/search?${queryParams}`
      );
      
      if (data.status === 'success') {
        return { users: data.data || [] };
      }
      return { error: data.message };
    } catch (error: any) {
      return { error: error.message || 'Error de conexión con el servidor' };
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService(); 