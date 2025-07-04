/**
 * CONFIGURACIÓN CENTRALIZADA DE API
 * 
 * Este archivo centraliza toda la configuración de comunicación con el backend:
 * - URL base y timeout
 * - Headers estándar
 * - Cliente HTTP centralizado con axios
 * - Manejo centralizado de errores
 * 
 * USO: Importar en todos los servicios para mantener consistencia
 * EJEMPLO: import { apiClient, getAuthHeaders } from '@/config/api.config';
 */

// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

// Headers con autenticación
export const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('auth_token');
  return {
    ...API_CONFIG.HEADERS,
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };
};

// Headers para upload de archivos
export const getFileUploadHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('auth_token');
  return {
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };
};

// Cliente HTTP centralizado con axios
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    });

    // Interceptor para agregar token automáticamente
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Si los datos son FormData, elimina el header 'Content-Type' para que
        // el navegador pueda establecerlo automáticamente con el 'boundary' correcto.
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejo centralizado de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si la respuesta es un blob (descarga de archivo) y falla,
        // no intentes procesar el error como JSON, simplemente recházalo.
        if (error.response?.config?.responseType === 'blob') {
          return Promise.reject(error);
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  // POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  // PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  // Upload de archivos
  async uploadFile<T = any>(url: string, file: File, fieldName: string = 'file', onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const config: AxiosRequestConfig = {
      headers: getFileUploadHeaders(),
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    };

    const response: AxiosResponse<T> = await this.client.post(url, formData, config);
    return response.data;
  }

  // Download de archivos
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      // Verificar si la respuesta es realmente un blob de archivo
      if (response.data instanceof Blob && response.data.size > 0) {
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        throw new Error('El archivo no se pudo descargar correctamente');
      }
    } catch (error: any) {
      console.error('Error en downloadFile:', error);
      // Si es un error 404, mostrar mensaje específico
      if (error.response?.status === 404) {
        throw new Error('Archivo no encontrado en el servidor');
      }
      throw error;
    }
  }

  // Manejo centralizado de errores
  private handleApiError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    if (error.code === 'ECONNABORTED') {
      return new Error('Tiempo de espera agotado. Por favor, intente nuevamente.');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      return new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    if (error.response?.status === 403) {
      return new Error('No tiene permisos para realizar esta acción.');
    }
    if (error.response?.status === 404) {
      return new Error('Recurso no encontrado.');
    }
    if (error.response?.status >= 500) {
      return new Error('Error del servidor. Por favor, intente más tarde.');
    }
    return new Error('Error de conexión con el servidor.');
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Helper para construir URLs completas (mantener compatibilidad)
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper para manejo de errores (mantener compatibilidad)
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Error desconocido en la comunicación con el servidor';
}; 