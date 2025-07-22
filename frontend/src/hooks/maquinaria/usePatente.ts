import { useState, useCallback } from "react"

export const usePatente = () => {
  const [error, setError] = useState<string | null>(null)

  // Función para formatear patente chilena
  const formatPatente = useCallback((value: string): string => {
    if (!value) return ""

    // Remover espacios, guiones y convertir a mayúsculas
    const cleanValue = value.replace(/[\s-]/g, "").toUpperCase()

    // Validar que solo contenga letras y números
    if (!/^[A-Z0-9]*$/.test(cleanValue)) {
      return value // Retornar valor original si contiene caracteres inválidos
    }

    // Limitar a 6 caracteres máximo
    const limited = cleanValue.slice(0, 6)

    // Aplicar formato según la longitud
    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 4) {
      // LL-NN formato
      return `${limited.slice(0, 2)}-${limited.slice(2)}`
    } else {
      // Determinar si es formato LL-NN-NN o LL-LL-NN
      const firstTwo = limited.slice(0, 2)
      const nextTwo = limited.slice(2, 4)
      const lastTwo = limited.slice(4, 6)

      // Si los primeros 4 caracteres son letras, usar formato LL-LL-NN
      if (/^[A-Z]{4}/.test(limited.slice(0, 4))) {
        return `${firstTwo}-${nextTwo}-${lastTwo}`
      } else {
        // Formato estándar LL-NN-NN
        return `${firstTwo}-${nextTwo}-${lastTwo}`
      }
    }
  }, [])

  // Función para validar patente chilena
  const validatePatente = useCallback((patente: string): boolean => {
    if (!patente) return false

    // Remover guiones para validación
    const cleanPatente = patente.replace(/-/g, "")

    // Validar longitud (debe ser 6 caracteres)
    if (cleanPatente.length !== 6) return false

    // Validar formatos válidos:
    // 1. LL-NN-NN (2 letras, 4 números)
    // 2. LL-LL-NN (4 letras, 2 números) - para vehículos especiales
    const formatoEstandar = /^[A-Z]{2}[0-9]{4}$/.test(cleanPatente)
    const formatoEspecial = /^[A-Z]{4}[0-9]{2}$/.test(cleanPatente)

    return formatoEstandar || formatoEspecial
  }, [])

  // Función para obtener mensaje de error
  const getErrorMessage = useCallback(
    (patente: string): string | null => {
      if (!patente) return "La patente es requerida"

      const cleanPatente = patente.replace(/-/g, "")

      if (cleanPatente.length < 6) {
        return "La patente debe tener 6 caracteres"
      }

      if (cleanPatente.length > 6) {
        return "La patente no puede tener más de 6 caracteres"
      }

      if (!/^[A-Z0-9]*$/.test(cleanPatente)) {
        return "La patente solo puede contener letras y números"
      }

      if (!validatePatente(patente)) {
        return "Formato de patente inválido. Use LL-NN-NN o LL-LL-NN"
      }

      return null
    },
    [validatePatente],
  )

  // Función para limpiar patente (remover formato)
  const cleanPatente = useCallback((patente: string): string => {
    return patente.replace(/[\s-]/g, "").toUpperCase()
  }, [])

  return {
    formatPatente,
    validatePatente,
    getErrorMessage,
    cleanPatente,
    error,
    setError,
  }
}
