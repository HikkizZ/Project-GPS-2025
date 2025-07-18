import { useState } from 'react';
import { UpdateMaintenanceRecordData, MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import maintenanceRecordService from '@/services/machinaryMaintenance/maintenanceRecord.service';

export function useUpdateMaintenanceRecord() {
  const [loading, setLoading] = useState<boolean>(false);
  const [updatedRecord, setUpdatedRecord] = useState<MaintenanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: UpdateMaintenanceRecordData) => {
    setLoading(true);
    const { data: updated, success, message } = await maintenanceRecordService.update(id, data);
    if (success && updated) {
      setUpdatedRecord(updated);
      setError(null);
    } else {
      setError(message);
    }
    setLoading(false);
  };
  if (error) {
      setError(error);
      console.error("Error al actualizar:", error); // <- para depurar
    }

  return { update, loading, error, updatedRecord };
}
