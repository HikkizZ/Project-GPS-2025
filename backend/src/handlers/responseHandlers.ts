import { Response } from "express";

/* Manejo de respuestas exitosas */
export function handleSuccess(res: Response, statusCode: number, message: string, data: object = {}): Response {
    return res.status(statusCode).json({
        status: "success",
        message,
        data
    });
}

/* Manejo de errores del cliente */
export function handleErrorClient(res: Response, statusCode: number, message: string, details: object = {}): Response {
    return res.status(statusCode).json({
        status: "error",
        message,
        details
    });
}

/* Manejo de errores del servidor */
export function handleErrorServer(res: Response, statusCode: number, message: string): Response {
    return res.status(statusCode).json({
        status: "Server error",
        message
    });
}