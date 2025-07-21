import { useState, useEffect } from "react";
import { supplierService } from "@/services/stakeholders/supplier.service";
import {
  Supplier,
  SupplierSearchQuery,
  CreateSupplierData,
  UpdateSupplierData,
} from "@/types/stakeholders/supplier.types";

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados específicos para operaciones individuales
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Última query de búsqueda (para reutilizar al recargar)
  const [lastQuery, setLastQuery] = useState<SupplierSearchQuery>({});

  //? Cargar proveedores con filtros
  const loadSuppliers = async (query: SupplierSearchQuery = {}) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(query);

    try {
      const response = await supplierService.getSuppliers(query);
      if (response.success) {
        setSuppliers(response.data || []);
        setTotalSuppliers(response.data?.length || 0);
      } else {
        setError(response.message);
        setSuppliers([]);
        setTotalSuppliers(0);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar proveedores.");
      setSuppliers([]);
      setTotalSuppliers(0);
    } finally {
      setIsLoading(false);
    }
  };

  //? Crear proveedor
  const createSupplier = async (data: CreateSupplierData) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await supplierService.createSupplier(data);
      if (response.success) {
        await loadSuppliers(lastQuery); // Recargar proveedores con la última query
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, error: response.error || "Error al crear proveedor" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Error inesperado" };
    } finally {
      setIsCreating(false);
    }
  };

  //? Actualizar proveedor
  const updateSupplier = async (id: number, data: UpdateSupplierData) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await supplierService.updateSupplier(id, data);
      if (response.success) {
        await loadSuppliers(lastQuery);
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, error: response.error || "Error al actualizar proveedor" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Error inesperado" };
    } finally {
      setIsUpdating(false);
    }
  };

  //? Eliminar proveedor
  const deleteSupplier = async (id: number) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await supplierService.deleteSupplier(id);
      if (response.success) {
        await loadSuppliers(lastQuery);
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response.error || "Error al eliminar proveedor" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Error inesperado" };
    } finally {
      setIsDeleting(false);
    }
  };

  // Cargar proveedores al iniciar (si es necesario)
  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    totalSuppliers,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
