import { useState, useCallback, useEffect } from 'react';
import type {
  Bono,
  BonoSearchQueryData,
  UpdateBonoData,
  CreateBonoData,
  BonoSearchParamsData,
  BonoResponseData,
  BonoOperationResult
} from '../../types/recursosHumanos/bono.types';
import bonoService, { 
  BonoService
} from '../../services/recursosHumanos/bono.service';



export const useBono = () => {
    
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [bonos, setBonos] = useState<Bono[]>([]);


    //Función para cargar todos los bonos
    const cargarBonos = async () => {
        setIsLoading(true);
        setError('');
        try {
          const result = await bonoService.getAllBonos();
          if (result.success) {
            setBonos(result.data || []);
          } else {
            setError(result.message || 'Error al cargar bonos');
          }
        } catch (error) {
          setError('Error de conexión');
        } finally {
          setIsLoading(false);
        }
      };

    
    

    // Cargar bono específica por ID
    /**
     * 
     * 
    const loadBonoById = async (id?: number) => {
        
        setIsLoading(true);
        setError('');
        try {
            const result = await bonoService.obtenerBonoPorId(id);
            
        
            if (result.success && result.data) {
                const bono = result.data;

            } else {
                throw new Error(result.message || 'Error al cargar bono');
            }
            } catch (error) {
            updateState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Error al cargar ficha',
                currentBono: null
            });
        }
    }, [updateState]);

     */
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

    // Cargar bonos al inicializar el hook
    useEffect(() => {
      cargarBonos();
    }, []);

    return {
        
        // Acciones
    
        setBonos,
        bonos,
        error,
        isLoading,
        setIsLoading,
        cargarBonos,
        //loadBonoById,
        updateBono,
        
    };
}; 