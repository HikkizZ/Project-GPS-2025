export interface CreateCapacitacionDTO {
    trabajadorId: number;
    nombreCurso: string;
    institucion: string;
    fecha: string | Date;
    duracion: string;
    certificadoURL?: string;
    file?: Express.Multer.File;
}

export interface UpdateCapacitacionDTO {
    nombreCurso?: string;
    institucion?: string;
    fecha?: string | Date;
    duracion?: string;
    certificadoURL?: string;
}

export interface CapacitacionQueryDTO {
    id?: number;
    trabajadorId?: number;
    institucion?: string;
    fechaDesde?: string | Date;
    fechaHasta?: string | Date;
    limit?: number;
    offset?: number;
}

export interface CapacitacionResponseDTO {
    id: number;
    trabajador: {
        id: number;
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
        rut: string;
    };
    nombreCurso: string;
    institucion: string;
    fecha: Date;
    duracion: string;
    certificadoURL?: string;
    fechaRegistro: Date;
} 