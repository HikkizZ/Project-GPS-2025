export type CreateFailureReportDTO = {
    
    maquinariaId: number;
    fecha: string; // formato ISO: yyyy-mm-dd
    descripcion: string;
    resuelto: boolean;

};

export type UpdateFailureReportDTO = {

    descripcion: string;
    fecha: string;
    resuelto: boolean;

}

