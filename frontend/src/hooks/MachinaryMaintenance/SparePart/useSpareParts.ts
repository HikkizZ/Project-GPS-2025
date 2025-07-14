import { useState, useEffect } from 'react';
import { SparePart } from '../../types/machinaryMaintenance/sparePart.types';
import sparePartService from '../../services/machinaryMaintenance/sparePart.service';

export function useSpareParts() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpareParts = async () => {
    setLoading(true);
    setError(null);

    const { data, success, message } = await sparePartService.getAll();

    if (!success) {
      setError(message || 'Error al obtener los repuestos');
    } else if (data) {
      setSpareParts(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSpareParts();
  }, []);

  return {
    spareParts,
    loading,
    error,
    reload: loadSpareParts
  };
}
