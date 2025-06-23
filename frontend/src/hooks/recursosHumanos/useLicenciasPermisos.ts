import { useState, useRef, useCallback, useMemo } from 'react';
import { licenciaPermisoService } from '@/services/recursosHumanos/licenciaPermiso.service';
import {
  LicenciaPermiso,
  CreateLicenciaPermisoForm,
  UpdateLicenciaPermisoDTO,
  LicenciaPermisoFilters,
  TipoSolicitud,
  EstadoSolicitud
} from '@/types/recursosHumanos/licenciaPermiso.types';

export interface UseLicenciasPermisosOptions {
  /** Si true, carga automáticamente las solicitudes al montar el componente */
  autoLoad?: boolean;
  /** Tipo de carga: 'mis-solicitudes' para usuario normal, 'todas' para RRHH */
  tipoVista?: 'mis-solicitudes' | 'todas';
}

export const useLicenciasPermisos = (options: UseLicenciasPermisosOptions = {}) => {
  // Crear referencias estables para las opciones usando useRef
  const autoLoadRef = useRef(options.autoLoad ?? false);
  const tipoVistaRef = useRef(options.tipoVista ?? 'mis-solicitudes');
  
  // Actualizar refs solo si cambian (sin causar re-renders)
  autoLoadRef.current = options.autoLoad ?? false;
  tipoVistaRef.current = options.tipoVista ?? 'mis-solicitudes';
  
  // Valores estables que NO cambian
  const autoLoad = autoLoadRef.current;
  const tipoVista = tipoVistaRef.current;
  
  // Estados principales
  const [solicitudes, setSolicitudes] = useState<LicenciaPermiso[]>([]);
  const [solicitudActual, setSolicitudActual] = useState<LicenciaPermiso | null>(null);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados de error
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filtros aplicados
  const [filtrosAplicados, setFiltrosAplicados] = useState<LicenciaPermisoFilters>({});

  // Flag para controlar la carga inicial
  const hasLoaded = useRef(false);

  // ===============================
  // FUNCIONES DE CARGA SIMPLES
  // ===============================

  const cargarMisSolicitudes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await licenciaPermisoService.obtenerMisSolicitudes();
      if (result.success && result.data) {
        setSolicitudes(result.data);
      } else {
        setError(result.error || 'Error al cargar solicitudes');
        setSolicitudes([]);
      }
    } catch (error) {
      setError('Error de conexión al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Array vacío - función estable

  const cargarTodasLasSolicitudes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await licenciaPermisoService.obtenerTodasLasSolicitudes();
      if (result.success && result.data) {
        setSolicitudes(result.data);
      } else {
        setError(result.error || 'Error al cargar solicitudes');
        setSolicitudes([]);
      }
    } catch (error) {
      setError('Error de conexión al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Array vacío - función estable

  const recargarSolicitudes = useCallback(async () => {
    if (tipoVistaRef.current === 'mis-solicitudes') {
      await cargarMisSolicitudes();
    } else {
      await cargarTodasLasSolicitudes();
    }
  }, [cargarMisSolicitudes, cargarTodasLasSolicitudes]); // Usa tipoVistaRef.current directamente

  // ===============================
  // FUNCIONES CRUD
  // ===============================

  const crearSolicitud = useCallback(async (solicitudData: CreateLicenciaPermisoForm) => {
    setIsCreating(true);
    setError('');
    setValidationErrors({});
    
    try {
      const result = await licenciaPermisoService.crearSolicitud(solicitudData);
      if (result.success && result.data) {
        // Recargar después de crear - usar directamente las funciones memoizadas
        if (tipoVistaRef.current === 'mis-solicitudes') {
          await cargarMisSolicitudes();
        } else {
          await cargarTodasLasSolicitudes();
        }
        return { 
          success: true, 
          solicitud: result.data,
          message: 'Solicitud creada exitosamente'
        };
      } else {
        setError(result.error || 'Error al crear solicitud');
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        return { 
          success: false, 
          error: result.error,
          errors: result.errors
        };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al crear solicitud';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsCreating(false);
    }
  }, [cargarMisSolicitudes, cargarTodasLasSolicitudes]); // Dependencias estables únicamente

  const actualizarSolicitud = useCallback(async (id: number, updateData: UpdateLicenciaPermisoDTO) => {
    setIsUpdating(true);
    setError('');
    setValidationErrors({});

    try {
      const result = await licenciaPermisoService.actualizarSolicitud(id, updateData);
      if (result.success && result.data) {
        // Recargar después de actualizar - usar directamente las funciones memoizadas
        if (tipoVistaRef.current === 'mis-solicitudes') {
          await cargarMisSolicitudes();
        } else {
          await cargarTodasLasSolicitudes();
        }
        // Actualizar la solicitud actual si es la misma
        if (solicitudActual?.id === id) {
          setSolicitudActual(result.data);
        }
        return { 
          success: true, 
          solicitud: result.data,
          message: 'Solicitud actualizada exitosamente'
        };
      } else {
        setError(result.error || 'Error al actualizar solicitud');
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        return { 
          success: false, 
          error: result.error,
          errors: result.errors
        };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al actualizar solicitud';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUpdating(false);
    }
  }, [cargarMisSolicitudes, cargarTodasLasSolicitudes, solicitudActual?.id]); // Dependencias estables únicamente

  const eliminarSolicitud = useCallback(async (id: number) => {
    setIsDeleting(true);
    setError('');

    try {
      const result = await licenciaPermisoService.eliminarSolicitud(id);
      if (result.success) {
        // Recargar después de eliminar - usar directamente las funciones memoizadas
        if (tipoVistaRef.current === 'mis-solicitudes') {
          await cargarMisSolicitudes();
        } else {
          await cargarTodasLasSolicitudes();
        }
        // Limpiar solicitud actual si es la misma que se eliminó
        if (solicitudActual?.id === id) {
          setSolicitudActual(null);
        }
        return { 
          success: true,
          message: 'Solicitud eliminada exitosamente'
        };
      } else {
        setError(result.message || 'Error al eliminar solicitud');
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al eliminar solicitud';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsDeleting(false);
    }
  }, [cargarMisSolicitudes, cargarTodasLasSolicitudes, solicitudActual?.id]); // Dependencias estables únicamente

  const obtenerSolicitudPorId = useCallback(async (id: number) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await licenciaPermisoService.obtenerSolicitudPorId(id);
      if (result.success && result.data) {
        setSolicitudActual(result.data);
        return { success: true, solicitud: result.data };
      } else {
        setError(result.error || 'Error al obtener solicitud');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error al obtener solicitud';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias - solo actualiza estado interno

  // ===============================
  // OTRAS FUNCIONES
  // ===============================

  const descargarArchivo = useCallback(async (id: number) => {
    try {
      const result = await licenciaPermisoService.descargarArchivo(id);
      if (result.success && result.blob && result.filename) {
        const url = window.URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Archivo descargado exitosamente' };
      } else {
        setError(result.error || 'Error al descargar archivo');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al descargar archivo';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []); // Sin dependencias - solo interactúa con API y DOM

  const verificarLicenciasVencidas = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await licenciaPermisoService.verificarLicenciasVencidas();
      if (result.success) {
        // Recargar después de verificar - usar directamente las funciones memoizadas
        if (tipoVistaRef.current === 'mis-solicitudes') {
          await cargarMisSolicitudes();
        } else {
          await cargarTodasLasSolicitudes();
        }
        return { 
          success: true, 
          actualizaciones: result.data?.actualizaciones || 0,
          message: result.message
        };
      } else {
        setError(result.message || 'Error al verificar vencimientos');
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al verificar vencimientos';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [cargarMisSolicitudes, cargarTodasLasSolicitudes]); // Dependencias estables únicamente

  // ===============================
  // FUNCIONES DE UTILIDAD
  // ===============================

  const aplicarFiltros = useCallback((filtros: LicenciaPermisoFilters) => {
    setFiltrosAplicados(filtros);
  }, []); // Sin dependencias - solo actualiza estado

  const limpiarFiltros = useCallback(() => {
    setFiltrosAplicados({});
  }, []); // Sin dependencias - solo actualiza estado

  const limpiarErrores = useCallback(() => {
    setError('');
    setValidationErrors({});
  }, []); // Sin dependencias - solo actualiza estado

  const limpiarSolicitudActual = useCallback(() => {
    setSolicitudActual(null);
  }, []); // Sin dependencias - solo actualiza estado

  // Filtrar solicitudes - MEMOIZADO para estabilidad
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(solicitud => {
      if (filtrosAplicados.estado && solicitud.estado !== filtrosAplicados.estado) {
        return false;
      }
      if (filtrosAplicados.tipo && solicitud.tipo !== filtrosAplicados.tipo) {
        return false;
      }
      if (filtrosAplicados.trabajadorId && solicitud.trabajador.id !== filtrosAplicados.trabajadorId) {
        return false;
      }
      if (filtrosAplicados.fechaDesde && solicitud.fechaInicio < filtrosAplicados.fechaDesde) {
        return false;
      }
      if (filtrosAplicados.fechaHasta && solicitud.fechaFin > filtrosAplicados.fechaHasta) {
        return false;
      }
      return true;
    });
  }, [solicitudes, filtrosAplicados]); // Solo depende de estados estables

  const obtenerEstadisticas = () => {
    const total = solicitudesFiltradas.length;
    const pendientes = solicitudesFiltradas.filter(s => s.estado === EstadoSolicitud.PENDIENTE).length;
    const aprobadas = solicitudesFiltradas.filter(s => s.estado === EstadoSolicitud.APROBADA).length;
    const rechazadas = solicitudesFiltradas.filter(s => s.estado === EstadoSolicitud.RECHAZADA).length;
    const licencias = solicitudesFiltradas.filter(s => s.tipo === TipoSolicitud.LICENCIA).length;
    const permisos = solicitudesFiltradas.filter(s => s.tipo === TipoSolicitud.PERMISO).length;

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
      licencias,
      permisos
    };
  };

  // ===============================
  // CARGA INICIAL MANUAL (sin useEffect)
  // ===============================

  // Los componentes llamarán manualmente a recargarSolicitudes() cuando necesiten cargar datos
  // Esto elimina completamente los problemas de dependencias circulares del useEffect

  // Retornar todas las funciones y estados
  return {
    // Estados de datos
    solicitudes: solicitudesFiltradas,
    solicitudActual,
    
    // Estados de carga
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Estados de error
    error,
    validationErrors,
    
    // Filtros
    filtrosAplicados,
    
    // Funciones de carga
    cargarMisSolicitudes,
    cargarTodasLasSolicitudes,
    recargarSolicitudes,
    obtenerSolicitudPorId,
    
    // Funciones CRUD
    crearSolicitud,
    actualizarSolicitud,
    eliminarSolicitud,
    
    // Funciones de archivos
    descargarArchivo,
    
    // Funciones de filtrado
    aplicarFiltros,
    limpiarFiltros,
    
    // Funciones administrativas
    verificarLicenciasVencidas,
    
    // Funciones de utilidad
    limpiarErrores,
    limpiarSolicitudActual,
    obtenerEstadisticas
  };
}; 