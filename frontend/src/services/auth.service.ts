import axios from 'axios';
import { API_CONFIG, getAuthHeaders } from '@/config/api.config';
import { LoginData, RegisterData, AuthResponse, User, JWTPayload } from '@/types/auth.types';

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;
  private tokenKey = 'token';
  private userKey = 'user';

  // Login de usuario
  async login(credentials: LoginData): Promise<any> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem(this.tokenKey, data.token);
        // Decodificar y guardar información del usuario
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const userData = {
          name: payload.name,
          email: payload.email,
          role: payload.role,
          rut: payload.rut
        };
        localStorage.setItem(this.userKey, JSON.stringify(userData));
      }
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Registro de usuario (requiere autenticación)
  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/login';
  }

  // Gestión del token en localStorage
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }

  // Obtener información del usuario del token
  getCurrentUser(): JWTPayload | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

// Instancia singleton del servicio
export const authService = new AuthService(); 