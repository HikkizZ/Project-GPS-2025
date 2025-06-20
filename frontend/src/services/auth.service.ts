import { apiClient } from '@/config/api.config';
import { LoginData, RegisterData, AuthResponse, User, CustomJwtPayload } from '@/types';
import { jwtDecode } from "jwt-decode";

class AuthService {
  private storageKey = 'auth_token';

  async login(credentials: LoginData): Promise<{ user?: User; error?: string }> {
    try {
      console.log('Enviando solicitud de login...');
      const data = await apiClient.post<AuthResponse>('/auth/login', credentials);
      console.log('Respuesta del servidor:', data);

      if (data.status === 'success' && data.data?.token) {
        const token = data.data.token;
        localStorage.setItem(this.storageKey, token);

        try {
          const payload = jwtDecode<CustomJwtPayload>(token);
          const user: User = {
            id: payload.id || 0,
            name: payload.name || 'Usuario',
            email: payload.email || credentials.email,
            role: payload.role || 'Usuario',
            rut: payload.rut || 'N/A'
          };

          console.log('Usuario decodificado:', user);
          return { user };
        } catch (decodeError) {
          console.error('Error decodificando token:', decodeError);
          return { error: 'Token inválido' };
        }
      } else {
        return { error: data.message || 'Error al iniciar sesión' };
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      return { error: error.message || 'Error de conexión' };
    }
  }

  async register(userData: RegisterData): Promise<{ user?: User; error?: string }> {
    try {
      console.log('Enviando solicitud de registro...');
      const data = await apiClient.post<AuthResponse>('/auth/register', userData);
      console.log('Respuesta del servidor:', data);

      if (data.status === 'success') {
        return {
          user: data.data?.user
        };
      } else {
        return {
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { error: error.message || 'Error de conexión' };
    }
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = jwtDecode<CustomJwtPayload>(token);
      if (!payload.exp) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token || !this.isTokenValid()) return null;

    try {
      const payload = jwtDecode<CustomJwtPayload>(token);
      return {
        id: payload.id || 0,
        name: payload.name || 'Usuario',
        email: payload.email || '',
        role: payload.role || 'Usuario',
        rut: payload.rut || 'N/A'
      };
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }
}

export const authService = new AuthService();
export default authService; 