import { useState, useCallback, useEffect } from 'react';
import { bonoService } from '../../services/recursosHumanos/bono.service';
import type {
  Bono,
  BonoSearchQueryData,
  UpdateBonoData,
  CreateBonoData,
  BonoSearchParamsData,
  BonoOperationResult
} from '../../types/recursosHumanos/bono.types';

export const useBono = () => {
  const [bonos, setBonos] = useState<Bono[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [totalBonos, setTotalBonos] = useState(0);

  //Función para cargar todos los bonos
  const cargarBonos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await bonoService.getAllBonos();
      if (result.success) {
          const newBonos = result.data?.bonos || [];
          const newTotal = result.data?.total || 0;
          setBonos(newBonos);
          setTotalBonos(newTotal);
        
      } else {
          setError(result.message || 'Error al cargar bonos');
          setTotalBonos(0);
      }
    } catch (error) {
        setError('Error de conexión');
        setTotalBonos(0);
    } finally {
        setIsLoading(false);
    }
  };

  const createBono = async (bonoData: CreateBonoData) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await bonoService.crearBono(bonoData);
      if (result.success) {
        await cargarBonos(); // Recargar la lista después de crear
        return {
          success: true,
          bono: result.bono,
          advertencias: result.advertencias || []
        };
      } else {
        setError(result.error || 'Error al crear bono');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al crear bono';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };
    
    // Actualizar bono existente
    const updateBono = async (id: number, data: UpdateBonoData) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await bonoService.actualizarBono(id, data);
            if (result.success && result.data) {
                await cargarBonos(); // Recargar la lista
                return { success: true, bono: result.data };
            } else {
                const errorMsg = result.message || 'Error al actualizar bono';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            const errorMsg = 'Error al actualizar bono';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
        
    };

    // Buscar bonos con parámetros
    const searchBonos = async (query: BonoSearchQueryData = {}) => {
        setIsLoading(true);
        setError('');
        try {
                    const result = await bonoService.getAllBonos(query);
        if (result.success) {
            setBonos(result.data?.bonos || []);
            setTotalBonos(result.data?.total || 0);
        } else {
                setError(result.message || 'Error al buscar bonos');
                setTotalBonos(0);
            }
        } catch (error) {
            setError('Error de conexión');
            setTotalBonos(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Desactivar bono
    const desactivarBono = async (id: number, motivo: string) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await bonoService.desactivarBono(id, motivo);
            if (result.success) {
                await cargarBonos(); // Recargar la lista
                return { success: true };
            } else {
                const errorMsg = result.message || 'Error al desactivar bono';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            const errorMsg = 'Error al desactivar bono';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar bonos al inicializar el hook
    useEffect(() => {
      cargarBonos();
    }, []);

    return {
    bonos,
    isLoading,
    error,
    cargarBonos,
    searchBonos,
    createBono,
    updateBono,
    clearError: () => setError(''),
    totalBonos,
    desactivarBono
  };
}; 