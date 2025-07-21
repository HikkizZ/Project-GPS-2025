"use client"

import { useState, useEffect } from "react"
import { productService } from "@/services/inventario/product.service"
import type { Product, CreateProductData, UpdateProductData, ApiResponse } from "@/types/inventory/product.types"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const res: ApiResponse<Product[]> = await productService.getProducts()
      if (res.success) {
        setProducts(res.data || [])
      } else {
        console.error("Error al cargar productos:", res.message)
      }
    } catch (error: any) {
      console.error("Error inesperado al cargar productos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createProduct = async (data: CreateProductData): Promise<ApiResponse<Product>> => {
    setIsCreating(true)
    try {
      const res: ApiResponse<Product> = await productService.createProduct(data)
      if (res.success) {
        setProducts((prev) => [...prev, res.data!])
      }
      return res
    } catch (error: any) {
      console.error("Error al crear producto:", error)
      return { success: false, message: error.message || "Ocurrió un error inesperado al crear el producto." }
    } finally {
      setIsCreating(false)
    }
  }

  const updateProduct = async (id: number, data: UpdateProductData): Promise<ApiResponse<Product>> => {
    setIsUpdating(true)
    try {
      const res: ApiResponse<Product> = await productService.updateProduct(id, data)
      if (res.success) {
        setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...data } : product)))
      }
      return res
    } catch (error: any) {
      console.error("Error al actualizar producto:", error)
      return { success: false, message: error.message || "Ocurrió un error inesperado al actualizar el producto." }
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteProduct = async (id: number): Promise<ApiResponse<any>> => {
    setIsDeleting(true)
    try {
      const res: ApiResponse<any> = await productService.deleteProduct(id)
      if (res.success) {
        setProducts((prev) => prev.filter((product) => product.id !== id))
      }
      return res
    } catch (error: any) {
      console.error("Error al eliminar producto:", error)
      return { success: false, message: error.message || "Ocurrió un error inesperado al eliminar el producto." }
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return {
    products,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  }
}
