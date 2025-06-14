import { API_CONFIG, getAuthHeaders } from '@/config/api.config';
import { LoginData, RegisterData, AuthResponse, User } from '@/types.d';
import { jwtDecode } from "jwt-decode";

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;
  private tokenKey = 'authToken';
  private userKey = 'userData';

  // Login de usuario
  async login(credentials: LoginData): Promise<any> {
    try {
      console.log('Intentando login con:', this.baseURL + '/auth/login');
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { error: 'No se puede conectar con el servidor. Por favor, verifica que el servidor esté corriendo.' };
        }
        const errorData = await response.json().catch(() => ({
          message: 'Error de conexión con el servidor'
        }));
        return { error: errorData.message || 'Error al iniciar sesión' };
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data?.token) {
        const token = data.data.token;
        localStorage.setItem(this.tokenKey, token);
        
        try {
          const payload = jwtDecode(token);
          const userData = {
            name: payload.name || 'Usuario',
            email: payload.email || credentials.email,
            role: payload.role || 'Usuario',
            rut: payload.rut || 'N/A'
          };
          localStorage.setItem(this.userKey, JSON.stringify(userData));
          return { token, ...data };
        } catch (decodeError) {
          console.error('Error decodificando token:', decodeError);
          this.logout();
          return { error: 'Error al procesar la información del usuario' };
        }
      } else {
        return { error: data.message || 'Error al iniciar sesión' };
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.logout();
      return { error: error.message || 'Error de conexión' };
    }
  }

  // Registro de usuario (requiere autenticación)
  async register(registerData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No hay token de autenticación' };
      }

      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        return { 
          success: true, 
          user: data.data 
        };
      }

      return { 
        success: false, 
        error: data.message || 'Error desconocido' 
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.message || 'Error de conexión con el servidor' 
      };
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
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

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userData = localStorage.getItem(this.userKey);
    if (!token || !userData) return false;

    try {
      // Verificar si el token no está expirado
      const payload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

export const authService = new AuthService(); 