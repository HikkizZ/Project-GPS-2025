/**
 * Middleware to authenticate API routes.
 * @param req - Request
 * @param res - Response
 * @param next - NextFunction
 * @returns void
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/configDB.js';
import { User } from '../entity/user.entity.js';
import { ACCESS_TOKEN_SECRET } from '../config/configEnv.js';

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                status: "error",
                message: "No se proporcionó un token de autenticación"
            });
            return;
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as { id: number };
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.id } });

        if (!user) {
            res.status(401).json({
                status: "error",
                message: "Usuario no encontrado"
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: "error",
            message: "Token inválido"
        });
    }
};

// Mantener la compatibilidad con el código existente
export const authenticateJWT = verifyToken;