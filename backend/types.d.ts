/* Role Types */
export type userRole = 'Administrador' | 'Usuario' | 'RecursosHumanos' | 'Gerencia' | 'Ventas' | 'Arriendo' | 'Finanzas';

/* userResponse Interface */
export interface UserResponse {
    id: number;
    name: string;
    rut: string;
    email: string;
    role: string;
    createAt: string;
    updateAt: string; 
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

export type UpdateUserData = {
    name?: string;
    email?: string;
    rut?: string;
    password?: string;
    newPassword?: string;
    role?: userRole;
}

export interface SafeUser extends Omit<User, 'password'> {
    password?: string;
    showPassword?: boolean;
}
