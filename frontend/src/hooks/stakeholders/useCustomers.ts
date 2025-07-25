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

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [lastQuery, setLastQuery] = useState<CustomerSearchQuery>({});

  const loadCustomers = async (query?: CustomerSearchQuery) => {
    setIsLoading(true);
    setError(null);

    const useQuery = query || lastQuery || {};
    setLastQuery(useQuery);

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

  const createCustomer = async (data: CreateCustomerData) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await customerService.createCustomer(data);
      if (response.success) {
        await loadCustomers(lastQuery);
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
