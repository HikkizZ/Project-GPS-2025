import { API_CONFIG } from '@/config/api.config';
import { SafeUser, UpdateUserData } from '@/types.d';

class UserService {
  private baseURL = API_CONFIG.BASE_URL;

  async getAllUsers(): Promise<SafeUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

  async updateUser(id: number, rut: string, updates: { role?: string, password?: string }): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/update?id=${id}&rut=${rut}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar usuario');
      }
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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