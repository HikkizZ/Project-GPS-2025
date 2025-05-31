import type {
  FichaEmpresa,
  FichaEmpresaSearchParams,
  PaginatedFichasEmpresa,
  CreateFichaEmpresaData,
  UpdateFichaEmpresaData,
  EstadoLaboral
} from '../types/fichaEmpresa';
import axios from 'axios';

const API_BASE_URL = '/api';

// Configurar axios con interceptor para token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface FichaEmpresaQuery {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rut?: string;
  cargo?: string;
  area?: string;
  empresa?: string;
  page?: number;
  limit?: number;
}

export interface FichaEmpresaUpdateData {
  cargo: string;
  area: string;
  empresa?: string;
  tipoContrato: string;
  jornadaLaboral: string;
  sueldoBase: number;
  fechaInicioContrato: string;
  fechaFinContrato?: string;
}

export class FichaEmpresaService {
  // Obtener todas las fichas con paginación y filtros
  async getFichasEmpresa(params: FichaEmpresaSearchParams = {}): Promise<PaginatedFichasEmpresa> {
    const searchParams = new URLSearchParams();
    
    // Agregar parámetros de búsqueda
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await axios.get(`${API_BASE_URL}/ficha-empresa/search?${searchParams}`);
    
    if (response.status !== 200) {
      throw new Error(`Error al obtener fichas: ${response.statusText}`);
    }
    
    return response.data;
  }

  // Obtener ficha por ID
  async getFichaEmpresaById(id: number): Promise<FichaEmpresa> {
    const response = await axios.get(`${API_BASE_URL}/ficha-empresa/${id}`);
    
    if (response.status !== 200) {
      throw new Error(`Error al obtener ficha: ${response.statusText}`);
    }
    
    return response.data.data;
  }

  // Crear nueva ficha
  async createFichaEmpresa(data: CreateFichaEmpresaData): Promise<FichaEmpresa> {
    const response = await axios.post(`${API_BASE_URL}/ficha-empresa`, data);
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.data?.message || 'Error al crear ficha');
    }
    
    return response.data;
  }

  // Actualizar ficha existente
  async updateFichaEmpresa(id: number, data: UpdateFichaEmpresaData): Promise<FichaEmpresa> {
    const response = await axios.put(`${API_BASE_URL}/ficha-empresa/${id}`, data);
    
    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Error al actualizar ficha');
    }
    
    return response.data;
  }

  // Eliminar ficha
  async deleteFichaEmpresa(id: number): Promise<void> {
    const response = await axios.delete(`${API_BASE_URL}/ficha-empresa/${id}`);
    
    if (response.status !== 200) {
      throw new Error('Error al eliminar ficha');
    }
  }

  // Actualizar solo el estado laboral
  async updateEstadoLaboral(id: number, estadoLaboral: EstadoLaboral): Promise<FichaEmpresa> {
    const response = await axios.patch(`${API_BASE_URL}/ficha-empresa/${id}/estado`, { estadoLaboral });
    
    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Error al actualizar estado laboral');
    }
    
    return response.data.data;
  }

  // Obtener fichas por trabajador
  async getFichasByTrabajador(trabajadorId: number): Promise<FichaEmpresa[]> {
    const response = await axios.get(`${API_BASE_URL}/ficha-empresa/trabajador/${trabajadorId}`);
    
    if (response.status !== 200) {
      throw new Error('Error al obtener fichas del trabajador');
    }
    
    return response.data.data || [];
  }

  // Búsqueda por RUT específico
  async getFichaByRUT(rut: string): Promise<FichaEmpresa | null> {
    const result = await this.getFichasEmpresa({ rut, limit: 1 });
    return result.data.length > 0 ? result.data[0] : null;
  }

  // Utilidades para formateo
  static formatSalario(salario: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(salario);
  }

  static formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL');
  }

  static getEstadoLaboralColor(estado: EstadoLaboral): string {
    const colors = {
      [EstadoLaboral.ACTIVO]: 'success',
      [EstadoLaboral.LICENCIA]: 'warning', 
      [EstadoLaboral.PERMISO]: 'info',
      [EstadoLaboral.DESVINCULADO]: 'danger',
    };
    return colors[estado] || 'secondary';
  }

  static getEstadoLaboralIcon(estado: EstadoLaboral): string {
    const icons = {
      [EstadoLaboral.ACTIVO]: 'bi-person-check',
      [EstadoLaboral.LICENCIA]: 'bi-person-exclamation',
      [EstadoLaboral.PERMISO]: 'bi-person-dash',
      [EstadoLaboral.DESVINCULADO]: 'bi-person-x',
    };
    return icons[estado] || 'bi-person';
  }

  // Función para búsqueda de fichas
  async searchFichasEmpresa(query: FichaEmpresaQuery): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/ficha-empresa/search?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching fichas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al buscar fichas'
      };
    }
  }

  // Función para obtener mi ficha (del usuario logueado)
  async getMiFicha(): Promise<ApiResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ficha-empresa/mi-ficha`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting mi ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener tu ficha'
      };
    }
  }

  // Función para actualizar una ficha
  async updateFichaEmpresaData(id: number, data: FichaEmpresaUpdateData): Promise<ApiResponse> {
    try {
      // Asegurarse de que no se envíe la fecha de inicio
      const { fechaInicioContrato, ...updateData } = data;
      
      const response = await axios.put(`${API_BASE_URL}/ficha-empresa/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar la ficha'
      };
    }
  }

  // Función para subir contrato PDF
  async uploadContrato(fichaId: number, file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('contrato', file);

      const response = await axios.post(
        `${API_BASE_URL}/ficha-empresa/${fichaId}/upload-contrato`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error uploading contract:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al subir el contrato'
      };
    }
  }

  // Función para descargar contrato PDF
  async downloadContrato(fichaId: number): Promise<void> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/ficha-empresa/${fichaId}/contrato`,
        {
          responseType: 'blob',
        }
      );

      // Crear URL del blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo de las headers si está disponible
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'contrato.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading contract:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar el contrato');
    }
  }

  // Función para eliminar contrato PDF
  async deleteContrato(fichaId: number): Promise<ApiResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/ficha-empresa/${fichaId}/delete-contrato`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar el contrato'
      };
    }
  }
}

export const fichaEmpresaService = new FichaEmpresaService();
export default fichaEmpresaService;

// Funciones independientes para manejo de archivos
export const getFichaEmpresa = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ficha-empresa/${id}`);
    if (response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: null
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'No se pudo cargar la información del trabajador'
      };
    }
  } catch (error: any) {
    console.error('Error getting ficha:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al obtener la ficha'
    };
  }
};

export const updateFichaEmpresa = async (id: number, data: FichaEmpresaUpdateData): Promise<ApiResponse> => {
  try {
    // Asegurarse de que no se envíe la fecha de inicio
    const { fechaInicioContrato, ...updateData } = data;
    
    const response = await axios.put(`${API_BASE_URL}/ficha-empresa/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating ficha:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar la ficha'
    };
  }
};

export const uploadContrato = async (fichaId: number, file: File): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('contrato', file);

    const response = await axios.post(
      `${API_BASE_URL}/ficha-empresa/${fichaId}/upload-contrato`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error uploading contract:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al subir el contrato'
    };
  }
};

export const downloadContrato = async (fichaId: number): Promise<void> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/ficha-empresa/${fichaId}/contrato`,
      {
        responseType: 'blob',
      }
    );

    // Crear URL del blob y descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo de las headers si está disponible
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'contrato.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error downloading contract:', error);
    throw new Error(error.response?.data?.message || 'Error al descargar el contrato');
  }
};

export const deleteContrato = async (fichaId: number): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/ficha-empresa/${fichaId}/delete-contrato`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting contract:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar el contrato'
    };
  }
}; 