/**
 * Middleware to authenticate API routes.
 * @param req - Request
 * @param res - Response
 * @param next - NextFunction
 * @returns void
 */

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            status: "error",
            message: "Token de autenticación no proporcionado."
        });
    }

    passport.authenticate('jwt', { session: false }, (err: Error | null, user: any, info: any) => {
        if (err) {
            return res.status(500).json({ 
                status: "error",
                message: "Error interno del servidor." 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                status: "error",
                message: info?.message || "Token de autenticación inválido o expirado." 
            });
        }

        req.user = user;
        next();
    })(req, res, next);
}