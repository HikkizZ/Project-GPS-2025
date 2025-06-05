export enum userRole {
    Administrador = "Administrador",
    Usuario = "Usuario",
    Trabajador = "Trabajador",
    RecursosHumanos = "RecursosHumanos",
    Gerencia = "Gerencia",
    Ventas = "Ventas",
    Arriendo = "Arriendo",
    Finanzas = "Finanzas"
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: userRole;
    rut: string;
    estadoCuenta: string;
    createAt: Date;
    updateAt: Date;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: userRole;
    rut?: string;
    estadoCuenta?: string;
}

export interface UserData {
    name: string;
    email: string;
    password: string;
    role: userRole;
    rut: string;
    estadoCuenta?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
} 