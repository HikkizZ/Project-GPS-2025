import { apiClient } from "@/config/api.config"
import { ApiResponse } from "@/types"
import {
  Product,
  CreateProductData,
  UpdateProductData,
} from "@/types/inventory/product.types"

export class ProductService {
  private baseURL = "/products"

  // Obtener todos los productos
  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<{ data: Product[]; message: string }>(`${this.baseURL}/all`)
      return {
        success: true,
        data: response.data,
        message: response.message || "Productos obtenidos correctamente",
      }
    } catch (error) {
      throw error
    }
  }

  // Crear nuevo producto
  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.post<{ data: Product; message: string }>(
        `${this.baseURL}`,
        productData
      )
      return {
        success: true,
        data: response.data,
        message: response.message || "Producto creado exitosamente",
      }
    } catch (error) {
      throw error
    }
  }

  // Actualizar solo el precio del producto
  async updateProduct(id: number, productData: UpdateProductData): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.put<{ data: Product; message: string }>(
        `${this.baseURL}/${id}`,
        productData
      )
      return {
        success: true,
        data: response.data,
        message: response.message || "Producto actualizado exitosamente",
      }
    } catch (error) {
      throw error
    }
  }

  // Eliminar producto
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<{ message: string }>(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: response.message || "Producto eliminado exitosamente",
      }
    } catch (error) {
      throw error
    }
  }
}

export const productService = new ProductService()
