import { useState, useCallback } from 'react';
import { trabajadorService } from '@/services/trabajador.service';
import type { Trabajador, CreateTrabajadorData } from '@/types/trabajador.types';

export const useTrabajador = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

  const getTrabajadores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await trabajadorService.getTrabajadores();
      if (response.trabajadores) {
        setTrabajadores(response.trabajadores);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Error al obtener trabajadores');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrabajador = useCallback(async (data: CreateTrabajadorData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await trabajadorService.createTrabajador(data);
      if (response.trabajador) {
        setTrabajadores(prev => [...prev, response.trabajador!]);
        return { success: true };
      } else if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: false, error: 'Error desconocido' };
    } catch (err) {
      const errorMsg = 'Error al crear trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrabajador = useCallback(async (id: number, data: Partial<Trabajador>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await trabajadorService.updateTrabajador(id, data);
      if (response.trabajador) {
        setTrabajadores(prev => 
          prev.map(t => t.id === id ? response.trabajador! : t)
        );
        return { success: true };
      } else if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: false, error: 'Error desconocido' };
    } catch (err) {
      const errorMsg = 'Error al actualizar trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrabajador = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await trabajadorService.deleteTrabajador(id);
      setTrabajadores(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = 'Error al eliminar trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    trabajadores,
    isLoading,
    error,
    getTrabajadores,
    createTrabajador,
    updateTrabajador,
    deleteTrabajador
  };
}; 