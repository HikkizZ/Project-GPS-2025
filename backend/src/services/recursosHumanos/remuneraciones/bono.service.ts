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
import { Between, Like, FindManyOptions, DeepPartial } from "typeorm";
import { date } from "joi";

export async function getAllBonosService(query: BonoQueryDTO = {}): Promise<ServiceResponse<{ bonos: Bono[]; total: number }>> {
    try {
        const bonosRep = AppDataSource.getRepository(Bono);

        const options: FindManyOptions<Bono> = {
            where: {},
            take: query.limit,
            skip: query.offset,
            order: { fechaCreacion: "DESC" }
        };

        // Construir where clause
            const whereConditions: any = {};
        if (query.id) {
            whereConditions.id = query.id;
        }
        if (query.nombreBono) {
            whereConditions.nombreBono = Like(`%${query.nombreBono}%`);
        }
        if (query.tipoBono) {
            whereConditions.tipoBono = query.tipoBono as tipoBono;
        }
        if (query.temporalidad) {
            whereConditions.temporalidad = query.temporalidad as temporalidad;
        }
        if (query.fechaCreacionDesde && query.fechaCreacionHasta) {
                whereConditions.fecha = Between(new Date(query.fechaCreacionDesde), new Date(query.fechaCreacionHasta));
            } else if (query.fechaCreacionDesde) {
                whereConditions.fecha = Between(new Date(query.fechaCreacionDesde), new Date());
            } else if (query.fechaCreacionHasta) {
                whereConditions.fecha = Between(new Date('1900-01-01'), new Date(query.fechaCreacionHasta));
            }
        if (query.imponible !== undefined) {
            whereConditions.imponible = query.imponible;
        }

        if (Object.keys(whereConditions).length > 0) {
                options.where = whereConditions;
            }
        
        const [bonos, total] = await bonosRep.findAndCount(options);

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
        }

        // Validar si el bono ya existe
        const { Op } = require('sequelize');

        const existingBono = await bonosRep.findOne({
        where: {
            [Op.or]: [
            { nombreBono: bonoData.nombreBono },
            {
                [Op.and]: [
                { tipoBono: bonoData.tipoBono },
                { temporalidad: bonoData.temporalidad },
                { monto: bonoData.monto },
                { imponibilidad: bonoData.imponible }
                ]
            }
            ]
        }
        });

        if (existingBono) {
            await queryRunner.rollbackTransaction();
            return [null, "Ya existe un bono con los mismos parámetros. Mismo nombre o mismas caracteristicas."];
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

export async function updateBonoService(data: UpdateBonoDTO, id: number): Promise<ServiceResponse<Bono>> {
try {
    const bonosRep = AppDataSource.getRepository(Bono);
    const bono = await bonosRep.findOneBy({ id });
    if (!bono) {
        return [null, "Bono no encontrado"];
    }
    // Actualizar campos del bono
    if (data.nombreBono !== undefined) bono.nombreBono = data.nombreBono
    if (data.monto !== undefined) bono.monto = data.monto;
    if (data.tipoBono !== undefined) bono.tipoBono = data.tipoBono as tipoBono;
    if (data.temporalidad !== undefined) bono.temporalidad = data.temporalidad as temporalidad;
    if (data.descripcion !== undefined) bono.descripcion = data.descripcion;
    if (data.imponible !== undefined) bono.imponible = data.imponible;
    
    // Validar si el bono con los nuevos datos choca con otro existente
    const { Op } = require('sequelize');
    // Excluir el bono actual de la búsqueda
    const { Not } = require('sequelize').Op;
    const existingBono = await bonosRep.findOne({
        where: {
            id: Not(id), // Excluir el bono actual
            [Op.or]: [
                { nombreBono: bono.nombreBono },
                {
                    [Op.and]: [
                        { tipoBono: bono.tipoBono },
                        { temporalidad: bono.temporalidad },
                        { monto: bono.monto },
                        { imponible: bono.imponible }
                    ]
                }
            ]
        }
    });
    if (existingBono) {
        return [null, "Ya existe un bono con los mismos parámetros. Mismo nombre o mismas caracteristicas."];
    }
    // Guardar cambios
    await bonosRep.save(bono);
    return [bono, null];
} catch (error) {
    console.error("Error al actualizar bono:", error);
    return [null, "Error interno del servidor"];
  }
}

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