import { useState } from 'react';
import sparePartService from '@/services/machinaryMaintenance/sparePart.service';

export function useDeleteSparePart() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteSparePart = async (id: number) => {
    setLoading(true);
    setError(null);
    const res = await sparePartService.delete(id);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message);
      setSuccess(false);
    }

    setLoading(false);
  };

  return { deleteSparePart, loading, success, error };
}
