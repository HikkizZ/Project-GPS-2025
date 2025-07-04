import { useState, useEffect } from 'react';
import { trabajadorService } from '@/services/recursosHumanos/trabajador.service';
import { Trabajador, TrabajadorSearchQuery, CreateTrabajadorData, UpdateTrabajadorData } from '@/types/recursosHumanos/trabajador.types';

export const useTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [totalTrabajadores, setTotalTrabajadores] = useState<number>(0);

  // Cargar todos los trabajadores
  const loadTrabajadores = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.getAllTrabajadores();
      if (result.success) {
        setTrabajadores(result.data || []);
        setTotalTrabajadores((result.data || []).length);
      } else {
        setError(result.message || 'Error al cargar trabajadores');
        setTotalTrabajadores(0);
      }
    } catch (error) {
      setError('Error de conexión');
      setTotalTrabajadores(0);
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
      if (result.success) {
        await loadTrabajadores(); // Recargar la lista después de crear
        return { 
          success: true, 
          trabajador: result.trabajador,
          advertencias: result.advertencias || []
        };
      } else {
        setError(result.error || 'Error al crear trabajador');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al crear trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar trabajador
  const updateTrabajador = async (id: number, trabajadorData: UpdateTrabajadorData) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.updateTrabajador(id, trabajadorData);
      if (result.success && result.data) {
        await loadTrabajadores(); // Recargar la lista
        return { success: true, trabajador: result.data };
      } else {
        const errorMsg = result.message || 'Error al actualizar trabajador';
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
        setError(result.message || 'Error al eliminar trabajador');
        return { success: false, error: result.message };
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
        setError(result.message || 'Error al desvincular trabajador');
        return { success: false, error: result.message };
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
    createTrabajador,
    updateTrabajador,
    deleteTrabajador,
    desvincularTrabajador,
    clearError: () => setError(''),
    totalTrabajadores
  };
}; 