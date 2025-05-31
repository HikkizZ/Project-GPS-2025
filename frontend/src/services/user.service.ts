import { API_CONFIG } from '@/config/api.config';
import { SafeUser, UpdateUserData } from '@/types/auth.types';

class UserService {
  private baseURL = API_CONFIG.BASE_URL;

  async getAllUsers(): Promise<SafeUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/users/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw error;
    }
  }

  async updateUser(userId: number, rut: string, role: string): Promise<SafeUser> {
    try {
      const response = await fetch(`${this.baseURL}/users/update?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error en updateUser:', error);
      throw error;
    }
  }

  async deleteUser(userId: number, rut: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/delete?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService(); 