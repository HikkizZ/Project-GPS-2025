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
        // Permitir buscar por id, rut o corporateEmail
        const { id, rut, corporateEmail } = req.query;
        if (!id && !rut && !corporateEmail) {
            return res.status(400).json({ message: "Se requiere id, rut o corporateEmail para identificar el usuario." });
        }
        const query: any = {};
        if (id) query.id = Number(id);
        if (rut) query.rut = String(rut);
        if (corporateEmail) query.corporateEmail = String(corporateEmail);
        const user = await updateUserService(query, req.body, requester);
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