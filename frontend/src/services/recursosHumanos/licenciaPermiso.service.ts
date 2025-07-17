import { apiClient } from '@/config/api.config';
import {
  LicenciaPermiso,
  CreateLicenciaPermisoDTO,
  UpdateLicenciaPermisoDTO,
  LicenciaPermisoResponse,
  LicenciasPermisosListResponse,
  LicenciaPermisoFilters,
  CreateLicenciaPermisoForm,
  LicenciaPermisoOperationResult,
  LicenciasPermisosOperationResult
} from '@/types/recursosHumanos/licenciaPermiso.types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Clase principal del servicio
export class LicenciaPermisoService {
  private baseURL = '/licencia-permiso';

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private getMultipartHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`
      // No incluir Content-Type para multipart/form-data, el browser lo maneja automáticamente
    };
  }

  // ===============================
  // MÉTODOS PARA USUARIOS REGULARES
  // ===============================

  /**
   * Crear nueva solicitud de licencia/permiso
   * Incluye subida de archivo para licencias médicas
   */
  async crearSolicitud(solicitudData: CreateLicenciaPermisoForm): Promise<LicenciaPermisoOperationResult> {
    try {
      const formData = new FormData();
      
      // Agregar campos básicos
      formData.append('tipo', solicitudData.tipo);
      formData.append('fechaInicio', solicitudData.fechaInicio);
      formData.append('fechaFin', solicitudData.fechaFin);
      formData.append('motivoSolicitud', solicitudData.motivoSolicitud);

      // Agregar archivo si existe
      if (solicitudData.archivo) {
        formData.append('archivo', solicitudData.archivo);
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        body: formData
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          data: responseData.data
        };
      }

      return {
        success: false,
        error: responseData.message || 'Error al crear solicitud',
        errors: responseData.errors
      };
    } catch (error: any) {
      console.error('Error al crear solicitud:', error);
      return {
        success: false,
        error: error.message || 'Error al crear solicitud'
      };
    }
  }

  /**
   * Obtener solicitudes del usuario actual
   */
  async obtenerMisSolicitudes(): Promise<LicenciasPermisosOperationResult> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}/mis-solicitudes`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          data: responseData.data
        };
      }

      return {
        success: false,
        error: responseData.message || 'Error al obtener solicitudes'
      };
    } catch (error: any) {
      console.error('Error al obtener mis solicitudes:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener solicitudes'
      };
    }
  }

  // ==============================
  // MÉTODOS PARA RRHH/ADMINISTRACIÓN
  // ==============================

  /**
   * Obtener todas las solicitudes (solo RRHH)
   */
  async obtenerTodasLasSolicitudes(): Promise<LicenciasPermisosOperationResult> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          data: responseData.data || []
        };
      }

      return {
        success: false,
        error: responseData.message || 'Error al obtener solicitudes'
      };
    } catch (error: any) {
      console.error('Error al obtener todas las solicitudes:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener solicitudes'
      };
    }
  }

  /**
   * Obtener solicitudes con filtros opcionales (unificado)
   */
  async obtenerSolicitudesConFiltros(filtros: Record<string, any> = {}): Promise<LicenciasPermisosOperationResult> {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros a los query params
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
          queryParams.append(key, filtros[key].toString());
        }
      });

      const queryString = queryParams.toString();
      const url = `${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          data: responseData.data || []
        };
      }

      return {
        success: false,
        error: responseData.message || 'Error al obtener solicitudes'
      };
    } catch (error: any) {
      console.error('Error al obtener solicitudes:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener solicitudes'
      };
    }
  }

  /**
   * Obtener solicitud por ID (usando filtros)
   * @deprecated Use obtenerSolicitudesConFiltros({ id }) instead
   */
  async obtenerSolicitudPorId(id: number): Promise<LicenciaPermisoOperationResult> {
    try {
      const resultado = await this.obtenerSolicitudesConFiltros({ id });
      
      if (resultado.success && resultado.data && resultado.data.length > 0) {
        return {
          success: true,
          data: resultado.data[0] // Retornar el primer (y único) resultado
        };
      }

      return {
        success: false,
        error: 'Solicitud no encontrada'
      };
    } catch (error: any) {
      console.error('Error al obtener solicitud por ID:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener solicitud'
      };
    }
  }

  /**
   * Actualizar solicitud (aprobar/rechazar) - solo RRHH
   */
  async actualizarSolicitud(id: number, updateData: UpdateLicenciaPermisoDTO): Promise<LicenciaPermisoOperationResult> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          data: responseData.data
        };
      }

      return {
        success: false,
        error: responseData.message || 'Error al actualizar solicitud',
        errors: responseData.errors
      };
    } catch (error: any) {
      console.error('Error al actualizar solicitud:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar solicitud'
      };
    }
  }



  // ==============================
  // MÉTODOS DE ARCHIVOS
  // ==============================

  /**
   * Descargar archivo adjunto de una solicitud
   */
  async descargarArchivo(id: number): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}/${id}/archivo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'archivo.pdf';
        
        if (contentDisposition) {
          // Buscar filename= seguido de comillas opcionales y cualquier carácter hasta comillas opcionales o fin de línea
          const filenameMatch = contentDisposition.match(/filename\*?=(?:"([^"]*)"|([^;,\s]*))/);
          if (filenameMatch) {
            filename = filenameMatch[1] || filenameMatch[2] || 'archivo.pdf';
          }
        }

        return {
          success: true,
          blob,
          filename
        };
      }

      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al descargar archivo'
      };
    } catch (error: any) {
      console.error('Error al descargar archivo:', error);
      return {
        success: false,
        error: error.message || 'Error al descargar archivo'
      };
    }
  }

  // ==============================
  // MÉTODOS ADMINISTRATIVOS
  // ==============================

  /**
   * Verificar estados de licencias - solo RRHH
   */
  async verificarEstadosLicencias(): Promise<ApiResponse<{ activadas: number; desactivadas: number }>> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}/verificar-estados`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          message: responseData.message,
          data: responseData.data
        };
      }

      return {
        success: false,
        message: responseData.message || 'Error al verificar estados de licencias'
      };
    } catch (error: any) {
      console.error('Error al verificar estados de licencias:', error);
      return {
        success: false,
        message: error.message || 'Error al verificar estados de licencias'
      };
    }
  }

  // ==============================
  // MÉTODOS DE UTILIDAD
  // ==============================

  /**
   * Formatear fecha para mostrar
   */
  static formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  }

  /**
   * Formatear fecha y hora
   */
  static formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calcular días entre fechas
   */
  static calcularDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1; // +1 para incluir ambos días
  }

  /**
   * Obtener color del badge según estado
   */
  static getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Aprobada': return 'success';
      case 'Rechazada': return 'danger';
      default: return 'secondary';
    }
  }
}

// Instancia singleton del servicio
export const licenciaPermisoService = new LicenciaPermisoService();

// Exportar métodos individuales para facilitar el uso
export const crearSolicitud = (data: CreateLicenciaPermisoForm) => licenciaPermisoService.crearSolicitud(data);
export const obtenerMisSolicitudes = () => licenciaPermisoService.obtenerMisSolicitudes();
export const obtenerTodasLasSolicitudes = () => licenciaPermisoService.obtenerTodasLasSolicitudes();
export const obtenerSolicitudesConFiltros = (filtros: Record<string, any> = {}) => licenciaPermisoService.obtenerSolicitudesConFiltros(filtros);
export const obtenerSolicitudPorId = (id: number) => licenciaPermisoService.obtenerSolicitudPorId(id);
export const actualizarSolicitud = (id: number, data: UpdateLicenciaPermisoDTO) => licenciaPermisoService.actualizarSolicitud(id, data);

export const descargarArchivo = (id: number) => licenciaPermisoService.descargarArchivo(id);
export const verificarLicenciasVencidas = () => licenciaPermisoService.verificarLicenciasVencidas(); 