/**
 * Formatea el valor de AFP para mostrar con la primera letra en mayúscula
 * @param afp - Valor de AFP del backend (en minúscula)
 * @returns Valor formateado con primera letra en mayúscula
 */
export const formatAFP = (afp: string | null | undefined): string => {
  if (!afp) return '-';
  
  // Capitalizar la primera letra
  return afp.charAt(0).toUpperCase() + afp.slice(1);
}; 