/* Role Types */
export type userRole = 'Admin' | 'Profesor' | 'Alumno' | 'Encargado' |'Usuario' | 'Invitado';

/* Priority Types */
export type taskPriority = 'Alta' | 'Media' | 'Baja';

/* Status Types */
export type taskStatus = 'Pendiente' | 'En Proceso' | 'Finalizada' | 'Cancelada';

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