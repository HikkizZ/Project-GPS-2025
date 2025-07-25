// Todos los roles posibles del sistema (incluyendo SuperAdministrador)
export type UserRole = 
    | "SuperAdministrador"
    | "Administrador"
    | "Usuario"
    | "RecursosHumanos"
    | "Gerencia"
    | "Ventas"
    | "Arriendo"
    | "Finanzas"
    | "Mecánico"
    | "Mantenciones de Maquinaria";

// Roles disponibles para filtrado y asignación (excluyendo SuperAdministrador)
export type FilterableUserRole = Exclude<UserRole, "SuperAdministrador">;

export interface User {
  id: number;
  name: string;
  corporateEmail: string;
  role: string;
  rut: string;
  estadoCuenta: string;
  createAt: string;
  updateAt: string;
}

export interface LoginData {
  corporateEmail: string;
  password: string;
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
  corporateEmail: string;
  role: UserRole;
  rut: string;
}

export interface SafeUser {
    id: number;
    name: string;
    rut: string;
    corporateEmail: string;
    role: UserRole;
    estadoCuenta: string;
    createAt: string;
    updateAt: string;
    password?: string;
    showPassword?: boolean;
} 

export interface CustomJwtPayload {
  id: number;
  name: string;
  corporateEmail: string;
  role: string;
  rut: string;
} 