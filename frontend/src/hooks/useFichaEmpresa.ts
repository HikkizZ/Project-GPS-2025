import { useState, useEffect, useCallback } from 'react';
import type {
  FichaEmpresa,
  FichaEmpresaSearchParams,
  PaginatedFichasEmpresa,
  CreateFichaEmpresaData,
  UpdateFichaEmpresaData,
  EstadoLaboral
} from '../types/fichaEmpresa';
import fichaEmpresaService, { FichaEmpresaService } from '../services/fichaEmpresaService';

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
  const loadFichas = useCallback(async (searchParams: FichaEmpresaSearchParams = {}) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const result: PaginatedFichasEmpresa = await fichaEmpresaService.getFichasEmpresa(searchParams);
      
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
        // Cargar mi ficha personal usando el endpoint /mi-ficha del otro servicio
        const response = await fetch('/api/ficha-empresa/mi-ficha', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar mi ficha');
        }
        
        const result = await response.json();
        ficha = result.data;
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

  // Crear nueva ficha
  const createFicha = useCallback(async (data: CreateFichaEmpresaData) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const newFicha = await fichaEmpresaService.createFichaEmpresa(data);
      
      // Agregar la nueva ficha al estado local
      setState(prev => ({
        ...prev,
        fichas: [newFicha, ...prev.fichas],
        isLoading: false,
      }));
      
      return newFicha;
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al crear ficha',
      });
      throw error;
    }
  }, [updateState]);

  // Actualizar ficha existente
  const updateFicha = useCallback(async (id: number, data: UpdateFichaEmpresaData) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const response = await fichaEmpresaService.updateFichaEmpresa(id, data);
      
      if (response.success && response.data) {
        // Actualizar en el estado local
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

  // Eliminar ficha
  const deleteFicha = useCallback(async (id: number) => {
    updateState({ isLoading: true, error: null });
    
    try {
      await fichaEmpresaService.deleteFichaEmpresa(id);
      
      // Remover del estado local
      setState(prev => ({
        ...prev,
        fichas: prev.fichas.filter(ficha => ficha.id !== id),
        currentFicha: prev.currentFicha?.id === id ? null : prev.currentFicha,
        isLoading: false,
      }));
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar ficha',
      });
      throw error;
    }
  }, [updateState]);

  // Actualizar solo el estado laboral
  const updateEstadoLaboral = useCallback(async (id: number, estadoLaboral: EstadoLaboral) => {
    return updateFicha(id, { estadoLaboral });
  }, [updateFicha]);

  // Buscar por RUT
  const searchByRUT = useCallback(async (rut: string) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const ficha = await fichaEmpresaService.getFichaByRUT(rut);
      updateState({
        currentFicha: ficha,
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

  // Reset del estado
  const resetState = useCallback(() => {
    setState({
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
  }, []);

  // Efecto para cargar fichas iniciales
  useEffect(() => {
    loadFichas();
  }, []);

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
    createFicha,
    updateFicha,
    deleteFicha,
    updateEstadoLaboral,
    searchByRUT,
    clearError,
    resetState,
    
    // Utilidades del servicio
    formatSalario: FichaEmpresaService.formatSalario,
    formatFecha: FichaEmpresaService.formatFecha,
    getEstadoLaboralColor: FichaEmpresaService.getEstadoLaboralColor,
    getEstadoLaboralIcon: FichaEmpresaService.getEstadoLaboralIcon,
  };
}; 