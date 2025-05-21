/* Role Types */
export type userRole = 'Administrador' | 'Usuario' | 'RecursosHumanos' | 'Gerencia' |'Ventas' | 'Arriendo' | 'Finanzas';

/* Product Types */
export enum ProductType {
    BASE_ESTABILIZADA = 'BASE_ESTABILIZADA',
    GRAVILLA = 'GRAVILLA',
    MAICILLO = 'MAICILLO',
    BOLON = 'BOLON',
    ARENA = 'ARENA',
    GRAVA = 'GRAVA',
    RIPIO = 'RIPIO',
    RELLENO = 'RELLENO'
}

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
import { Request } from 'express';

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
}

export type UpdateUserData = {
    name?: string;
    email?: string;
    rut?: string;
    password?: string;
    newPassword?: string;
    role?: userRole;
}

export type SafeUser = Omit<User, 'password'>; // Exclude the password field from the User type

export type CreateProductDTO = {
  product: ProductType;
  salePrice: number;
};

export type UpdateProductDTO = Partial<CreateProductDTO>;
