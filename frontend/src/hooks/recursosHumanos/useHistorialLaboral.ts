import { useState } from 'react';
import historialLaboralService from '@/services/recursosHumanos/historialLaboral.service';
import { HistorialLaboral } from '@/types/recursosHumanos/historialLaboral.types';

export function useHistorialLaboral() {
  const [historial, setHistorial] = useState<HistorialLaboral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorial = async (trabajadorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await historialLaboralService.getHistorialByTrabajadorId(trabajadorId);
      
      if (response.success) {
        setHistorial(response.data || []);
      } else {
        setError(response.message);
        setHistorial([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al obtener historial laboral');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    historial,
    loading,
    error,
    fetchHistorial,
    setHistorial,
    setError
  };
} 