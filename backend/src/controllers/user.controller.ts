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

/* Get user by ID, RUT, Email or Role */
export async function getUser(req: Request, res: Response): Promise<void> {
    try {
        const query = req.query;
        const [users, error] = await getUserService(query);

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

        // Validar que si se proporciona un ID, sea un número válido
        if (req.query.id && isNaN(id!)) {
            handleErrorClient(res, 400, "El ID debe ser un número válido");
            return;
        }

        const { body } = req;
        const requester = req.user as User;

        const { error: errorQuery } = userQueryValidation.validate({ rut, email, id });

        if (errorQuery) {
            handleErrorClient(res, 400, "Error en la validación de la consulta", { message: errorQuery.message });
            return;
        }

        // Solo validar el campo role
        if (!body.role) {
            handleErrorClient(res, 400, "El campo role es requerido");
            return;
        }

        const [updatedUser, errorUpdate] = await updateUserService({ rut, email, id }, body, requester);

        if (errorUpdate) {
            handleErrorClient(res, 404, errorUpdate);
            return;
        }

        if (!updatedUser) {
            handleErrorClient(res, 404, "No se encontró el usuario a actualizar");
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

        const { error: queryError } = userQueryValidation.validate({ rut, email, id });

        if (queryError) {
            console.log("Error en la validación de la consulta:");
            handleErrorClient(res, 400, "Error en la validación de la consulta", { message: queryError.message });
            return;
        }

        const [deletedUser, errorDelete] = await deleteUserService({ rut, email, id }, req.user!);

        if (errorDelete) {
            const message = typeof errorDelete === 'string' ? errorDelete : errorDelete.message;
            handleErrorClient(res, 404, message);
            return;
        }

        if (!deletedUser) {
            handleErrorClient(res, 404, "No se encontró el usuario a eliminar.");
            return;
        }

        handleSuccess(res, 200, 'Usuario eliminado.', deletedUser);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}   