import { useState } from 'react';
import {
  CreateMaintenanceSparePartData,
  MaintenanceSparePart
} from '../../../types/machinaryMaintenance/maintenanceSparePart.types';
import maintenanceSparePartService from '../../../services/machinaryMaintenance/maintenanceSparePart.service'

export function useCreateMaintenanceSparePart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdSparePart, setCreatedSparePart] = useState<MaintenanceSparePart | null>(null);

  const create = async (data: CreateMaintenanceSparePartData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedSparePart(null);

    const response = await maintenanceSparePartService.create(data);

    if (response.success && response.data) {
      setCreatedSparePart(response.data);
      setSuccess(true);
    } else {
      setError(response.message || 'Error al registrar repuesto en mantención');
    }

    setLoading(false);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setCreatedSparePart(null);
  };

  return {
    create,
    loading,
    error,
    success,
    createdSparePart,
    reset
  };
}
