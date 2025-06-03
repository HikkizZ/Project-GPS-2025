import { useState, useEffect } from 'react';
import { trabajadorService } from '@/services/recursosHumanos/trabajador.service';
import { Trabajador, TrabajadorSearchQuery, CreateTrabajadorData } from '@/types/trabajador.types';

export const useTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Cargar todos los trabajadores
  const loadTrabajadores = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.getTrabajadores();
      if (result.trabajadores) {
        setTrabajadores(result.trabajadores);
      } else {
        setError(result.error || 'Error al cargar trabajadores');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar trabajadores
  const searchTrabajadores = async (query: TrabajadorSearchQuery) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.searchTrabajadores(query);
      if (result.trabajadores) {
        setTrabajadores(result.trabajadores);
      } else {
        setError(result.error || 'No se encontraron trabajadores');
        setTrabajadores([]);
      }
    } catch (error) {
      setError('Error en la búsqueda');
      setTrabajadores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Crear trabajador
  const createTrabajador = async (trabajadorData: CreateTrabajadorData) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.createTrabajador(trabajadorData);
      if (result.trabajador) {
        await loadTrabajadores(); // Recargar la lista
        return { success: true, trabajador: result.trabajador };
      } else {
        setError(result.error || 'Error al crear trabajador');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error al crear trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar trabajador
  const updateTrabajador = async (id: number, trabajadorData: Partial<Trabajador>) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.updateTrabajador(id, trabajadorData);
      if (result.trabajador) {
        await loadTrabajadores(); // Recargar la lista
        return { success: true, trabajador: result.trabajador };
      } else {
        const errorMsg = result.error || 'Error al actualizar trabajador';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = 'Error al actualizar trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar trabajador
  const deleteTrabajador = async (id: number) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.deleteTrabajador(id);
      if (result.success) {
        await loadTrabajadores(); // Recargar la lista
        return { success: true };
      } else {
        setError(result.error || 'Error al eliminar trabajador');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error al eliminar trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Desvincular trabajador
  const desvincularTrabajador = async (id: number, motivo: string) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.desvincularTrabajador(id, motivo);
      if (result.success) {
        await loadTrabajadores(); // Recargar la lista
        return { success: true };
      } else {
        setError(result.error || 'Error al desvincular trabajador');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error al desvincular trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar trabajadores al inicializar el hook
  useEffect(() => {
    loadTrabajadores();
  }, []);

  return {
    trabajadores,
    isLoading,
    error,
    loadTrabajadores,
    searchTrabajadores,
    createTrabajador,
    updateTrabajador,
    deleteTrabajador,
    desvincularTrabajador,
    clearError: () => setError('')
  };
}; 