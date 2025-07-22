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

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [lastQuery, setLastQuery] = useState<SupplierSearchQuery>({});

  const loadSuppliers = async (query?: SupplierSearchQuery) => {
    setIsLoading(true);
    setError(null);

    const useQuery = query || lastQuery || {};
    setLastQuery(useQuery);

    try {
      if (useQuery.rut || useQuery.email) {
        const response = await supplierService.searchSupplier(useQuery);
        if (response.success && response.data) {
          setSuppliers([response.data]);
          setTotalSuppliers(1);
        } else {
          setSuppliers([]);
          setTotalSuppliers(0);
          setError("Proveedor no encontrado");
        }
      } else {
        const response = await supplierService.getSuppliers();
        if (response.success) {
          setSuppliers(response.data || []);
          setTotalSuppliers(response.data?.length || 0);
        } else {
          setSuppliers([]);
          setTotalSuppliers(0);
          setError(response.message);
        }
      }
    } catch (err: any) {
      setSuppliers([]);
      setTotalSuppliers(0);
      setError(err.message || "Error al cargar proveedores.");
    } finally {
      setIsLoading(false);
    }
  };

  const createSupplier = async (data: CreateSupplierData) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await supplierService.createSupplier(data);
      if (response.success) {
        await loadSuppliers(lastQuery);
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
