import { Request, Response } from "express";
import { loginService } from "../services/auth.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { authValidation } from "../validations/auth.validation.js";

/* Login controller */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { body } = req;

        // Asegurarse de que la respuesta sea JSON
        res.setHeader('Content-Type', 'application/json');

        // Validaciones básicas
        if (!body.email || typeof body.email !== "string") {
            res.status(400).json({
                status: "error",
                message: "El email es requerido y debe ser de tipo texto."
            });
            return;
        }

        if (!body.password || typeof body.password !== "string") {
            res.status(400).json({
                status: "error",
                message: "La contraseña es requerida y debe ser de tipo texto."
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

        // Configurar las cookies de sesión si es necesario
        if (accessToken) {
            res.cookie('jwt', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });
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

/* Logout controller */
export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    res.clearCookie("jwt", { httpOnly: true });
        handleSuccess(res, 200, "Sesión cerrada exitosamente.", {});
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}