import type {
  Trabajador,
  CreateTrabajadorData,
  UpdateTrabajadorData,
  TrabajadorSearchParams
} from '../types/trabajador';

const API_BASE_URL = '/api';

// Función helper para obtener headers con autenticación
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export class TrabajadorService {
  // Crear nuevo trabajador
  async createTrabajador(data: CreateTrabajadorData): Promise<Trabajador> {
    const response = await fetch(`${API_BASE_URL}/trabajador`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear trabajador');
    }
    
    const result = await response.json();
    return result.data;
  }

  // Obtener todos los trabajadores
  async getTrabajadores(): Promise<Trabajador[]> {
    const response = await fetch(`${API_BASE_URL}/trabajador/all`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener trabajadores: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
  }

  // Buscar trabajadores con filtros
  async searchTrabajadores(params: TrabajadorSearchParams = {}): Promise<Trabajador[]> {
    const searchParams = new URLSearchParams();
    
    // Agregar parámetros de búsqueda
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/trabajador/detail?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al buscar trabajadores: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
  }

  // Obtener trabajador por ID
  async getTrabajadorById(id: number): Promise<Trabajador> {
    const response = await fetch(`${API_BASE_URL}/trabajador/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener trabajador: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }

  // Actualizar trabajador
  async updateTrabajador(id: number, data: UpdateTrabajadorData): Promise<Trabajador> {
    const response = await fetch(`${API_BASE_URL}/trabajador/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar trabajador');
    }
    
    const result = await response.json();
    return result.data;
  }

  // Eliminar (desactivar) trabajador
  async deleteTrabajador(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trabajador/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar trabajador');
    }
  }

  // Buscar por RUT específico
  async getTrabajadorByRUT(rut: string): Promise<Trabajador | null> {
    try {
      const result = await this.searchTrabajadores({ rut });
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error al buscar por RUT:', error);
      return null;
    }
  }

  // Utilidades para formateo
  static formatRUT(rut: string): string {
    // Remover puntos y guiones existentes
    const cleanRut = rut.replace(/[.\-]/g, '');
    
    if (cleanRut.length < 2) return rut;
    
    // Separar dígito verificador
    const rutNumber = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    
    // Formatear con puntos
    const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedNumber}-${dv}`;
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
export default trabajadorService; 