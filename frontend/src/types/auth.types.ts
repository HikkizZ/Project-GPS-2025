export type UserRole = 'SuperAdministrador' | 'Administrador' | 'Usuario' | 'RecursosHumanos' | 'Gerencia' | 'Ventas' | 'Arriendo' | 'Finanzas';

export interface User {
  id: number;
  name: string;
  rut: string;
  email: string;
  role: UserRole;
  estadoCuenta: string;
  createAt: string;
  updateAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  rut: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    token: string;
  } | User;
}

export interface JWTPayload {
  name: string;
  email: string;
  role: UserRole;
  rut: string;
}

export interface SafeUser {
    id: number;
    name: string;
    rut: string;
    email: string;
    role: UserRole;
    estadoCuenta: string;
    createAt: string;
    updateAt: string;
    password?: string;
    showPassword?: boolean;
} 