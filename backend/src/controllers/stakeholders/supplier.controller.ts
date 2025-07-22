import { Response, Request } from 'express';
import {
    getAllSuppliersService,
    getSupplierService,
    createSupplierService,
    updateSupplierService,
    deleteSupplierService,
} from '../../services/stakeholders/supplier.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';

import { personQueryValidation, personBodyValidation } from '../../validations/stakeholders/person.validation.js';

export async function getSuppliers(_req: Request, res: Response): Promise<void> {
    try {
        const [suppliers, error] = await getAllSuppliersService();

        if (error && suppliers === null) {
            handleErrorServer(res, 500, typeof error === 'string' ? error : error.message);
            return;
        }

        if (!suppliers || suppliers.length === 0) {
            handleSuccess(res, 200, "No se encontraron proveedores.", suppliers || []);
            return;
        }

        handleSuccess(res, 200, "Proveedores obtenidos correctamente", suppliers!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function getSupplier(req: Request, res: Response): Promise<void> {
    try {
        const rut = req.query.rut as string  | undefined;
        const email = req.query.email as string | undefined;
        const id = req.query.id ? Number(req.query.id) : undefined;

        const { error } = personQueryValidation.validate({ rut, email, id });

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [supplier, errorSupplier] = await getSupplierService({ rut, email, id });

        if (errorSupplier) {
            const message = typeof errorSupplier === 'string' ? errorSupplier : errorSupplier.message;
            handleErrorClient(res, 404, message);
            return;
        }

        if (!supplier) {
            handleErrorClient(res, 404, "No se encontró el proveedor.");
            return;
        }

        handleSuccess(res, 200, 'Proveedor encontrado.', supplier);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = personBodyValidation.validate(req.body);

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [supplier, errorSupplier] = await createSupplierService(req.body);

        if (errorSupplier) {
            handleErrorClient(res, 400, typeof errorSupplier === 'string' ? errorSupplier : errorSupplier.message);
            return;
        }

        if (!supplier) {
            handleErrorServer(res, 500, "Error inesperado: No se pudo crear el proveedor.");
            return;
        }

        handleSuccess(res, 201, "Proveedor creado correctamente.", supplier);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function updateSupplier(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido.");
            return;
        }

        const { error: bodyError } = personBodyValidation.validate(req.body);

        if (bodyError) {
            handleErrorClient(res, 400, bodyError.message);
            return;
        }

        const [supplier, errorSupplier] = await updateSupplierService({ id }, req.body);
        
        if (errorSupplier) {
            handleErrorClient(res, 404, typeof errorSupplier === 'string' ? errorSupplier : errorSupplier.message);
            return;
        }

        if (!supplier) {
            handleErrorClient(res, 404, "No se encontró el proveedor.");
            return;
        }

        handleSuccess(res, 200, "Proveedor actualizado correctamente.", supplier);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function deleteSupplier(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido.");
            return;
        }

        const [deletedSupplier, errorSupplier] = await deleteSupplierService({ id });

        if (errorSupplier) {
            handleErrorClient(res, 404, typeof errorSupplier === 'string' ? errorSupplier : errorSupplier.message);
            return;
        }

        if (!deletedSupplier) {
            handleErrorClient(res, 404, "No se encontró el proveedor.");
            return;
        }

        handleSuccess(res, 200, "Proveedor eliminado correctamente.", deletedSupplier);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}