import { Request, Response } from 'express';
import { 
    getUserService,
    getUsersService,
    updateUserService,
    updateUserByTrabajadorService,
    searchUsersService
 } from '../services/user.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

import { userQueryValidation, userBodyValidation } from '../validations/user.validation.js';

import { User } from '../entity/user.entity.js';
import { Trabajador } from '../entity/recursosHumanos/trabajador.entity.js';
import { AppDataSource } from '../config/configDB.js';

/* Search users with filters */
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const [users, error] = await searchUsersService(req.query);
        if (error) {
            return res.status(400).json({ status: 'error', message: error, details: {} });
        }
        return res.json({ status: 'success', message: 'Usuarios encontrados exitosamente', data: users });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: "Error al buscar usuarios", details: {} });
    }
};

/* Get user by ID, RUT, Email or Role */
export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "ID de usuario inválido" });
        }

        const user = await getUserService({ id: userId });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.json(user);
    } catch (error) {
        console.error("Error en getUser:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

/* Get all users controller */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsersService();
        return res.json({ data: users });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener usuarios" });
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

/* Update user name by trabajador */
export const updateUserByTrabajador = async (req: Request, res: Response) => {
    try {
        const user = await updateUserByTrabajadorService(parseInt(req.params.id), req.body);
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