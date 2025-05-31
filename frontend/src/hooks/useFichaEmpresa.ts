import { useState, useEffect, useCallback } from 'react';
import type {
  FichaEmpresa,
  FichaEmpresaSearchQuery,
  UpdateFichaEmpresaData,
  EstadoLaboral
} from '../types/fichaEmpresa.types';
import { fichaEmpresaService } from '../services/fichaEmpresa.service';

interface UseFichaEmpresaState {
  fichas: FichaEmpresa[];
  currentFicha: FichaEmpresa | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useFichaEmpresa = () => {
  const [state, setState] = useState<UseFichaEmpresaState>({
    fichas: [],
    currentFicha: null,
    isLoading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  });

  // Función para actualizar el estado de manera inmutable
  const updateState = useCallback((updates: Partial<UseFichaEmpresaState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Función principal para cargar fichas con filtros
  const loadFichas = useCallback(async (searchParams: FichaEmpresaSearchQuery = {}) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const result = await fichaEmpresaService.getFichasEmpresa(searchParams);
      
      updateState({
        fichas: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar fichas',
      });
    }
  }, [updateState]);

  // Cargar ficha específica por ID o mi ficha personal
  const loadFichaById = useCallback(async (id?: number) => {
    updateState({ isLoading: true, error: null });
    
    try {
      let ficha;
      if (id) {
        ficha = await fichaEmpresaService.getFichaEmpresaById(id);
      } else {
        ficha = await fichaEmpresaService.getMiFicha();
      }
      
      updateState({
        currentFicha: ficha,
        isLoading: false,
      });
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar ficha',
      });
    }
  }, [updateState]);

  // Actualizar ficha existente
  const updateFicha = useCallback(async (id: number, data: UpdateFichaEmpresaData) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const response = await fichaEmpresaService.updateFichaEmpresa(id, data);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          fichas: prev.fichas.map(ficha => 
            ficha.id === id ? response.data : ficha
          ),
          currentFicha: prev.currentFicha?.id === id ? response.data : prev.currentFicha,
          isLoading: false,
        }));
        
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar ficha');
      }
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar ficha',
      });
      throw error;
    }
  }, [updateState]);

  // Actualizar solo el estado laboral
  const updateEstadoLaboral = useCallback(async (id: number, estado: EstadoLaboral, motivo?: string) => {
    try {
      return await fichaEmpresaService.updateEstadoLaboral(id, estado, motivo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estado';
      updateState({ error: errorMessage });
      throw error;
    }
  }, [updateState]);

  // Buscar por RUT
  const searchByRUT = useCallback(async (rut: string) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const ficha = await fichaEmpresaService.getFichaByRUT(rut);
      updateState({
        currentFicha: ficha || null,
        fichas: ficha ? [ficha] : [],
        isLoading: false,
      });
      
      return ficha;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al buscar por RUT',
      });
      return null;
    }
  }, [updateState]);

  // Efecto para cargar fichas iniciales
  useEffect(() => {
    loadFichas();
  }, [loadFichas]);

  return {
    // Estado
    fichas: state.fichas,
    currentFicha: state.currentFicha,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,
    
    // Acciones
    loadFichas,
    loadFichaById,
    updateFicha,
    updateEstadoLaboral,
    searchByRUT,
    clearError,
    
    // Utilidades del servicio
    formatSalario: fichaEmpresaService.formatSalario,
    formatFecha: fichaEmpresaService.formatFecha,
    getEstadoLaboralColor: fichaEmpresaService.getEstadoLaboralColor,
    getEstadoLaboralIcon: fichaEmpresaService.getEstadoLaboralIcon,
  };
}; 