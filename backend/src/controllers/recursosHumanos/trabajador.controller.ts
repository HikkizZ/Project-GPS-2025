import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import {
    createTrabajadorService,
    getTrabajadoresService,
    searchTrabajadoresService,
    updateTrabajadorService,
    deleteTrabajadorService
} from "../../services/recursosHumanos/trabajador.service.js";
import { TrabajadorBodyValidation, TrabajadorQueryValidation, TrabajadorUpdateValidation } from "../../validations/recursosHumanos/trabajador.validation.js";

export async function createTrabajador(req: Request, res: Response): Promise<void> {
    try {
        // Validar el cuerpo de la petición
        const validationResult = TrabajadorBodyValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [trabajador, serviceError] = await createTrabajadorService(req.body);
        
        if (serviceError) {
            handleErrorClient(res, 400, serviceError);
            return;
        }

        handleSuccess(res, 201, "Trabajador creado exitosamente", trabajador);
    } catch (error) {
        console.error("Error al crear trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getTrabajadores(req: Request, res: Response): Promise<void> {
    try {
        const [trabajadores, serviceError] = await getTrabajadoresService();
        
        if (serviceError) {
            const isNotFound = serviceError.message.includes("No hay trabajadores");
            handleErrorClient(res, isNotFound ? 404 : 500, serviceError.message);
            return;
        }

        handleSuccess(res, 200, "Trabajadores recuperados exitosamente", trabajadores);
    } catch (error) {
        console.error("Error al obtener trabajadores:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function searchTrabajadores(req: Request, res: Response): Promise<void> {
  try {
    console.log("🔍 Query recibida:", req.query);
    
    const { error } = TrabajadorQueryValidation.validate(req.query);
    if (error) {
      console.log("❌ Error de validación:", error.message);
      handleErrorClient(res, 400, error.message);
      return;
    }

    // Convertir valores string a boolean en query
    const query = {
      ...req.query,
      enSistema: req.query.enSistema === "true" ? true : req.query.enSistema === "false" ? false : undefined,
      todos: req.query.todos === "true" ? true : undefined
    };
    console.log("🔄 Query procesada:", query);

    const [trabajadores, serviceError] = await searchTrabajadoresService(query);
    console.log("📊 Resultado del servicio:", { trabajadores: trabajadores?.length || 0, serviceError });

    if (serviceError || !trabajadores) {
      console.log("❌ No se encontraron trabajadores");
      handleErrorClient(res, 404, serviceError || "No se encontraron trabajadores que coincidan con los criterios de búsqueda");
      return;
    }

    if (trabajadores.length === 0) {
      console.log("❌ No se encontraron trabajadores");
      handleErrorClient(res, 404, "No se encontraron trabajadores que coincidan con los criterios de búsqueda");
      return;
    }

    console.log("✅ Trabajadores encontrados:", trabajadores.length);
    handleSuccess(res, 200, "Trabajadores encontrados exitosamente", trabajadores);
  } catch (error) {
    console.error("❌ Error en searchTrabajadores:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function updateTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = TrabajadorUpdateValidation.validate(req.body, { allowUnknown: false, stripUnknown: true });

        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [trabajador, serviceError] = await updateTrabajadorService(parseInt(req.params.id), validationResult.value);

        if (serviceError) {
            handleErrorClient(res, serviceError.includes("no encontrado") ? 404 : 400, serviceError);
            return;
        }

        handleSuccess(res, 200, "Trabajador actualizado exitosamente", trabajador);
    } catch (error) {
        console.error("Error al actualizar trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function deleteTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const [success, serviceError] = await deleteTrabajadorService(parseInt(req.params.id));
        
        if (serviceError) {
            handleErrorClient(res, 404, serviceError.message);
            return;
        }

        handleSuccess(res, 200, "Trabajador eliminado exitosamente");
    } catch (error) {
        console.error("Error al eliminar trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 