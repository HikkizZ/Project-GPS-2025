import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";

export async function actualizarEstadoFichaService(
  trabajadorId: number,
  nuevoEstado: EstadoLaboral,
  fechaInicio: Date,
  fechaFin?: Date
): Promise<ServiceResponse<FichaEmpresa>> {
  try {
    const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
    
    const ficha = await fichaRepo.findOne({
      where: { trabajador: { id: trabajadorId } },
      relations: ["trabajador"]
    });

    if (!ficha) {
      return [null, "Ficha de empresa no encontrada para el trabajador."];
    }

    // Actualizar el estado
    ficha.estado = nuevoEstado;
    await fichaRepo.save(ficha);

    // Si hay fecha de fin y el nuevo estado no es DESVINCULADO, programar la vuelta a ACTIVO
    if (fechaFin && nuevoEstado !== EstadoLaboral.DESVINCULADO) {
      // Programar la tarea para la fecha de fin
      const fechaFinDate = new Date(fechaFin);
      const ahora = new Date();
      const tiempoHastaFin = fechaFinDate.getTime() - ahora.getTime();

      if (tiempoHastaFin > 0) {
        setTimeout(async () => {
          // Verificar el estado actual antes de cambiar a ACTIVO
          const fichaActual = await fichaRepo.findOne({
            where: { trabajador: { id: trabajadorId } }
          });

          if (fichaActual && fichaActual.estado === nuevoEstado) {
            fichaActual.estado = EstadoLaboral.ACTIVO;
            await fichaRepo.save(fichaActual);
          }
        }, tiempoHastaFin);
      }
    }

    return [ficha, null];
  } catch (error) {
    console.error("Error al actualizar estado de ficha empresa:", error);
    return [null, "Error interno del servidor."];
  }
} 