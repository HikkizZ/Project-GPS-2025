import { useState } from 'react';
import maintenanceSparePartService from '@/services/machinaryMaintenance/maintenanceSparePart.service';

export function useDeleteMaintenanceSparePart() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const remove = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await maintenanceSparePartService.delete(id);

    if (response.success) {
      setSuccess(true);
    } else {
      setError(response.message || 'Error al eliminar repuesto utilizado');
    }

    setLoading(false);
  };

  return {
    loading,
    error,
    success,
    remove
  };
}
