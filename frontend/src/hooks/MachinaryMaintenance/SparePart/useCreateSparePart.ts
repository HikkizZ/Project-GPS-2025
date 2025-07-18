import { useState } from 'react';
import sparePartService from '@/services/machinaryMaintenance/sparePart.service';
import { CreateSparePartData, SparePart } from '@/types/machinaryMaintenance/sparePart.types';

export function useCreateSparePart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SparePart | null>(null);

  const createSparePart = async (data: CreateSparePartData) => {
    setLoading(true);
    setError(null);
    const { success, data: newPart, message } = await sparePartService.create(data);

    if (success && newPart) {
      setCreated(newPart);
    } else {
      setError(message);
    }

    setLoading(false);
  };

  return { createSparePart, loading, error, created };
}
