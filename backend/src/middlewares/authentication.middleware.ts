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
    passport.authenticate('jwt', { session: false }, (err: Error | null, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "No tienes permisos para acceder a esta ruta." });
        }
        req.user = user;
        next();
    })(req, res, next);
}