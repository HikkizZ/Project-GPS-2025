import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that verifies the user's role before allowing access to a protected path.
 * @param requiredRoles - An array or string with the allowed roles.
 * @returns Middleware that checks if the user has the appropriate role.
 */

export function verifyRole(requiredRoles: string | string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as { role: string } | undefined;

        if (!user) {
            return res.status(401).json({ message: "No tienes permisos para acceder a esta ruta." });
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "No tienes permisos para acceder a esta ruta." });
        }

        next();
    }
}