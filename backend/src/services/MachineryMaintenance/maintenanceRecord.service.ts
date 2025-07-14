import { AppDataSource } from "../../config/configDB.js";
import { MaintenanceRecord, EstadoMantencion } from "../../entity/MachineryMaintenance/maintenanceRecord.entity.js";
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js";
import { User } from "../../entity/user.entity.js";
import { SparePart } from "../../entity/MachineryMaintenance/SparePart.entity.js";
import { MaintenanceSparePart } from "../../entity/MachineryMaintenance/maintenanceSparePart.entity.js";
import { CreateMaintenanceRecordDTO, UpdateMaintenanceRecordDTO } from "../../types/MachineryMaintenance/maintenanceRecord.dto.js"
import { ServiceResponse } from "../../../types.js";

export async function createMaintenanceRecord(data: CreateMaintenanceRecordDTO): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
    const recordRepo = AppDataSource.getRepository(MaintenanceRecord);
    const maquinariaRepo = AppDataSource.getRepository(Maquinaria);
    const userRepo = AppDataSource.getRepository(User);
    const sparePartRepo = AppDataSource.getRepository(SparePart);
    const mspRepo = AppDataSource.getRepository(MaintenanceSparePart);

    const maquinaria = await maquinariaRepo.findOneBy({ id: data.maquinariaId });
    if (!maquinaria) return [null, "Maquinaria no encontrada"];

    //const patente = await maquinariaRepo.findOneBy({id: data.marcaId})

    const mecanico = await userRepo.findOneBy({ id: data.mecanicoId });
    if (!mecanico) return [null, "Usuario no encontrado"];

    if (mecanico.role !== 'Mecánico') {
        return [null, "El usuario seleccionado no tiene el rol de 'Mecánico'"];
    }

    const existente = await recordRepo.findOne({
      where: {
        maquinaria: { id: data.maquinariaId },
        estado: EstadoMantencion.PENDIENTE,
      }
    });
    if (existente) return [null, "Esta máquina ya tiene una mantención pendiente"];

    const record = recordRepo.create({
      maquinaria,
      razonMantencion: data.razonMantencion,
      descripcionEntrada: data.descripcionEntrada,
      estado: EstadoMantencion.PENDIENTE,
      mecanicoAsignado: mecanico,
    });

    const savedRecord = await recordRepo.save(record);

    for (const rep of data.repuestosUtilizados) {
      const repuesto = await sparePartRepo.findOneBy({ id: rep.repuestoId });
      if (!repuesto) return [null, `Repuesto con ID ${rep.repuestoId} no encontrado`];

      const usado = mspRepo.create({
        mantencion: savedRecord,
        repuesto,
        cantidadUtilizada: rep.cantidad
      });

      await mspRepo.save(usado);
    }

    const completo = await recordRepo.findOne({
      where: { id: savedRecord.id },
      relations: ["maquinaria", "mecanicoAsignado", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
    });

    return [completo!, null];
  } catch (error) {
    console.error("Error al registrar mantención:", error);
    return [null, "Error interno al registrar la mantención"];
  }
}

export async function updateMaintenanceRecord(id: number, data: UpdateMaintenanceRecordDTO): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
        const repo = AppDataSource.getRepository(MaintenanceRecord);
        const record = await repo.findOne({
            where: { id },
            relations: ["repuestosUtilizados"]
        });

        if (!record) return [null, "Mantención no encontrada"];
        if (data.estado) record.estado = data.estado;
        if (data.fechaSalida) record.fechaSalida = new Date(data.fechaSalida);
        if (data.descripcionSalida) record.descripcionSalida = data.descripcionSalida;

        const updated = await repo.save(record);

    return [updated, null];

  } catch (error) {
    console.error("Error al actualizar mantención:", error);
    return [null, "Error interno al actualizar mantención"];
  }
}

export async function getMaintenanceRecordById(id: number): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceRecord);
    const record = await repo.findOne({
      where: { id },
      relations: ["maquinaria", "mecanicoAsignado", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
    });

    if (!record) return [null, "Mantención no encontrada"];
    return [record, null];
  } catch (error) {
    console.error("Error al obtener mantención:", error);
    return [null, "Error interno al buscar la mantención"];
  }
}

export async function getAllMaintenanceRecords(): Promise<ServiceResponse<MaintenanceRecord[]>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceRecord);
    const records = await repo.find({
      relations: ["maquinaria", "mecanicoAsignado", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
    });

    if (!records.length) return [null, "No hay mantenciones registradas"];
    return [records, null];
  } catch (error) {
    console.error("Error al obtener mantenciones:", error);
    return [null, "Error interno al listar mantenciones"];
  }
}



export async function deleteMaintenanceRecord(id: number): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceRecord);
    const record = await repo.findOneBy({ id });

    if (!record) return [null, "Mantención no encontrada"];

    await repo.remove(record);
    return [record, null];
  } catch (error) {
    console.error("Error al eliminar mantención:", error);
    return [null, "Error interno al eliminar la mantención"];
  }
}
