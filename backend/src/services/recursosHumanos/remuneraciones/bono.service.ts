import { AppDataSource } from "../../../config/configDB.js";
import { Bono, temporalidad, tipoBono } from "../../../entity/recursosHumanos/Remuneraciones/Bono.entity.js";
import { AsignarBono } from "../../../entity/recursosHumanos/Remuneraciones/asignarBono.entity.js";
import { Trabajador } from "../../../entity/recursosHumanos/trabajador.entity.js";
import { Repository } from "typeorm";
import { 
    CreateBonoDTO, 
    UpdateBonoDTO, 
    BonoQueryDTO, 
    BonoResponseDTO, 
    AsignarBonoDTO, 
    AsignarBonoQueryDTO, 
    AsignarBonoResponseDTO, 
    UpdateAsignarBonoDTO } 
    from "types/recursosHumanos/bono.dto.js";
import { ServiceResponse } from "../../../../types.js";
import { Between, Like, FindManyOptions, DeepPartial, Not } from "typeorm";
import { date } from "joi";
import { calcularFechaFin } from "../fichaEmpresa.service.js"; 

export async function getAllBonosService(): Promise<ServiceResponse<{ bonos: Bono[]; total: number }>> {
    try {
        const bonosRep = AppDataSource.getRepository(Bono);
        // Obtener todos los bonos ordenados por fecha de creación
        const [bonos, total] = await bonosRep.findAndCount({ order: { fechaCreacion: "DESC" } });

        return [{ bonos, total }, null];
    }catch (error) {
        console.error("Error al obtener bonos:", error);
        return [null, "Error interno del servidor"];
    }
}

// Obtener bonos por ID
export async function getBonoByIdService(id: number): Promise<ServiceResponse<Bono>> {
    try {
        const bonosRep = AppDataSource.getRepository(Bono);
        const bono = await bonosRep.findOne({
            where: { id }
            // relations: ["asignaciones"] // Si la relacion es necesaria
        });
        if (!bono) {
            return [null, "Bono no encontrado"];
        }
        return [bono, null];
    } catch (error) {
        console.error("Error al obtener bono por ID:", error);
        return [null, "Error interno del servidor"];
    }
}

//Crear Bono
export async function createBonoService(data: CreateBonoDTO): Promise<ServiceResponse<Bono>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const bonosRep = queryRunner.manager.getRepository(Bono);

        //obtener data del bono
        const bonoData: DeepPartial<Bono> = {
            nombreBono: data.nombreBono,
            monto: data.monto,
            tipoBono: data.tipoBono as tipoBono,
            temporalidad: data.temporalidad as temporalidad,
            descripcion: data.descripcion,
            imponible: data.imponible ?? true, // Por defecto es true si no se especifica
            duracionMes: data.duracionMes,
        }

        // Validar si el bono ya existe
        const existingBonoNombre = await bonosRep.findOne({
            where: { nombreBono: bonoData.nombreBono }
        });
        if (existingBonoNombre) {
            await queryRunner.rollbackTransaction();
            return [null, "Ya existe un bono con el mismo nombre"];
        }
        const existingBonoCaracteristicas = await bonosRep.findOne({
            where: {
                temporalidad: bonoData.temporalidad,
                monto: bonoData.monto,
                imponible: bonoData.imponible,
                duracionMes: bonoData.duracionMes,
            }
        });

        if (existingBonoCaracteristicas) {
            await queryRunner.rollbackTransaction();
            return [null, "Ya existe un bono con las mismas características"];
        }

        const nuevoBono = bonosRep.create(bonoData);
        await queryRunner.manager.save(nuevoBono);
        await queryRunner.commitTransaction();
        
        return [nuevoBono, null];

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al crear bono:", error);
        return [null, "Error interno del servidor"];
    } finally {
        await queryRunner.release();
    }
}

// Actualizar Bono
export async function updateBonoService(data: UpdateBonoDTO, id: number): Promise<ServiceResponse<Bono>> {
try {
    const bonosRep = AppDataSource.getRepository(Bono);
    const bono = await bonosRep.findOneBy({ id });
    if (!bono) {
        return [null, "Bono no encontrado"];
    }
    // Validar que las caracteristicas del bono no sean iguales a las del bono actual
    if (data.monto === bono.monto &&
        data.tipoBono === bono.tipoBono &&
        data.temporalidad === bono.temporalidad &&
        data.imponible === bono.imponible &&
        data.descripcion === bono.descripcion &&
        data.duracionMes === bono.duracionMes) {
        return [null, "No se han realizado cambios en el bono"];
    }
    // Actualizar campos del bono
    if (data.nombreBono !== undefined) bono.nombreBono = data.nombreBono
    if (data.monto !== undefined) bono.monto = data.monto;
    if (data.tipoBono !== undefined) bono.tipoBono = data.tipoBono as tipoBono;
    if (data.temporalidad !== undefined) bono.temporalidad = data.temporalidad as temporalidad;
    if (data.descripcion !== undefined) bono.descripcion = data.descripcion;
    if (data.imponible !== undefined) bono.imponible = data.imponible;
    if (data.duracionMes !== undefined) bono.duracionMes = data.duracionMes;
    
    // Validar si el nombre del bono ya existe
    if (data.nombreBono) {
        const existingBonoNombre = await bonosRep.findOne({
            where: { nombreBono: data.nombreBono, id: Not(id) } // Excluir el bono actual
        });
        if (existingBonoNombre) {
            return [null, "Ya existe un bono con el mismo nombre"];
        }
    }
    // Validar si las caracteristicas del bono ya existen
    if (data.temporalidad || data.monto || data.imponible || data.duracionMes) {

        const existingBonoCaracteristicas = await bonosRep.findOne({
            where: {
                temporalidad: bono.temporalidad,
                monto: bono.monto,
                imponible: bono.imponible,
                duracionMes: bono.duracionMes,
            }
        });
        if (existingBonoCaracteristicas) {
            return [null, "Ya existe un bono con las mismas características"];
        }
    }
    // Actualizar asignaciones relacionadas al bono
    const asignacionesRep = AppDataSource.getRepository(AsignarBono);
    const asignaciones = await asignacionesRep.find({
        where: { bono: { id } },
        relations: ["bono", "fichaEmpresa"]
    });

    for (const asignacion of asignaciones) {
        if (data.temporalidad || data.duracionMes) {
            asignacion.fechaFinAsignacion = calcularFechaFin(
                bono.temporalidad,
                asignacion.fechaAsignacion,
                bono.duracionMes
            );
        }
        await asignacionesRep.save(asignacion);
    }
    // Guardar cambios
    await bonosRep.save(bono);
    return [bono, null];
} catch (error) {
    console.error("Error al actualizar bono:", error);
    return [null, "Error interno del servidor"];
  }
}

// Eliminar Bono
export async function deleteBonoService(id: number): Promise<ServiceResponse<Bono>> {
    try {
            const bonosRep = AppDataSource.getRepository(Bono);
            const bono = await bonosRep.findOneBy({ id });
            if (!bono) { return [null, "Bono no encontrado"] }
            // Eliminar bono
            await bonosRep.remove(bono);
            return [bono, null];
    } catch (error) {
        console.error("Error al eliminar bono:", error);
        return [null, "Error interno del servidor"];
    }
}
