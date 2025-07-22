import { useState, useEffect } from 'react';
import { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import maintenanceRecordService from '@/services/machinaryMaintenance/maintenanceRecord.service';

export function useGetMaintenanceRecord(id: number) {
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      const { data, success, message } = await maintenanceRecordService.getById(id);
      if (success && data) {
        setRecord(data);
        setError(null);
      } else {
        setError(message);
      }
      setLoading(false);
    };

    fetchRecord();
  }, [id]);

  return { record, loading, error };
}
