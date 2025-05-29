import { Request, Response } from "express";
import {
  createLicenciaPermisoService,
  getAllLicenciasPermisosService,
  getLicenciaPermisoByIdService,
  updateLicenciaPermisoService,
  deleteLicenciaPermisoService,
  verificarLicenciasVencidasService
} from "../../services/recursosHumanos/licenciaPermiso.service.js";
import { User } from "../../entity/user.entity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { LicenciaPermisoQueryValidation, CreateLicenciaPermisoValidation, UpdateLicenciaPermisoValidation } from "../../validations/recursosHumanos/licenciaPermiso.validation.js";
import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import path from "path";
import fs from "fs";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

export async function createLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?.id) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    // Buscar el trabajador asociado al usuario
    const trabajadorRepo = AppDataSource.getRepository(Trabajador);
    const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

    if (!trabajador) {
      handleErrorClient(res, 400, "Trabajador no encontrado");
      return;
    }

    // Asignar el trabajadorId encontrado
    const requestData = {
      ...req.body,
      trabajadorId: trabajador.id
    };

    const validationResult = CreateLicenciaPermisoValidation.validate(requestData, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    const [licenciaPermiso, error] = await createLicenciaPermisoService(validationResult.value);

    if (error) {
      handleErrorClient(res, 400, error as string);
      return;
    }

    handleSuccess(res, 201, "Solicitud creada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al crear licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function getAllLicenciasPermisos(req: Request, res: Response): Promise<void> {
  try {
    // Validar query params si existen
    if (Object.keys(req.query).length > 0) {
      const validationResult = LicenciaPermisoQueryValidation.validate(req.query, { abortEarly: false });
      if (validationResult.error) {
        handleErrorClient(res, 400, "Error de validación", {
          errors: validationResult.error.details.map(error => ({
            field: error.path.join('.'),
            message: error.message
          }))
        });
        return;
      }
    }

    const [licenciasPermisos, error] = await getAllLicenciasPermisosService();

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitudes recuperadas exitosamente", licenciasPermisos || {});
  } catch (error) {
    console.error("Error al obtener licencias/permisos:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function getLicenciaPermisoById(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = LicenciaPermisoQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    const [licenciaPermiso, error] = await getLicenciaPermisoByIdService(parseInt(req.params.id));

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitud recuperada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al obtener licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function updateLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    const licenciaId = parseInt(req.params.id);
    if (isNaN(licenciaId)) {
      handleErrorClient(res, 400, "ID de licencia inválido");
      return;
    }

    const validationResult = UpdateLicenciaPermisoValidation.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    // Buscar el usuario que está revisando la solicitud
    const userRepo = AppDataSource.getRepository(User);
    const revisadoPor = await userRepo.findOne({ where: { id: req.user.id } });

    if (!revisadoPor) {
      handleErrorClient(res, 400, "Usuario revisor no encontrado");
      return;
    }

    const updateData = {
      ...validationResult.value,
      revisadoPor
    };

    const [licenciaActualizada, error] = await updateLicenciaPermisoService(licenciaId, updateData);

    if (error) {
      handleErrorClient(res, 400, error);
      return;
    }

    handleSuccess(res, 200, "Solicitud actualizada exitosamente", licenciaActualizada || {});
  } catch (error) {
    console.error("Error al actualizar licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function deleteLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = LicenciaPermisoQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    const [licenciaPermiso, error] = await deleteLicenciaPermisoService(parseInt(req.params.id));

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitud eliminada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al eliminar licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function descargarArchivoLicencia(req: Request, res: Response): Promise<void> {
    try {
        const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
        const licencia = await licenciaRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["trabajador"]
        });

        if (!licencia) {
            handleErrorClient(res, 404, "Licencia o permiso no encontrado");
            return;
        }

        if (!licencia.archivoAdjuntoURL) {
            handleErrorClient(res, 404, "No hay archivo adjunto para esta licencia o permiso");
            return;
        }

        // Verificar que el usuario solo pueda ver su propio archivo o sea de RRHH
        if (req.user?.role !== "RecursosHumanos" && licencia.trabajador.id !== req.user?.id) {
            handleErrorClient(res, 403, "No tienes permiso para ver este archivo");
            return;
        }

        try {
            // Asumiendo que archivoAdjuntoURL es una ruta relativa al directorio de uploads
            const filePath = path.join(process.cwd(), "uploads", licencia.archivoAdjuntoURL);
            
            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                handleErrorClient(res, 404, "Archivo no encontrado en el servidor");
                return;
            }

            // Configurar headers para la descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="licencia_${licencia.trabajador.rut}_${licencia.tipo}.pdf"`);

            // Enviar el archivo
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error("Error al leer el archivo:", error);
            handleErrorServer(res, 500, "Error al descargar el archivo");
        }
    } catch (error) {
        console.error("Error al descargar archivo de licencia:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function verificarLicenciasVencidas(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Solo RRHH puede ejecutar la verificación
        if (req.user.role !== "RecursosHumanos") {
            handleErrorClient(res, 403, "No tiene permiso para ejecutar esta acción");
            return;
        }

        const [actualizaciones, error] = await verificarLicenciasVencidasService();

        if (error) {
            handleErrorServer(res, 500, error);
            return;
        }

        handleSuccess(res, 200, `Se actualizaron ${actualizaciones} registros`, { actualizaciones });
    } catch (error) {
        console.error("Error en verificarLicenciasVencidas:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}
