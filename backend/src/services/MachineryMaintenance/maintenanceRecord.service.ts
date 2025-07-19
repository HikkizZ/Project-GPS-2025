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
      fechaEntrada: new Date(),
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
      relations: ["maquinaria", "mecanicoAsignado", "mecanicoAsignado.trabajador", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
    });

    if (!completo) return [null, "No se pudo cargar el detalle completo de la mantención"];


    return [completo, null];
  } catch (error) {
    console.error("Error al registrar mantención:", error);
    return [null, "Error interno al registrar la mantención"];
  }
}

export async function updateMaintenanceRecord(id: number, data: UpdateMaintenanceRecordDTO): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
    const recordRepo = AppDataSource.getRepository(MaintenanceRecord);
    const sparePartRepo = AppDataSource.getRepository(SparePart);
    const mspRepo = AppDataSource.getRepository(MaintenanceSparePart);

    const record = await recordRepo.findOne({
      where: { id },
      relations: ["maquinaria", "mecanicoAsignado","mecanicoAsignado.trabajador","repuestosUtilizados","repuestosUtilizados.repuesto"]
    });

    if (!record) return [null, "Mantención no encontrada"];
    
    if (data.maquinariaId) {
      const maquinaria = await AppDataSource.getRepository(Maquinaria).findOneBy({ id: data.maquinariaId });

    if (!maquinaria) return [null, `Maquinaria con ID ${data.maquinariaId} no encontrada`];
      record.maquinaria = maquinaria;
    }

    if (data.mecanicoId) {
      const mecanico = await AppDataSource.getRepository(User).findOneBy({ id: data.mecanicoId });
      if (!mecanico) return [null, `Mecánico con ID ${data.mecanicoId} no encontrado`];
      record.mecanicoAsignado = mecanico;
    }
    // Actualización de campos opcionales
    if (data.estado) record.estado = data.estado;
    if (data.descripcionEntrada) record.descripcionEntrada = data.descripcionEntrada;
    if (data.razonMantencion) record.razonMantencion = data.razonMantencion;
    if (data.fechaSalida) {
      const fecha = new Date(data.fechaSalida);
      if (isNaN(fecha.getTime())) return [null, "La fecha de salida debe ser una fecha válida"];
      record.fechaSalida = fecha;
    }

    if (data.descripcionSalida) record.descripcionSalida = data.descripcionSalida;

    // Actualizar repuestos solo si se envía el arreglo
    if (Array.isArray(data.repuestosUtilizados)) {
      // Eliminar los repuestos anteriores asociados a la mantención
      await mspRepo.delete({ mantencion: { id: record.id } });

      // Validar y agregar los nuevos repuestos
      for (const rep of data.repuestosUtilizados) {
        if (
          typeof rep.repuestoId !== "number" ||
          typeof rep.cantidad !== "number" ||
          rep.cantidad <= 0
        ) {
          return [null, "Cada repuesto debe tener un ID válido y una cantidad mayor a 0"];
        }

        const repuesto = await sparePartRepo.findOneBy({ id: rep.repuestoId });
        if (!repuesto) return [null, `Repuesto con ID ${rep.repuestoId} no encontrado`];

        const nuevoRepuesto = mspRepo.create({
          mantencion: record,
          repuesto,
          cantidadUtilizada: rep.cantidad,
        });

        await mspRepo.save(nuevoRepuesto);
      }
    }

    // Guardar cambios de mantención
    const updated = await recordRepo.save(record);

    // Devolver registro actualizado con relaciones
    const result = await recordRepo.findOne({
      where: { id: updated.id },
      relations: [
        "maquinaria",
        "mecanicoAsignado",
        "mecanicoAsignado.trabajador",
        "repuestosUtilizados",
        "repuestosUtilizados.repuesto"
      ]
    });

    console.log("Maquinaria actualizada a:", record.maquinaria);

    return [result!, null];
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
      relations: ["maquinaria", "mecanicoAsignado", "mecanicoAsignado.trabajador", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
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
      relations: ["maquinaria", "mecanicoAsignado", "mecanicoAsignado.trabajador", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
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
