import { API_CONFIG } from '@/config/api.config';
import { SafeUser, UpdateUserData } from '@/types.d';
import axios from 'axios';

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
      const response = await fetch(`${this.baseURL}/users/${id}`, {
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

  async searchUsers(query: any): Promise<{ users?: SafeUser[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      const response = await axios.get(
        `${this.baseURL}/users/search?${queryParams}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }
      );
      if (response.data.status === 'success' && response.data.data) {
        return { users: response.data.data };
      }
      return { error: response.data.message };
    } catch (error: any) {
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService(); 