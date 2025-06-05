import { Request, Response, NextFunction } from 'express';
import { User } from '../entity/user.entity.js';

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user as User;

        if (!user) {
            res.status(401).json({
                status: "error",
                message: "Usuario no autenticado"
            });
            return;
        }

        if (!roles.includes(user.role)) {
            res.status(403).json({
                status: "error",
                message: "No tienes permisos para realizar esta acción"
            });
            return;
        }

        next();
    };
}; 