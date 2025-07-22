    "use client"

import type React from "react"
import { useState } from "react"
import { usePatente } from "../../hooks/maquinaria/usePatente"

interface PatenteInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  label?: string
  showHelp?: boolean
}

export const PatenteInput: React.FC<PatenteInputProps> = ({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = "AB-12-34",
  className = "",
  label = "Patente",
  showHelp = true,
}) => {
  const { formatPatente, validatePatente, getErrorMessage } = usePatente()
  const [internalError, setInternalError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatPatente(inputValue)

    // Actualizar valor
    onChange(formattedValue)

    // Validar y mostrar errores
    if (formattedValue) {
      const errorMsg = getErrorMessage(formattedValue)
      setInternalError(errorMsg)
    } else {
      setInternalError(null)
    }
  }

  const handleBlur = () => {
    if (value) {
      const errorMsg = getErrorMessage(value)
      setInternalError(errorMsg)
    }
  }

  const displayError = error || internalError
  const isValid = value ? validatePatente(value) : !required

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <input
        type="text"
        className={`form-control ${displayError ? "is-invalid" : ""} ${isValid && value ? "is-valid" : ""} ${className}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={8} // LL-NN-NN = 8 caracteres con guiones
        style={{
          textTransform: "uppercase",
          fontFamily: "monospace",
          letterSpacing: "1px",
        }}
      />

      {displayError && (
        <div className="invalid-feedback">
          <i className="bi bi-exclamation-circle me-1"></i>
          {displayError}
        </div>
      )}

      {showHelp && !displayError && (
        <div className="form-text">
          <i className="bi bi-info-circle me-1"></i>
          Formato: AB-12-34 o AB-CD-12 (patente chilena)
        </div>
      )}

      {isValid && value && !displayError && (
        <div className="valid-feedback">
          <i className="bi bi-check-circle me-1"></i>
          Patente válida
        </div>
      )}
    </div>
  )
}
