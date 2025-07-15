import { Request, Response } from 'express';
import { 
    updateUserService,
    getUsersService,
    updateOwnProfileService,
    changeOwnPasswordService
 } from '../services/user.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

import { userQueryValidation, userBodyValidation } from '../validations/user.validation.js';

import { User } from '../entity/user.entity.js';
import { Trabajador } from '../entity/recursosHumanos/trabajador.entity.js';
import { AppDataSource } from '../config/configDB.js';

/* Obtener usuarios con o sin filtros */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const [users, error] = await getUsersService(req.query);
        if (error) {
            return res.status(400).json({ status: 'error', message: error, details: {} });
        }
        const usersData = users || [];
        const mensaje = usersData.length === 0 
            ? "No se encontraron usuarios que coincidan con los criterios de búsqueda" 
            : "Usuarios encontrados exitosamente";
        return res.json({ status: 'success', message: mensaje, data: usersData });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({ status: 'error', message: "Error interno del servidor", details: {} });
    }
};

/* Update user controller */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const requester = req.user as User;
        const user = await updateUserService(parseInt(req.params.id), req.body, requester);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.json(user);
    } catch (error: any) {
        if (error.status === 403 && error.message) {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

/* Actualizar perfil propio */
export const updateOwnProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const { name, email, rut } = req.body;
        const user = await updateOwnProfileService(userId, { name, email, rut });
        
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Retornar usuario sin contraseña
        const { password, ...safeUser } = user;
        return res.json({ 
            message: "Perfil actualizado exitosamente", 
            data: safeUser 
        });
    } catch (error: any) {
        console.error("Error al actualizar perfil propio:", error);
        return res.status(500).json({ message: "Error al actualizar perfil" });
    }
};

/* Cambiar contraseña propia */
export const changeOwnPassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const { newPassword } = req.body;
        
        if (!newPassword) {
            return res.status(400).json({ 
                message: "Se requiere nueva contraseña" 
            });
        }

        const [success, error] = await changeOwnPasswordService(userId, newPassword);
        
        if (!success) {
            return res.status(400).json({ message: error });
        }

        return res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error: any) {
        console.error("Error al cambiar contraseña propia:", error);
        return res.status(500).json({ message: "Error al cambiar contraseña" });
    }
};   