import { Request, Response } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../../services/inventory/product.service.js';

import { handleErrorClient, handleErrorServer, handleSuccess } from '../../handlers/responseHandlers.js';
import { createProductValidation, updateProductValidation } from '../../validations/inventory/product.validation.js';

export async function getProducts(_req: Request, res: Response): Promise<void> {
    try {
        const [products, error] = await getAllProducts();

        if (error) {
            handleErrorServer(res, 404, typeof error === 'string' ? error : error.message);
        return;
        }

        if (!products || products.length === 0) {
            handleErrorClient(res, 404, "No se encontraron productos.");
            return;
        }

        handleSuccess(res, 200, "Productos obtenidos correctamente", products!);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            handleErrorClient(res, 400, "El ID proporcionado no es válido.");
            return;
        }

        const [product, error] = await getProductById(id);

        if (error) {
            handleErrorServer(res, 404, typeof error === 'string' ? error : error.message);
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

export async function createNewProduct(req: Request, res: Response): Promise<void> {
    try {
        const { error } = createProductValidation.validate(req.body);

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [product, errorProduct] = await createProduct(req.body);

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

export async function updateExistingProduct(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "El ID proporcionado no es válido.");
            return;
        }

        const { error } = updateProductValidation.validate(req.body);

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [updatedProduct, errorProduct] = await updateProduct(id, req.body);

        if (errorProduct) {
            handleErrorServer(res, 404, typeof errorProduct === 'string' ? errorProduct : errorProduct.message);
            return;
        }

        if (!updatedProduct) {
            handleErrorClient(res, 404, "No se pudo actualizar el producto.");
            return;
        }
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function deleteExistingProduct(req: Request, res: Response): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "El ID proporcionado no es válido.");
            return;
        }

        const [deletedProduct, errorProduct] = await deleteProduct(id);

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