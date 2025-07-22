/**
 * Valida un RUT chileno
 * @param rut RUT en formato 12345678-9 o 12345678-K
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validarRutChileno(rut: string): boolean {
  // Limpiar el RUT (remover puntos y espacios)
  const rutLimpio = rut.replace(/[.\s]/g, "").toUpperCase()

  // Verificar formato básico
  const rutRegex = /^[0-9]+-[0-9K]$/
  if (!rutRegex.test(rutLimpio)) {
    return false
  }

  // Separar número y dígito verificador
  const [numero, digitoVerificador] = rutLimpio.split("-")

  // Validar que el número tenga al menos 7 dígitos y máximo 8
  if (numero.length < 7 || numero.length > 8) {
    return false
  }

  // Calcular dígito verificador
  const digitoCalculado = calcularDigitoVerificador(numero)

  return digitoCalculado === digitoVerificador
}

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param numero Número del RUT sin dígito verificador
 * @returns Dígito verificador calculado
 */
function calcularDigitoVerificador(numero: string): string {
  let suma = 0
  let multiplicador = 2

  // Recorrer el número de derecha a izquierda
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += Number.parseInt(numero[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = suma % 11
  const digito = 11 - resto

  if (digito === 11) return "0"
  if (digito === 10) return "K"
  return digito.toString()
}

/**
 * Limpia un RUT removiendo puntos y espacios
 * @param rut RUT con o sin formato
 * @returns RUT limpio en formato 12345678-9
 */
export function limpiarRut(rut: string): string {
  return rut.replace(/[.\s]/g, "").toUpperCase()
}
