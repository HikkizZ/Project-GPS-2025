import { useState, useEffect, useCallback } from 'react';
import type {
  FichaEmpresa,
  FichaEmpresaSearchQuery,
  UpdateFichaEmpresaData,
  EstadoLaboral
} from '../types/fichaEmpresa.types';
import fichaEmpresaService, { 
  FichaEmpresaService, 
  downloadContrato as downloadContratoService 
} from '../services/fichaEmpresa.service';

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

  // Función para descargar contrato
  const downloadContrato = useCallback(async (fichaId: number) => {
    try {
      await downloadContratoService(fichaId);
    } catch (error) {
      throw error;
    }
  }, []);

  // Función principal para cargar fichas con filtros
  const loadFichas = useCallback(async (searchParams: FichaEmpresaSearchQuery = {}) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const result = await fichaEmpresaService.getFichasEmpresa(searchParams);
      
      if (result.success && result.data) {
        updateState({
          fichas: result.data,
          isLoading: false,
        });
      } else {
        throw new Error(result.message);
      }
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
      let result;
      if (id) {
        result = await fichaEmpresaService.getFichaEmpresaById(id);
      } else {
        result = await fichaEmpresaService.getMiFicha();
      }
      
      if (result.success && result.data) {
        updateState({
          currentFicha: result.data,
          isLoading: false,
        });
      } else {
        throw new Error(result.message || 'Error al cargar ficha');
      }
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar ficha',
        currentFicha: null
      });
    }
  }, [updateState]);

  // Actualizar ficha existente
  const updateFicha = useCallback(async (id: number, data: UpdateFichaEmpresaData) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const response = await fichaEmpresaService.updateFichaEmpresa(id, data);
      
      if (response.success && response.data) {
        const updatedFicha = response.data;
        setState(prev => ({
          ...prev,
          fichas: prev.fichas.map(ficha => 
            ficha.id === id ? updatedFicha : ficha
          ),
          currentFicha: prev.currentFicha?.id === id ? updatedFicha : prev.currentFicha || null,
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
      const result = await fichaEmpresaService.getFichaByRUT(rut);
      if (result.success && result.data) {
        updateState({
          currentFicha: result.data,
          fichas: [result.data],
          isLoading: false,
          error: null
        });
        return result.data;
      } else {
        updateState({
          isLoading: false,
          error: result.message || 'No se encontró la ficha',
          currentFicha: null,
          fichas: []
        });
        return null;
      }
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al buscar por RUT',
        currentFicha: null,
        fichas: []
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
    downloadContrato,
    
    // Utilidades del servicio
    formatSalario: FichaEmpresaService.formatSalario,
    formatFecha: FichaEmpresaService.formatFecha,
    getEstadoLaboralColor: FichaEmpresaService.getEstadoLaboralColor,
    getEstadoLaboralIcon: FichaEmpresaService.getEstadoLaboralIcon,
  };
}; 