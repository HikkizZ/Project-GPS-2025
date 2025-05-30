import { useState, useCallback } from 'react';
import type {
  Trabajador,
  CreateTrabajadorData,
  UpdateTrabajadorData,
  TrabajadorSearchParams
} from '../types/trabajador';
import trabajadorService, { TrabajadorService } from '../services/trabajadorService';

interface UseTrabajadorState {
  trabajadores: Trabajador[];
  currentTrabajador: Trabajador | null;
  isLoading: boolean;
  error: string | null;
}

export const useTrabajador = () => {
  const [state, setState] = useState<UseTrabajadorState>({
    trabajadores: [],
    currentTrabajador: null,
    isLoading: false,
    error: null,
  });

  // Función para actualizar el estado de manera inmutable
  const updateState = useCallback((updates: Partial<UseTrabajadorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Crear nuevo trabajador
  const createTrabajador = useCallback(async (data: CreateTrabajadorData) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const newTrabajador = await trabajadorService.createTrabajador(data);
      
      // Agregar el nuevo trabajador al estado local
      setState(prev => ({
        ...prev,
        trabajadores: [newTrabajador, ...prev.trabajadores],
        currentTrabajador: newTrabajador,
        isLoading: false,
      }));
      
      return newTrabajador;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al crear trabajador',
      });
      throw error;
    }
  }, [updateState]);

  // Cargar todos los trabajadores
  const loadTrabajadores = useCallback(async () => {
    updateState({ isLoading: true, error: null });
    
    try {
      const trabajadores = await trabajadorService.getTrabajadores();
      
      updateState({
        trabajadores,
        isLoading: false,
      });
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar trabajadores',
      });
    }
  }, [updateState]);

  // Buscar trabajadores con filtros
  const searchTrabajadores = useCallback(async (searchParams: TrabajadorSearchParams = {}) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const trabajadores = await trabajadorService.searchTrabajadores(searchParams);
      
      updateState({
        trabajadores,
        isLoading: false,
      });
      
      return trabajadores;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al buscar trabajadores',
      });
      return [];
    }
  }, [updateState]);

  // Cargar trabajador específico por ID
  const loadTrabajadorById = useCallback(async (id: number) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const trabajador = await trabajadorService.getTrabajadorById(id);
      updateState({
        currentTrabajador: trabajador,
        isLoading: false,
      });
      
      return trabajador;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar trabajador',
      });
      return null;
    }
  }, [updateState]);

  // Actualizar trabajador existente
  const updateTrabajador = useCallback(async (id: number, data: UpdateTrabajadorData) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const updatedTrabajador = await trabajadorService.updateTrabajador(id, data);
      
      // Actualizar en el estado local
      setState(prev => ({
        ...prev,
        trabajadores: prev.trabajadores.map(trabajador => 
          trabajador.id === id ? updatedTrabajador : trabajador
        ),
        currentTrabajador: prev.currentTrabajador?.id === id ? updatedTrabajador : prev.currentTrabajador,
        isLoading: false,
      }));
      
      return updatedTrabajador;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar trabajador',
      });
      throw error;
    }
  }, [updateState]);

  // Eliminar (desactivar) trabajador
  const deleteTrabajador = useCallback(async (id: number) => {
    updateState({ isLoading: true, error: null });
    
    try {
      await trabajadorService.deleteTrabajador(id);
      
      // Remover del estado local
      setState(prev => ({
        ...prev,
        trabajadores: prev.trabajadores.filter(trabajador => trabajador.id !== id),
        currentTrabajador: prev.currentTrabajador?.id === id ? null : prev.currentTrabajador,
        isLoading: false,
      }));
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar trabajador',
      });
      throw error;
    }
  }, [updateState]);

  // Buscar por RUT
  const searchByRUT = useCallback(async (rut: string) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const trabajador = await trabajadorService.getTrabajadorByRUT(rut);
      updateState({
        currentTrabajador: trabajador,
        trabajadores: trabajador ? [trabajador] : [],
        isLoading: false,
      });
      
      return trabajador;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al buscar por RUT',
      });
      return null;
    }
  }, [updateState]);

  // Validar RUT antes de crear
  const validateRUT = useCallback((rut: string): boolean => {
    return TrabajadorService.validateRUT(rut);
  }, []);

  // Reset del estado
  const resetState = useCallback(() => {
    setState({
      trabajadores: [],
      currentTrabajador: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    // Estado
    trabajadores: state.trabajadores,
    currentTrabajador: state.currentTrabajador,
    isLoading: state.isLoading,
    error: state.error,
    
    // Acciones
    createTrabajador,
    loadTrabajadores,
    searchTrabajadores,
    loadTrabajadorById,
    updateTrabajador,
    deleteTrabajador,
    searchByRUT,
    validateRUT,
    clearError,
    resetState,
    
    // Utilidades del servicio
    formatRUT: TrabajadorService.formatRUT,
    formatPhone: TrabajadorService.formatPhone,
    formatFecha: TrabajadorService.formatFecha,
  };
}; 