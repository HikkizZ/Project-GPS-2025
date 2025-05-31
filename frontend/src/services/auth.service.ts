import axios from 'axios';
import { API_CONFIG, getAuthHeaders } from '@/config/api.config';
import { LoginData, RegisterData, AuthResponse, User } from '@/types/auth.types';

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;
  private tokenKey = 'authToken';
  private userKey = 'userData';

  // Login de usuario
  async login(credentials: LoginData): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
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
  async register(registerData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No hay token de autenticación' };
      }

      const response = await axios.post<AuthResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        registerData,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.status === 'success') {
        return { 
          success: true, 
          user: response.data.data as User 
        };
      }

      return { 
        success: false, 
        error: response.data.message || 'Error desconocido' 
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error.response?.data?.message) {
        return { 
          success: false, 
          error: error.response.data.message 
        };
      }
      return { 
        success: false, 
        error: 'Error de conexión con el servidor' 
      };
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Gestión del token en localStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userData = localStorage.getItem(this.userKey);
    if (!token || !userData) return false;

    try {
      // Verificar si el token no está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Obtener información del usuario
  getCurrentUser(): any | null {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}

// Instancia singleton del servicio
export const authService = new AuthService(); 