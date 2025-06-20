import { useState } from 'react';

// Hook para manejar RUT
export const useRut = () => {
  const formatRUT = (rut: string): string => {
    // Eliminar todo lo que no sea número, 'k' o 'K'
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length === 0) return '';
    
    // Separar dígito verificador
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    // Aplicar formato: XX.XXX.XXX-X
    if (cuerpo.length <= 3) {
      return cuerpo + (dv ? '-' + dv : '');
    } else if (cuerpo.length <= 6) {
      return cuerpo.slice(0, -3) + '.' + cuerpo.slice(-3) + (dv ? '-' + dv : '');
    } else {
      return cuerpo.slice(0, -6) + '.' + cuerpo.slice(-6, -3) + '.' + cuerpo.slice(-3) + (dv ? '-' + dv : '');
    }
  };

  const validateRUT = (rut: string): boolean => {
    // Limpiar el RUT
    rut = rut.replace(/\./g, '').replace('-', '');
    
    if (rut.length < 8 || rut.length > 9) return false;
    
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    
    // Calcular dígito verificador usando el algoritmo oficial chileno
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
    }
    
    const resto = suma % 11;
    const resultado = 11 - resto;
    
    let dvCalculado: string;
    if (resultado === 11) {
      dvCalculado = '0';
    } else if (resultado === 10) {
      dvCalculado = 'K';
    } else {
      dvCalculado = resultado.toString();
    }
    
    return dv === dvCalculado;
  };

  return { formatRUT, validateRUT };
};

// Hook para manejar teléfonos
export const usePhone = () => {
  const formatPhone = (phone: string): string => {
    // Eliminar todo lo que no sea número o símbolo +
    let cleaned = phone.replace(/[^0-9+]/g, '');
    
    // Si está vacío, retornar vacío
    if (cleaned.length === 0) return '';
    
    // Si solo tiene números (sin +), agregarlo automáticamente al inicio
    if (/^\d/.test(cleaned)) {
      cleaned = '+' + cleaned;
    }
    
    // Asegurar que solo haya un + al inicio
    cleaned = cleaned.replace(/\++/g, '+');
    if (cleaned.indexOf('+') > 0) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    
    // Limitar a 13 caracteres (+ + 12 dígitos máximo)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  const validatePhone = (phone: string): boolean => {
    // Remover el símbolo + para validar solo números
    const numbers = phone.replace(/\+/g, '');
    
    // Debe tener entre 9 y 12 dígitos numéricos
    return /^\d{9,12}$/.test(numbers);
  };

  return { formatPhone, validatePhone };
}; 