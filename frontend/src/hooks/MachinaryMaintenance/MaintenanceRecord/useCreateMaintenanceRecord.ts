import { useState } from 'react';
import { CreateMaintenanceRecordData, MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import maintenanceRecordService from '@/services/machinaryMaintenance/maintenanceRecord.service';

export function useCreateMaintenanceRecord() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRecord, setCreatedRecord] = useState<MaintenanceRecord | null>(null);

  const create = async (data: CreateMaintenanceRecordData) => {
    setLoading(true);
    const { data: newRecord, success, message } = await maintenanceRecordService.create(data);
    if (success && newRecord) {
      setCreatedRecord(newRecord);
      setError(null);
    } else {
      setError(message);
    }
    setLoading(false);
  };

  return { create, loading, error, createdRecord };
}
