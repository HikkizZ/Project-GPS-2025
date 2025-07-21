import { Response, Request } from 'express';
import {
    getAllCustomersService,
    getCustomerService,
    createCustomerService,
    updateCustomerService,
    deleteCustomerService,
} from '../../services/stakeholders/customer.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';

import { personQueryValidation, personBodyValidation } from '../../validations/stakeholders/person.validation.js';

export async function getCustomers(_req: Request, res: Response): Promise<void> {
    try {
        const [customers, error] = await getAllCustomersService();

        if (error) {
            handleErrorServer(res, 404, typeof error === 'string' ? error : error.message);
            return;
        }

        if (!customers || customers.length === 0) {
            handleErrorClient(res, 404, "No se encontraron clientes.");
            return;
        }

        handleSuccess(res, 200, "Clientes obtenidos correctamente", customers!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function getCustomer(req: Request, res: Response): Promise<void> {
    try {
        const rut = req.query.rut as string  | undefined;
        const email = req.query.email as string | undefined;
        const id = req.query.id ? Number(req.query.id) : undefined;

        const { error } = personQueryValidation.validate({ rut, email, id });

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [customer, errorCustomer] = await getCustomerService({ rut, email, id });

        if (errorCustomer) {
            const message = typeof errorCustomer === 'string' ? errorCustomer : errorCustomer.message;
            handleErrorClient(res, 404, message);
            return;
        }

        if (!customer) {
            handleErrorClient(res, 404, "No se encontró el cliente.");
            return;
        }

        handleSuccess(res, 200, 'Cliente encontrado.', customer);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = personBodyValidation.validate(req.body);

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [customer, errorCustomer] = await createCustomerService(req.body);

        if (errorCustomer) {
            handleErrorClient(res, 400, typeof errorCustomer === 'string' ? errorCustomer : errorCustomer.message);
            return;
        }

        if (!customer) {
            handleErrorServer(res, 500, "Error inesperado: No se pudo crear el cliente.");
            return;
        }

        handleSuccess(res, 201, "Cliente creado correctamente.", customer);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function updateCustomer(req: Request, res: Response): Promise<void> {
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

        const [customer, errorCustomer] = await updateCustomerService({ id }, req.body);

        if (errorCustomer) {
            handleErrorClient(res, 404, typeof errorCustomer === 'string' ? errorCustomer : errorCustomer.message);
            return;
        }

        if (!customer) {
            handleErrorClient(res, 404, "No se encontró el cliente.");
            return;
        }

        handleSuccess(res, 200, "Cliente actualizado correctamente.", customer);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido.");
            return;
        }

        const [deletedCustomer, errorCustomer] = await deleteCustomerService({ id });

        if (errorCustomer) {
            handleErrorClient(res, 404, typeof errorCustomer === 'string' ? errorCustomer : errorCustomer.message);
            return;
        }

        if (!deletedCustomer) {
            handleErrorClient(res, 404, "No se encontró el cliente.");
            return;
        }

        handleSuccess(res, 200, "Cliente eliminado correctamente.", deletedCustomer);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}