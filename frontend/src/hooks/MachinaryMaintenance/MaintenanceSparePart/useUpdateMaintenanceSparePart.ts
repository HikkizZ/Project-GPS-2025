import { useState } from 'react';
import { MaintenanceSparePart, UpdateMaintenanceSparePartData } from '@/types/machinaryMaintenance/maintenanceSparePart.types';
import maintenanceSparePartService from '@/services/machinaryMaintenance/maintenanceSparePart.service';

export function useUpdateMaintenanceSparePart() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [updatedSparePart, setUpdatedSparePart] = useState<MaintenanceSparePart | null>(null);

  const update = async (id: number, data: UpdateMaintenanceSparePartData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setUpdatedSparePart(null);

    const response = await maintenanceSparePartService.update(id, data);

    if (response.success && response.data) {
      setUpdatedSparePart(response.data);
      setSuccess(true);
    } else {
      setError(response.message || 'Error al actualizar repuesto en mantención');
    }

    setLoading(false);
  };

  return {
    loading,
    error,
    success,
    updatedSparePart,
    update
  };
}
