import { useState } from 'react';
import { CreateSparePartData, SparePart } from '@/types/machinaryMaintenance/sparePart.types';
import sparePartService from '@/services/machinaryMaintenance/sparePart.service';

export function useCreateSparePart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SparePart | null>(null);

  const create = async (data: CreateSparePartData) => {

    setLoading(true);

    const { data: newPart, success, message } = await sparePartService.create(data);

    if (success && newPart) {
        
      setCreated(newPart);
      setError(null);

    } else {

      setError(message);

    }
    setLoading(false);
  };

  return { create, loading, error, created };
}
