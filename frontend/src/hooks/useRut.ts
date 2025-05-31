import { useState } from 'react';

export const useRut = () => {
  const formatRUT = (rut: string): string => {
    // Eliminar caracteres no válidos (mantener solo números y k/K)
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

  return {
    formatRUT,
    validateRUT
  };
}; 