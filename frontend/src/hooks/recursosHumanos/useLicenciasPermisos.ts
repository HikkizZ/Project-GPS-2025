import { useState, useEffect } from 'react';
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

  // Opciones del hook
  const tipoVista = options.tipoVista ?? 'mis-solicitudes';

  // ===============================
  // FUNCIONES DE CARGA SIMPLES
  // ===============================

  const cargarMisSolicitudes = async () => {
    console.log('🔄 Hook: Cargando MIS solicitudes...');
    setIsLoading(true);
    setError('');
    try {
      const result = await licenciaPermisoService.obtenerMisSolicitudes();
      console.log('📥 Hook: Resultado mis solicitudes:', result);
      if (result.success && result.data) {
        setSolicitudes(result.data);
        console.log('✅ Hook: Mis solicitudes cargadas:', result.data.length);
      } else {
        // Si el error es "No hay solicitudes", tratar como estado vacío normal
        if (result.error && result.error.includes('No hay solicitudes')) {
          setSolicitudes([]);
          console.log('📋 Hook: No hay solicitudes (estado normal)');
        } else {
          setError(result.error || 'Error al cargar solicitudes');
          setSolicitudes([]);
          console.log('❌ Hook: Error real en mis solicitudes:', result.error);
        }
      }
    } catch (error) {
      setError('Error de conexión al cargar solicitudes');
      setSolicitudes([]);
      console.log('💥 Hook: Excepción en mis solicitudes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarTodasLasSolicitudes = async () => {
    console.log('🔄 Hook: Cargando TODAS las solicitudes...');
    setIsLoading(true);
    setError('');
    try {
      const result = await licenciaPermisoService.obtenerTodasLasSolicitudes();
      console.log('📥 Hook: Resultado todas solicitudes:', result);
      if (result.success && result.data) {
        setSolicitudes(result.data);
        console.log('✅ Hook: Todas solicitudes cargadas:', result.data.length);
      } else {
        // Si el error es "No hay solicitudes", tratar como estado vacío normal
        if (result.error && result.error.includes('No hay solicitudes')) {
          setSolicitudes([]);
          console.log('📋 Hook: No hay solicitudes (estado normal)');
        } else {
          setError(result.error || 'Error al cargar solicitudes');
          setSolicitudes([]);
          console.log('❌ Hook: Error real en todas solicitudes:', result.error);
        }
      }
    } catch (error) {
      setError('Error de conexión al cargar solicitudes');
      setSolicitudes([]);
      console.log('💥 Hook: Excepción en todas solicitudes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recargarSolicitudes = async () => {
    if (tipoVista === 'mis-solicitudes') {
      await cargarMisSolicitudes();
    } else {
      await cargarTodasLasSolicitudes();
    }
  };

  // ===============================
  // FUNCIONES CRUD
  // ===============================

  const crearSolicitud = async (solicitudData: CreateLicenciaPermisoForm) => {
    setIsCreating(true);
    setError('');
    setValidationErrors({});
    
    try {
      const result = await licenciaPermisoService.crearSolicitud(solicitudData);
      if (result.success && result.data) {
        await recargarSolicitudes();
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
  };

  const actualizarSolicitud = async (id: number, updateData: UpdateLicenciaPermisoDTO) => {
    setIsUpdating(true);
    setError('');
    setValidationErrors({});

    try {
      const result = await licenciaPermisoService.actualizarSolicitud(id, updateData);
      if (result.success && result.data) {
        await recargarSolicitudes();
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
  };

  const eliminarSolicitud = async (id: number) => {
    setIsDeleting(true);
    setError('');

    try {
      const result = await licenciaPermisoService.eliminarSolicitud(id);
      if (result.success) {
        await recargarSolicitudes();
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
  };

  const obtenerSolicitudPorId = async (id: number) => {
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
  };

  // ===============================
  // OTRAS FUNCIONES
  // ===============================

  const descargarArchivo = async (id: number) => {
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
  };

  const verificarLicenciasVencidas = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await licenciaPermisoService.verificarLicenciasVencidas();
      if (result.success) {
        await recargarSolicitudes();
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
  };

  // ===============================
  // FUNCIONES DE UTILIDAD
  // ===============================

  const aplicarFiltros = (filtros: LicenciaPermisoFilters) => {
    setFiltrosAplicados(filtros);
  };

  const limpiarFiltros = () => {
    setFiltrosAplicados({});
  };

  const limpiarErrores = () => {
    setError('');
    setValidationErrors({});
  };

  const limpiarSolicitudActual = () => {
    setSolicitudActual(null);
  };

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
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

  // Funciones de estadísticas eliminadas - no requeridas

  // SIN useEffect automático - los componentes cargan manualmente

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
    limpiarSolicitudActual
  };
}; 