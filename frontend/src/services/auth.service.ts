import axios from 'axios';
import { API_CONFIG, getAuthHeaders } from '@/config/api.config';
import { LoginData, RegisterData, AuthResponse, User } from '@/types/auth.types';

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  // Login de usuario
  async login(loginData: LoginData): Promise<{ token?: string; error?: string }> {
    try {
      const response = await axios.post<AuthResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        loginData,
        { headers: API_CONFIG.HEADERS }
      );

      if (response.data.status === 'success' && response.data.data && 'token' in response.data.data) {
        const token = response.data.data.token;
        this.setToken(token);
        return { token };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error en login:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Registro de usuario (requiere autenticación)
  async register(registerData: RegisterData): Promise<{ user?: User; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { error: 'No hay token de autenticación' };
      }

      const response = await axios.post<AuthResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        registerData,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.status === 'success' && response.data.data && !('token' in response.data.data)) {
        return { user: response.data.data as User };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Logout
  logout(): void {
    this.removeToken();
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
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar si el token no está expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Obtener información del usuario del token
  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }
}

// Instancia singleton del servicio
export const authService = new AuthService(); 