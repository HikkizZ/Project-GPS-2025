import { Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { authValidation, registerValidation } from "../validations/auth.validation.js";

/* Login controller */
export async function login(req: Request, res: Response): Promise<void> {
  try {
        const { body } = req;

        // Validaciones básicas
        if (!body.email) {
            res.status(400).json({
                status: "error",
                message: "El email es requerido."
            });
      return;
    }

        if (typeof body.email !== "string") {
            res.status(400).json({
                status: "error",
                message: "El email debe ser de tipo texto."
            });
            return;
        }

        if (!body.password) {
            res.status(400).json({
                status: "error",
                message: "La contraseña es requerida."
            });
      return;
    }

        if (typeof body.password !== "string") {
            res.status(400).json({
                status: "error",
                message: "La contraseña debe ser de tipo texto."
            });
            return;
        }

        const [accessToken, error] = await loginService(body);

        if (error) {
            const errorMessage = typeof error === "string" ? error : error.message;
            
            // Determinar el código de estado basado en el mensaje de error
            let statusCode = 400;
            if (errorMessage.includes("no está registrado") || 
                errorMessage.includes("incorrecta")) {
                statusCode = 401;
            } else if (errorMessage.includes("interno")) {
                statusCode = 500;
            }
            
            res.status(statusCode).json({
                status: "error",
                message: errorMessage
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Usuario autenticado.",
            data: {
                token: accessToken
            }
        });
  } catch (error) {
        console.error("❌ Error en login controller:", error);
        res.status(500).json({
            status: "error",
            message: "Error interno del servidor."
        });
  }
}

/* Register controller */
export async function register(req: Request, res: Response): Promise<void> {
    try {
        const { body } = req;

        // Verificar si el usuario tiene permisos para registrar
        const userRole = (req.user as any)?.role;
        if (!userRole || (userRole !== "Administrador" && userRole !== "RecursosHumanos")) {
            res.status(403).json({
                status: "error",
                message: "No tienes permisos para realizar esta acción."
            });
            return;
        }

        // Validaciones básicas
        if (!body.name) {
            res.status(400).json({
                status: "error",
                message: "El nombre es requerido."
            });
            return;
        }

        if (typeof body.name !== "string") {
            res.status(400).json({
                status: "error",
                message: "El nombre debe ser de tipo texto."
            });
            return;
        }

        if (!body.rut) {
            res.status(400).json({
                status: "error",
                message: "El RUT es requerido."
            });
            return;
        }

        if (typeof body.rut !== "string") {
            res.status(400).json({
                status: "error",
                message: "El RUT debe ser de tipo texto."
            });
            return;
        }

        if (!body.email) {
            res.status(400).json({
                status: "error",
                message: "El email es requerido."
            });
            return;
        }

        if (typeof body.email !== "string") {
            res.status(400).json({
                status: "error",
                message: "El email debe ser de tipo texto."
            });
            return;
        }

        if (!body.password) {
            res.status(400).json({
                status: "error",
                message: "La contraseña es requerida."
            });
            return;
        }

        if (typeof body.password !== "string") {
            res.status(400).json({
                status: "error",
                message: "La contraseña debe ser de tipo texto."
            });
            return;
        }

        const [user, error] = await registerService(body, userRole);

        if (error) {
            const errorMessage = typeof error === "string" ? error : error.message;
            // Usar código 400 para errores de validación
            res.status(400).json({
                status: "error",
                message: errorMessage
            });
            return;
        }

        res.status(201).json({
            status: "success",
            message: "Usuario registrado exitosamente.",
            data: user
        });
    } catch (error) {
        console.error("❌ Error en register controller:", error);
        res.status(500).json({
            status: "error",
            message: "Error interno del servidor."
        });
    }
}

/* Logout controller */
export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    res.clearCookie("jwt", { httpOnly: true });
        handleSuccess(res, 200, "Sesión cerrada exitosamente.", {});
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}