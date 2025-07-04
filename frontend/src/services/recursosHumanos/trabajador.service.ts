import { Trabajador, CreateTrabajadorData, UpdateTrabajadorData, TrabajadorSearchQuery, TrabajadorResponse, PaginatedTrabajadores } from '@/types/recursosHumanos/trabajador.types';
import { ApiResponse } from '@/types';
import { apiClient } from '@/config/api.config';

export class TrabajadorService {
  private baseURL = '/trabajadores';

  // Obtener todos los trabajadores o buscar con filtros
  async getTrabajadores(query: TrabajadorSearchQuery = {}): Promise<ApiResponse<Trabajador[]>> {
    const params = new URLSearchParams(query as any).toString();
    const url = params ? `${this.baseURL}?${params}` : this.baseURL;
    const response = await apiClient.get<{ data: Trabajador[]; message: string }>(url);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Trabajadores obtenidos exitosamente',
    };
  }

  // Crear nuevo trabajador
  async createTrabajador(trabajadorData: CreateTrabajadorData): Promise<any> {
    const response = await apiClient.post(`${this.baseURL}/`, trabajadorData);
    return {
      success: true,
      trabajador: response.data,
      message: response.message || 'Trabajador creado exitosamente',
    };
  }

  // Actualizar trabajador
  async updateTrabajador(id: number, trabajadorData: UpdateTrabajadorData): Promise<ApiResponse<Trabajador>> {
    const response = await apiClient.put<{ data: Trabajador; message: string }>(`${this.baseURL}/${id}`, trabajadorData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'Trabajador actualizado exitosamente',
    };
  }

  // Desvincular trabajador
  async desvincularTrabajador(id: number, motivo: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`${this.baseURL}/${id}`, { data: { motivo } });
    return {
      success: true,
      message: response.message || 'Trabajador desvinculado exitosamente',
    };
  }

  // Utilidades estáticas
  static formatRUT(rut: string): string {
    // Eliminar caracteres no válidos
    rut = rut.replace(/[^0-9kK-]/g, '');
    
    // Si el RUT está vacío, retornar
    if (!rut) return '';
    
    // Separar número y dígito verificador
    let numero = rut;
    let dv = '';
    
    if (rut.includes('-')) {
      [numero, dv] = rut.split('-');
    } else {
      dv = numero.slice(-1);
      numero = numero.slice(0, -1);
    }
    
    // Formatear número con puntos
    numero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return numero + '-' + dv;
  }

  static validateRUT(rut: string): boolean {
    // Remover puntos y guiones
    const cleanRut = rut.replace(/[.\-]/g, '');
    
    if (cleanRut.length < 8 || cleanRut.length > 9) return false;
    
    const rutNumber = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toLowerCase();
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutNumber.length - 1; i >= 0; i--) {
      suma += parseInt(rutNumber[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'k' : (11 - resto).toString();
    
    return dv === dvCalculado;
  }

  static formatPhone(phone: string): string {
    // Agregar +56 si no tiene código de país
    if (!phone.startsWith('+')) {
      if (phone.startsWith('9')) {
        return `+56${phone}`;
      }
      return `+56${phone}`;
    }
    return phone;
  }

  static formatFecha(fecha: string | Date): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CL');
  }
}

export const trabajadorService = new TrabajadorService();
export const getAllTrabajadores = () => trabajadorService.getTrabajadores();
export const createTrabajador = (data: CreateTrabajadorData) => trabajadorService.createTrabajador(data);
export const updateTrabajador = (id: number, data: UpdateTrabajadorData) => trabajadorService.updateTrabajador(id, data);
export const deleteTrabajador = (id: number, motivo: string) => trabajadorService.desvincularTrabajador(id, motivo); 