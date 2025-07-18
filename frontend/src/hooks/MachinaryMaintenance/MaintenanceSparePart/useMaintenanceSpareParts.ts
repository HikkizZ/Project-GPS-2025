import { useState, useEffect } from 'react';
import { MaintenanceSparePart } from '../../../types/machinaryMaintenance/maintenanceSparePart.types';
import maintenanceSparePartService from '../../../services/machinaryMaintenance/maintenanceSparePart.service';

export function useMaintenanceSpareParts() {
  const [mspList, setMspList] = useState<MaintenanceSparePart[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMsp = async () => {
    setLoading(true);
    setError(null);

    const { data, success, message } = await maintenanceSparePartService.getAll();

    if (!success) {
      setError(message || 'Error al obtener repuestos utilizados');
    } else if (data) {
      setMspList(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMsp();
  }, []);

  return {
    maintenanceSpareParts: mspList,
    loading,
    error,
    reload: loadMsp
  };
}
