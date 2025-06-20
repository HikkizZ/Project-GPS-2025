// Re-export all auth types
export * from './auth.types';

// Re-export all recursosHumanos types
export * from './recursosHumanos/fichaEmpresa.types';
export * from './recursosHumanos/trabajador.types';

// Common interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  rut: string;
  role?: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    token: string;
    user?: User;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  rut: string;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: string;
  rut: string;
  estadoCuenta: string;
  createAt: Date;
  updateAt: Date;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
}

// JWT Payload interface extendida
export interface CustomJwtPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  rut: string;
  exp?: number;
  iat?: number;
} 