import { useState } from 'react';
import maintenanceRecordService from '@/services/machinaryMaintenance/maintenanceRecord.service';

export function useDeleteMaintenanceRecord() {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = async (id: number) => {
    setLoading(true);
    const response = await maintenanceRecordService.delete(id);
    setSuccess(response.success);
    setError(response.success ? null : response.message);
    setLoading(false);
  };

  return { deleteRecord, loading, success, error };
}
