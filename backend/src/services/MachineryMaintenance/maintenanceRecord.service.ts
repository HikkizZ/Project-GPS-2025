import { AppDataSource } from "../../config/configDB.js";
import { MaintenanceRecord, EstadoMantencion } from "../../entity/MachineryMaintenance/maintenanceRecord.entity.js";
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js";
import { User } from "../../entity/user.entity.js";
import { SparePart } from "../../entity/MachineryMaintenance/SparePart.entity.js";
import { MaintenanceSparePart } from "../../entity/MachineryMaintenance/maintenanceSparePart.entity.js";
import { CreateMaintenanceRecordDTO, UpdateMaintenanceRecordDTO } from "../../types/MachineryMaintenance/maintenanceRecord.dto.js"
import { ServiceResponse } from "../../../types.js";
import { EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js";
import { In } from "typeorm";

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


    const existente = await recordRepo.findOne({
      where: {
        maquinaria: { id: data.maquinariaId },
        estado: In([EstadoMantencion.PENDIENTE, EstadoMantencion.EN_PROCESO]),
        isActive: true
      }
    });
    if (existente) return [null, "Esta máquina ya tiene una mantención pendiente"];

    maquinaria.estado = EstadoMaquinaria.MANTENIMIENTO;
    await maquinariaRepo.save(maquinaria);

    const record = recordRepo.create({
      maquinaria,
      razonMantencion: data.razonMantencion,
      descripcionEntrada: data.descripcionEntrada,
      estado: EstadoMantencion.PENDIENTE,
      fechaEntrada: new Date(),
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

    const sanitized = sanitizeMaintenanceRecord(completo);
    return [sanitized, null];
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

    if (typeof data.mecanicoId === "number") {

      const mecanico = await AppDataSource.getRepository(User).findOneBy({ id: data.mecanicoId });
      if (!mecanico) return [null, `Mecánico con ID ${data.mecanicoId} no encontrado`];
      
      if (mecanico.role !== 'Mecánico') {
        return [null, "El usuario seleccionado no tiene el rol de 'Mecánico'"];
      }
      record.mecanicoAsignado = mecanico;

      if (record.estado === EstadoMantencion.PENDIENTE) {
        record.estado = EstadoMantencion.EN_PROCESO;
      }
     }
    // Actualización de campos opcionales
    if (data.estado) {
    record.estado = data.estado;

    // Cambiar el estado de la maquinaria según el nuevo estado de la mantención
    if (data.estado === EstadoMantencion.COMPLETADA) {
      record.maquinaria.estado = EstadoMaquinaria.DISPONIBLE;
      await AppDataSource.getRepository(Maquinaria).save(record.maquinaria);
    } else if (data.estado === EstadoMantencion.IRRECUPERABLE) {
      record.maquinaria.estado = EstadoMaquinaria.FUERA_SERVICIO;
      await AppDataSource.getRepository(Maquinaria).save(record.maquinaria);
    }
  }

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

    const sanitized = sanitizeMaintenanceRecord(result!);
    return [sanitized, null];
    
  } catch (error) {
    console.error("Error al actualizar mantención:", error);
    return [null, "Error interno al actualizar mantención"];
  }
}



export async function getMaintenanceRecordById(id: number): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceRecord);
    const record = await repo.findOne({
      where: { id, isActive: true },
      relations: ["maquinaria", "mecanicoAsignado", "mecanicoAsignado.trabajador", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
    });

    if (!record) return [null, "Mantención no encontrada"];

    const sanitized = sanitizeMaintenanceRecord(record);
    return [sanitized, null];

  } catch (error) {
    console.error("Error al obtener mantención:", error);
    return [null, "Error interno al buscar la mantención"];
  }
}

function sanitizeMaintenanceRecord(record: MaintenanceRecord): any {
  return {
    ...record,

    mecanicoAsignado: record.mecanicoAsignado
      ? {
          id: record.mecanicoAsignado.id,
          name: record.mecanicoAsignado.name ?? '',
          corporateEmail: record.mecanicoAsignado.corporateEmail ?? '',
          role: record.mecanicoAsignado.role ?? '',
          rut: record.mecanicoAsignado.rut ?? '',
          estadoCuenta: record.mecanicoAsignado.estadoCuenta ?? '',
          trabajador: record.mecanicoAsignado.trabajador
            ? {
                id: record.mecanicoAsignado.trabajador.id,
                nombres: record.mecanicoAsignado.trabajador.nombres ?? '',
                apellidoPaterno: record.mecanicoAsignado.trabajador.apellidoPaterno ?? '',
                apellidoMaterno: record.mecanicoAsignado.trabajador.apellidoMaterno ?? '',
              }
            : null,
        }
      : null,

    repuestosUtilizados: Array.isArray(record.repuestosUtilizados)
      ? record.repuestosUtilizados.map((r) => ({
          id: r.id,
          cantidadUtilizada: r.cantidadUtilizada,
          repuesto: {
            id: r.repuesto.id,
            name: r.repuesto.name ?? '',
            stock: r.repuesto.stock ?? 0,
            marca: r.repuesto.marca ?? '',
            modelo: r.repuesto.modelo ?? '',
            anio: r.repuesto.anio ?? new Date().getFullYear(),
          },
        }))
      : [],
  };
}



export async function getAllMaintenanceRecords(): Promise<ServiceResponse<any[]>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceRecord);
    const records = await repo.find({
      where: { isActive: true },
      relations: ["maquinaria", "mecanicoAsignado","mecanicoAsignado.trabajador","repuestosUtilizados","repuestosUtilizados.repuesto"]
    });

    if (!records.length) return [null, "No hay mantenciones registradas"];

    const sanitizedRecords = records.map(sanitizeMaintenanceRecord);
    return [sanitizedRecords, null];
  } catch (error) {
    console.error("Error al obtener mantenciones:", error);
    return [null, "Error interno al listar mantenciones"];
  }
}


export async function deleteMaintenanceRecord(id: number): Promise<ServiceResponse<MaintenanceRecord>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceRecord);
    const maquinariaRepo = AppDataSource.getRepository(Maquinaria);
    const repuestoRepo = AppDataSource.getRepository(SparePart);

    const record = await repo.findOne({
      where: { id },
      relations: ["maquinaria", "repuestosUtilizados", "repuestosUtilizados.repuesto"]
    });

    if (!record) return [null, "Mantención no encontrada"];

    // Devolver stock si hay repuestos utilizados
    for (const msp of record.repuestosUtilizados) {
      msp.repuesto.stock += msp.cantidadUtilizada;
      await repuestoRepo.save(msp.repuesto);
    }

    // Liberar la maquinaria si estaba pendiente
    if (record.estado === EstadoMantencion.PENDIENTE || record.estado === EstadoMantencion.EN_PROCESO ) {
      record.maquinaria.estado = EstadoMaquinaria.DISPONIBLE;
      await maquinariaRepo.save(record.maquinaria);
    }

    // Desactivar mantención
    record.isActive = false;
    const updated = await repo.save(record);

    return [updated, null];
  } catch (error) {
    console.error("Error al eliminar mantención:", error);
    return [null, "Error interno al eliminar la mantención"];
  }
}

