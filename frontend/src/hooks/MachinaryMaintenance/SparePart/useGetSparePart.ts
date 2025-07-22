import { useState, useEffect } from 'react';
import sparePartService from '@/services/machinaryMaintenance/sparePart.service';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

export function useGetSparePart(id: number) {
  const [sparePart, setSparePart] = useState<SparePart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSparePart = async () => {
      const { data, success, message } = await sparePartService.getById(id);
      if (success && data) {
        setSparePart(data);
      } else {
        setError(message);
      }
      setLoading(false);
    };

    if (id) fetchSparePart();
  }, [id]);

  return { sparePart, loading, error };
}
