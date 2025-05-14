import { Request, Response } from 'express';
import { 
    getUserService,
    getUsersService,
    updateUserService,
    deleteUserService
 } from '../services/user.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

import { userQueryValidation, userBodyValidation } from '../validations/user.validation.js';

import { User } from '../entity/user.entity.js';

/ * Get user controller */
export async function getUser(req: Request, res: Response): Promise<void> {
    try {
        const rut = req.query.rut as string | undefined;
        const email = req.query.email as string | undefined;
        const id = req.query.id ? Number(req.query.id) : undefined;

        const { error } = userQueryValidation.validate({ rut, email, id });

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [user, errorUser] = await getUserService({ rut, email, id });

        if (errorUser) {
            const message = typeof errorUser === 'string' ? errorUser : errorUser.message;
            handleErrorClient(res, 404, message);
            return;
        }

        if (!user) {
            handleErrorClient(res, 404, "No se encontró el usuario.");
            return;
        }

        handleSuccess(res, 200, 'Usuario encontrado.', user);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);  
    }
}

/* Get all users controller */
export async function getUsers(req: Request, res: Response): Promise<void> {
    try {
        const [users, errorUsers] = await getUsersService();

        if (errorUsers) {
            const message = typeof errorUsers === 'string' ? errorUsers : errorUsers.message;
            handleErrorClient(res, 404, message);
            return;
        }

        if (!users || users.length === 0) {
            handleErrorClient(res, 404, "No se encontraron usuarios.");
            return;
        }

        handleSuccess(res, 200, 'Usuarios encontrados.', users);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

/* Update user controller */
export async function updateUser(req: Request, res: Response): Promise<void> {
    try {
        const rut = req.query.rut as string | undefined;
        const email = req.query.email as string | undefined;
        const id = req.query.id ? Number(req.query.id) : undefined;

        const { body } = req;

        const requester = req.user as User;

        const { error: errorQuery } = userQueryValidation.validate({ rut, email, id });

        if (errorQuery) {
            console.log("Error en la validación de la consulta:");
            handleErrorClient(res, 400, "Error en la validación de la consulta", { message: errorQuery.message });
            return;
        }

        const { error: errorBody } = userBodyValidation.validate(body);

        if (errorBody) {
            console.log("Error en la validación del cuerpo:");
            handleErrorClient(res, 400, "Error en la validación del cuerpo", { message: errorBody.message });
            return;
        }

        const [updatedUser, errorUpdate] = await updateUserService({ rut, email, id }, body, requester);

        if (errorUpdate) {
            const message = typeof errorUpdate === 'string' ? errorUpdate : errorUpdate.message;
            handleErrorClient(res, 404, message);
            return;
        }

        if (!updatedUser) {
            handleErrorClient(res, 404, "No se encontró el usuario actualizado.");
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