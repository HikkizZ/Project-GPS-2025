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

/**
 * Formatea el tipo de bono para mostrar con la primera letra en mayúscula
 * @param tipoBono - Valor de tipo de bono del backend (en minúscula)
 * @returns Valor formateado con primera letra en mayúscula
 */
export const formatTipoBono = (tipoBono: string | null | undefined): string => {
  if (!tipoBono) return '-';
  
  // Capitalizar la primera letra
  return tipoBono.charAt(0).toUpperCase() + tipoBono.slice(1);
};

/**
 * Formatea la temporalidad para mostrar con la primera letra en mayúscula
 * @param temporalidad - Valor de temporalidad del backend (en minúscula)
 * @returns Valor formateado con primera letra en mayúscula
 */
export const formatTemporalidad = (temporalidad: string | null | undefined): string => {
  if (!temporalidad) return '-';
  
  // Capitalizar la primera letra
  return temporalidad.charAt(0).toUpperCase() + temporalidad.slice(1);
};

/**
 * Formatea el monto para mostrar con símbolo de peso y separadores de miles
 * @param monto - Valor del monto (string o number)
 * @returns Valor formateado con $ y separadores de miles
 */
export const formatMonto = (monto: string | number | null | undefined): string => {
  if (!monto) return '-';
  
  // Convertir a string si es number
  const montoStr = monto.toString();
  
  // Convertir a número y formatear
  const numero = parseFloat(montoStr);
  if (isNaN(numero)) return montoStr;
  
  return `$${numero.toLocaleString('es-CL')}`;
}; 