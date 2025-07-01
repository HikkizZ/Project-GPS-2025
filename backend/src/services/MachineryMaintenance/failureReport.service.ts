import { AppDataSource } from "config/configDB.js";
import { MaintenanceHistory } from "entity/MachineryMaintenance/MaintenanceHistory.entity.js";
import { ServiceResponse } from "../../../types.js";
import { CreateFailureReportDTO, UpdateFailureReportDTO } from "types/MachineryMaintenance/failureReport.dto.js";
import { FailureReport } from "entity/MachineryMaintenance/FailureReport.entity.js";
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"

export async function createFailureReport(data: CreateFailureReportDTO): Promise<ServiceResponse<FailureReport>> {
    try {
        
        const failureRepo = AppDataSource.getRepository(FailureReport);
        const maquinariaRepo = AppDataSource.getRepository(Maquinaria);
        const maquinaria = await maquinariaRepo.findOneBy({ id: data.maquinariaId});
       
        
        if(!maquinaria){
            return [null, "Maquinaraia no encontrada"];
        };

        const nuevo = failureRepo.create({

            description: data.descripcion,
            resolved: false, 
            date: new Date(),
            maquinaria: maquinaria

        });

        const saved = await failureRepo.save(nuevo);
        return [saved, null];

    } catch (error) {
        console.error("Error al registrar el fallo", error)
        return[null, "Error al registrar el fallo"];
        
    }
}

export async function getAllFailureReport(): Promise<ServiceResponse<FailureReport[]>>{

    try {
        const repo = AppDataSource.getRepository(FailureReport);
        const fallos = await repo.find({relations: ["maquinaria"]})

        if(!fallos.length){
                        
            console.log("No hay fallos registrados")
            return [null, "No hay fallos registrados"];
        };

        console.log("Fallos:    ", fallos);
        return[fallos, null];

    } catch (error) {

        console.error("Error al obtener fallos", error);
        return[null, "Error al obtener los fallos"];
        
    }
    
}

export async function getFailureReport(id:number): Promise<ServiceResponse<FailureReport>>{

    try {
        
        const repo = AppDataSource.getRepository(FailureReport);
        const fallo = await repo.findOne({
            where: {id},
            relations: ["maquinaria"]
        });

        if(!fallo){

            console.log("Fallo: ", fallo)
            return [null, "Fallo no encontrado"]
        };
        return [fallo, null];

    } catch (error) {

        console.error("Error al obtener EL fallo", error);
        return [null, "Error al buscar el fallo"];
        
    }


}

export async function updateFailureReport(id: number, data: UpdateFailureReportDTO): Promise<ServiceResponse<FailureReport>> {

    try {
        
        const repo = AppDataSource.getRepository(FailureReport);
        const existente = await repo.findOneBy({id});

        if(!existente){
            return [null, "No se encontró el fallo solicitado"];
        }

        if(data.descripcion !== undefined){
            existente.description = data.descripcion;
        }

        if(data.resuelto !== undefined){
            existente.resolved = data.resuelto;

        }

        if(data.fecha !== undefined) existente.date = new Date(data.fecha);

        const actualizado = await repo.save(existente);
        return [actualizado, null];



    } catch (error) {
        console.error("Error al actualizar el error:", error);
        return [null, "Error al actualizar el fallo"];
    }



}

export async function deleteFailureReport(id: number): Promise<ServiceResponse<FailureReport>> {
    
    try{
        const repor = AppDataSource.getRepository(FailureReport);
        const existe = await repor.findOneBy({id});

        if(!existe){

            return[null, "No se encontró el fallo solicitado"];

        }

        await repor.remove(existe);
        return [existe, null];
    }catch(error){
        console.error("Error al eliminar el fallo", error);
        return[null, "Error al eliminar el fallo"]
    }

}



/*export async function getAllFailureReport(): Promise<ServiceResponse<FailureReport[]>>{
    try {
        
    } catch (error) {
        
    }
}*/