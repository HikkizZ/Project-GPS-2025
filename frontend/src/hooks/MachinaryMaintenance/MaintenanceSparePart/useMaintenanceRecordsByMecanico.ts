import { useEffect, useState } from 'react';
import { getMaintenanceRecords } from '@/services/machinaryMaintenance/maintenanceRecord.service';
import { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';

export const useMaintenanceRecordsByMecanico = (mecanicoId: number) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      const [data, err] = await getMaintenanceRecords({ mecanicoId }); 
      if (err) throw new Error(err);
      setRecords(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mecanicoId) fetchRecords();
  }, [mecanicoId]);

  return { records, loading, error };
};
