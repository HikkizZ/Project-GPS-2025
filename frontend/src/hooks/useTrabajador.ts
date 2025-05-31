import { useState } from 'react';
import { trabajadorService } from '@/services/trabajador.service';
import { CreateTrabajadorData } from '@/types/trabajador.types';

export const useTrabajador = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const clearError = () => setError('');

  const validateRUT = (rut: string): boolean => {
    // Eliminar puntos y guión
    rut = rut.replace(/\./g, '').replace('-', '');
    
    // Validar largo mínimo
    if (rut.length < 8) return false;
    
    // Obtener dígito verificador
    const dv = rut.slice(-1).toUpperCase();
    const rutNumero = parseInt(rut.slice(0, -1));
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    let numero = rutNumero;
    
    while (numero > 0) {
      suma += (numero % 10) * multiplicador;
      numero = Math.floor(numero / 10);
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dv === dvCalculado;
  };

  const formatRUT = (rut: string): string => {
    // Eliminar caracteres no válidos
    rut = rut.replace(/[^0-9kK]/g, '');
    
    // Si el RUT está vacío, retornar
    if (!rut) return '';
    
    // Separar número y dígito verificador
    const dv = rut.slice(-1);
    const numero = rut.slice(0, -1);
    
    // Formatear número con puntos
    const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return numeroFormateado + '-' + dv;
  };

  const createTrabajador = async (trabajadorData: CreateTrabajadorData) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await trabajadorService.createTrabajador(trabajadorData);
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      return { success: true, trabajador: result.trabajador };
    } catch (error: any) {
      const errorMsg = error.message || 'Error al crear trabajador';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    clearError,
    validateRUT,
    formatRUT,
    createTrabajador
  };
}; 