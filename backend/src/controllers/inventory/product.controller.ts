import { Request, Response } from 'express';
import {
    getAllProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService
} from '../../services/inventory/product.service.js';

import { handleErrorClient, handleErrorServer, handleSuccess } from '../../handlers/responseHandlers.js';
import { createProductValidation, updateProductValidation, productQueryValidation } from '../../validations/inventory/product.validation.js';

export async function getProducts(_req: Request, res: Response): Promise<void> {
    try {
        const [products, error] = await getAllProductsService();

        if (error && products === null) {
            handleErrorServer(res, 500, typeof error === 'string' ? error : error.message);
        return;
        }

        if (!products || products.length === 0) {
            handleSuccess(res, 200, "No se encontraron productos.", products || []);
            return;
        }

        handleSuccess(res, 200, "Productos obtenidos correctamente", products!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.query;

        const parsedId = id ? Number(id) : undefined;
        
        const { error } = productQueryValidation.validate({ id: parsedId });

        if (error || parsedId === undefined) {
            handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio");
            return;
        }

        const [product, errorProduct] = await getProductByIdService(parsedId);

        if (errorProduct) {
            handleErrorServer(res, 404, typeof errorProduct === 'string' ? errorProduct : errorProduct.message);
            return;
        }

        if (!product) {
            handleErrorClient(res, 404, "No se encontró el producto.");
            return;
        }

        handleSuccess(res, 200, "Producto obtenido correctamente", product!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
    try {
        const { error } = createProductValidation.validate(req.body);

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [product, errorProduct] = await createProductService(req.body);

        if (errorProduct) {
            handleErrorServer(res, 400, typeof errorProduct === 'string' ? errorProduct : errorProduct.message);
            return;
        }

        if (!product) {
            handleErrorClient(res, 400, "No se pudo crear el producto.");
            return;
        }

        handleSuccess(res, 201, "Producto creado correctamente", product!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
    try {

        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido.");
            return;
        }

        const { error: bodyError } = updateProductValidation.validate(req.body);

        if (bodyError) {
            handleErrorClient(res, 400, bodyError.message);
            return;
        }

        const [updatedProduct, errorProduct] = await updateProductService(id, req.body);

        if (errorProduct) {
            handleErrorServer(res, 404, typeof errorProduct === 'string' ? errorProduct : errorProduct.message);
            return;
        }

        if (!updatedProduct) {
            handleErrorClient(res, 404, "No se pudo actualizar el producto.");
            return;
        }

        handleSuccess(res, 200, "Producto actualizado correctamente", updatedProduct!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido.");
            return;
        }

        const [deletedProduct, errorProduct] = await deleteProductService(id);

        if (errorProduct) {
            handleErrorServer(res, 404, typeof errorProduct === 'string' ? errorProduct : errorProduct.message);
            return;
        }

        if (!deletedProduct) {
            handleErrorClient(res, 404, "No se pudo eliminar el producto.");
            return;
        }

        handleSuccess(res, 200, "Producto eliminado correctamente", deletedProduct!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}