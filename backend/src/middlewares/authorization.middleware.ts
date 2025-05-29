import { Request, Response, NextFunction } from 'express';
import { User } from "../entity/user.entity.js";
import { RequestHandler } from 'express';

/**
 * Middleware that verifies the user's role before allowing access to a protected path.
 * @param requiredRoles - An array or string with the allowed roles.
 * @returns Middleware that checks if the user has the appropriate role.
 */
export function verifyRole(requiredRoles: string | string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as { role: string } | undefined;

        if (!user) {
            res.status(400).json({ 
                status: "error",
                message: "Debes iniciar sesión para acceder a esta ruta." 
            });
            return;
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (!roles.includes(user.role)) {
            res.status(403).json({ 
                status: "error",
                message: "No tienes permisos para realizar esta acción." 
            });
            return;
        }

        next();
    };
}