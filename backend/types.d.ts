/* Role Types */
export type userRole = 
    | "SuperAdministrador"
    | "Administrador" 
    | "Usuario" 
    | "RecursosHumanos" 
    | "Gerencia" 
    | "Ventas" 
    | "Arriendo" 
    | "Finanzas" 
    | "Mecánico" 
    | "Mantenciones de Maquinaria"
    | "Conductor";

/* userResponse Interface */
export interface UserResponse {
    id: number;
    name: string;
    corporateEmail: string;
    role: userRole;
    rut: string | null;
    estadoCuenta: string;
    createAt: Date;
    updateAt: Date;
}

import { User } from '../entity/user.entity.js';
declare module 'express' {
    export interface Request {
        user?: User;
    }
}

/* User Services Types */
export type ServiceResponse<T> = [T | null, string | { message: string} | null];

export type QueryParams = {
    id?: number;
    email?: string;
    rut?: string;
    role?: userRole;
    name?: string;
}

export type UserQueryParams = {
    id?: number;
    corporateEmail?: string;
    rut?: string;
    role?: userRole;
    name?: string;
}

export type UpdateUserData = {
    name?: string;
    corporateEmail?: string;
    password?: string;
    role?: userRole;
    rut?: string;
    estadoCuenta?: string;
}

export interface UserData {
    name: string;
    corporateEmail: string;
    password: string;
    role: userRole;
    rut: string;
    estadoCuenta?: string;
}

export interface LoginData {
    corporateEmail: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
}

export interface SafeUser extends Omit<User, 'password'> {
    password?: string;
    showPassword?: boolean;
}
