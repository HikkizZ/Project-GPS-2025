import { AppDataSource } from "../../config/configDB.js";
import { Product } from "../../entity/inventory/product.entity.js";
import { ProductType, CreateProductDTO, UpdateProductDTO } from "types/inventory/product.dto.js";
import { ServiceResponse } from "../../../types.js";

export async function getAllProductsService(): Promise<ServiceResponse<Product[]>> {
    try {
        const productRepository = AppDataSource.getRepository(Product);

        const products = await productRepository.find();

        if (!products || products.length === 0) {
            return [null, "No hay productos registrados."];
        }

        return [products, null];
    } catch (error) {
        console.error("Error fetching products:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getProductByIdService(id: number): Promise<ServiceResponse<Product>> {
    try {
        const productRepository = AppDataSource.getRepository(Product);

        const product = await productRepository.findOne({ where: { id } });

        if (!product) {
            return [null, "Producto no encontrado."];
        }

        return [product, null];
    } catch (error) {
        console.error("Error fetching product:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createProductService(productData: CreateProductDTO): Promise<ServiceResponse<Product>> {
    try {
        const productRepository = AppDataSource.getRepository(Product);

        const existingProduct = await productRepository.findOne({ where: { product: productData.product } });
        if (existingProduct) return [null, "El producto ya existe."];

        const newProduct = productRepository.create(productData);
        const savedProduct = await productRepository.save(newProduct);

        return [savedProduct, null];
    } catch (error) {
        console.error("Error creating product:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function updateProductService(id: number, productData: UpdateProductDTO): Promise<ServiceResponse<Product>> {
    try {
        const productRepository = AppDataSource.getRepository(Product);

        const product = await productRepository.findOne({ where: { id } });

        if (!product) return [null, "Producto no encontrado."];

        const updatedProduct = { ...product, ...productData };

        const savedProduct = await productRepository.save(updatedProduct);

        return [savedProduct, null];
    } catch (error) {
        console.error("Error updating product:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteProductService(id: number): Promise<ServiceResponse<Product>> {
    try {
        const productRepository = AppDataSource.getRepository(Product);

        const product = await productRepository.findOne({ where: { id } });

        if (!product) return [null, "Producto no encontrado."];

        const deletedProduct = await productRepository.remove(product);

        return [deletedProduct, null];
    } catch (error) {
        console.error("Error deleting product:", error);
        return [null, "Error interno del servidor"];
    }
}