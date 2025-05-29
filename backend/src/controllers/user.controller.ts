import { Request, Response } from 'express';
import { 
    getUserService,
    getUsersService,
    updateUserService,
    deleteUserService,
    searchUsersService
 } from '../services/user.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

import { userQueryValidation, userBodyValidation } from '../validations/user.validation.js';

import { User } from '../entity/user.entity.js';

/* Search users with filters */
export async function searchUsers(req: Request, res: Response): Promise<void> {
    try {
        const query = req.query;
        const [users, error] = await searchUsersService(query);

        if (error) {
            handleErrorClient(res, 500, "Error interno del servidor", error);
            return;
        }

        res.status(200).json({
            status: "success",
            data: users
        });
    } catch (error) {
        handleErrorClient(res, 500, "Error interno del servidor", error);
    }
}

/* Get user by ID, RUT, Email or Role */
export async function getUser(req: Request, res: Response): Promise<void> {
    try {
        const query = req.query;
        const [users, error] = await getUserService(query);

        if (error) {
            if (error.includes("inválido") || error.includes("formato")) {
                handleErrorClient(res, 400, error);
                return;
            }
            handleErrorClient(res, 404, error);
            return;
        }

        res.status(200).json({
            status: "success",
            data: users || []
        });
    } catch (error) {
        handleErrorClient(res, 500, "Error interno del servidor", error);
    }
}

/* Get all users controller */
export async function getUsers(req: Request, res: Response): Promise<void> {
    try {
        const [users, error] = await getUsersService();

        if (error) {
            handleErrorClient(res, 404, error);
            return;
        }

        res.status(200).json({
            status: "success",
            data: users
        });
    } catch (error) {
        handleErrorClient(res, 500, "Error interno del servidor", error);
    }
}

/* Update user controller */
export async function updateUser(req: Request, res: Response): Promise<void> {
    try {
        const rut = req.query.rut as string | undefined;
        const email = req.query.email as string | undefined;
        const id = req.query.id ? parseInt(req.query.id as string) : undefined;
        const { body } = req;
        const requester = req.user as User;

        const [updatedUser, error] = await updateUserService({ rut, email, id }, body, requester);

        if (error) {
            if (error.includes("inválido") || error.includes("formato") || error.includes("requerido")) {
                handleErrorClient(res, 400, error);
                return;
            }
            if (error.includes("No tienes permisos") || error.includes("No se puede modificar")) {
                handleErrorClient(res, 403, error);
                return;
            }
            handleErrorClient(res, 404, error);
            return;
        }

        handleSuccess(res, 200, 'Usuario actualizado.', updatedUser);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

/* Delete user controller */
export async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
        const rut = req.query.rut as string | undefined;
        const email = req.query.email as string | undefined;
        const id = req.query.id ? Number(req.query.id) : undefined;

        const [deletedUser, error] = await deleteUserService({ rut, email, id }, req.user!);

        if (error) {
            if (error.includes("inválido") || error.includes("formato")) {
                handleErrorClient(res, 400, error);
                return;
            }
            if (error.includes("No tienes permisos") || error.includes("No se puede eliminar")) {
                handleErrorClient(res, 403, error);
                return;
            }
            handleErrorClient(res, 404, error);
            return;
        }

        handleSuccess(res, 200, 'Usuario eliminado.', deletedUser);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}   