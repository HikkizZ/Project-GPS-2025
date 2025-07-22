import { useState } from 'react';
import sparePartService from '@/services/machinaryMaintenance/sparePart.service';
import { UpdateSparePartData, SparePart } from '@/types/machinaryMaintenance/sparePart.types';

export function useUpdateSparePart() {
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState<SparePart | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateSparePart = async (id: number, data: UpdateSparePartData) => {
    setLoading(true);
    setError(null);
    const { success, data: updatedPart, message } = await sparePartService.update(id, data);

    if (success && updatedPart) {
      setUpdated(updatedPart);
    } else {
      setError(message);
    }

    setLoading(false);
  };

  return { updateSparePart, loading, error, updated };
}
