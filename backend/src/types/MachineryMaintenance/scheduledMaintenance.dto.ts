export type CreateScheduledMaintenanceDTO = {

    maquinariaId: number;
    fechaProgramada: string;
    tarea: string;
    completado: boolean;


}

export type UpdateScheduledMaintenanceDTO = {

    maquinariaId: number;
    fechaProgramada: string
    tarea: string;
    completado: boolean;
    
}