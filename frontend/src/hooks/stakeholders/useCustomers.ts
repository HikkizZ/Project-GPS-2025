import { useState, useEffect } from "react";
import { customerService } from "@/services/stakeholders/customer.service";
import {
  Customer,
  CustomerSearchQuery,
  CreateCustomerData,
  UpdateCustomerData,
} from "@/types/stakeholders/customer.types";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados específicos para operaciones individuales
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Última query de búsqueda (para reutilizar al recargar)
  const [lastQuery, setLastQuery] = useState<CustomerSearchQuery>({});

  //? Cargar clientes con filtros
  const loadCustomers = async (query?: CustomerSearchQuery) => {
    setIsLoading(true);
    setError(null);

    const useQuery = query || lastQuery || {};
    setLastQuery(useQuery); // Guardamos la última query utilizada

    try {
      if (useQuery.rut || useQuery.email) {
        const response = await customerService.searchCustomer(useQuery);
        if (response.success && response.data) {
          setCustomers([response.data]);
          setTotalCustomers(1);
        } else {
          setCustomers([]);
          setTotalCustomers(0);
          setError("Cliente no encontrado");
        }
      } else {
        const response = await customerService.getCustomers();
        if (response.success) {
          setCustomers(response.data || []);
          setTotalCustomers(response.data?.length || 0);
        } else {
          setCustomers([]);
          setTotalCustomers(0);
          setError(response.message);
        }
      }
    } catch (err: any) {
      setCustomers([]);
      setTotalCustomers(0);
      setError(err.message || "Error al cargar clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  //? Crear cliente
  const createCustomer = async (data: CreateCustomerData) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await customerService.createCustomer(data);
      if (response.success) {
        await loadCustomers(lastQuery); // Recargar clientes con la última query
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, error: response.error || "Error al crear cliente" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Error inesperado" };
    } finally {
      setIsCreating(false);
    }
  };

  //? Actualizar cliente
  const updateCustomer = async (id: number, data: UpdateCustomerData) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await customerService.updateCustomer(id, data);
      if (response.success) {
        await loadCustomers(lastQuery);
        return { success: true, data: response.data, message: response.message };
      } else {
        return { success: false, error: response.error || "Error al actualizar cliente" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Error inesperado" };
    } finally {
      setIsUpdating(false);
    }
  };

  //? Eliminar cliente
  const deleteCustomer = async (id: number) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await customerService.deleteCustomer(id);
      if (response.success) {
        await loadCustomers(lastQuery);
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response.error || "Error al eliminar cliente" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Error inesperado" };
    } finally {
      setIsDeleting(false);
    }
  };

  // Cargar clientes al iniciar (si es necesario)
  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    totalCustomers,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
