import { useState, useEffect } from 'react';
import { MaintenanceRecord } from '../../types/machinaryMaintenance/maintenanceRecord.types';
import maintenanceRecordService from '../../services/machinaryMaintenance/maintenanceRecord.service';

export function useMaintenanceRecords() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);

    const { data, success, message } = await maintenanceRecordService.getAll();

    if (!success) {
      setError(message || 'Error al obtener mantenciones');
    } else if (data) {
      setRecords(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return {
    records,
    loading,
    error,
    reload: loadRecords
  };
}
