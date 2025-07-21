"use client"

import type React from "react"
import { useState } from "react"
import type { CreateClienteMaquinaria } from "../../types/arriendoMaquinaria.types"

interface ClienteMaquinariaFormProps {
  onSubmit: (data: CreateClienteMaquinaria) => Promise<void>
  loading?: boolean
  initialData?: Partial<CreateClienteMaquinaria>
  isEditing?: boolean
}

export const ClienteMaquinariaForm: React.FC<ClienteMaquinariaFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {},
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateClienteMaquinaria>({
    rut: initialData.rut || "",
    nombre: initialData.nombre || "",
    telefono: initialData.telefono || "",
    email: initialData.email || "",
    direccion: initialData.direccion || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Función para formatear RUT chileno
  const formatRut = (rut: string): string => {
    // Remover puntos y guiones
    const cleanRut = rut.replace(/[.-]/g, "").toUpperCase()

    if (cleanRut.length < 2) return cleanRut

    // Separar número y dígito verificador
    const body = cleanRut.slice(0, -1)
    const dv = cleanRut.slice(-1)

    // Formatear con puntos
    let formattedBody = ""
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        formattedBody = "." + formattedBody
      }
      formattedBody = body[i] + formattedBody
    }

    return `${formattedBody}-${dv}`
  }

  // Función para validar RUT chileno
  const validateRut = (rut: string): boolean => {
    const cleanRut = rut.replace(/[.-]/g, "").toUpperCase()

    if (cleanRut.length < 8 || cleanRut.length > 9) return false

    const body = cleanRut.slice(0, -1)
    const dv = cleanRut.slice(-1)

    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number.parseInt(body[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const remainder = sum % 11
    const calculatedDv =
      remainder < 2 ? remainder.toString() : 11 - remainder === 10 ? "K" : (11 - remainder).toString()

    return dv === calculatedDv
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "rut") {
      // Formatear RUT mientras se escribe
      const formattedRut = formatRut(value)
      setFormData((prev) => ({
        ...prev,
        [name]: formattedRut,
      }))
    } else if (name === "telefono") {
      // Solo permitir números y algunos caracteres especiales para teléfono
      const phoneValue = value.replace(/[^0-9+\-\s()]/g, "")
      setFormData((prev) => ({
        ...prev,
        [name]: phoneValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar RUT
    if (!formData.rut.trim()) {
      newErrors.rut = "El RUT es requerido"
    } else if (!validateRut(formData.rut)) {
      newErrors.rut = "El RUT no es válido"
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    } else if (formData.nombre.trim().length > 255) {
      newErrors.nombre = "El nombre no puede exceder 255 caracteres"
    }

    // Validar teléfono (opcional)
    if (formData.telefono && formData.telefono.trim()) {
      const phoneRegex = /^(\+56)?[0-9\s\-()]{8,15}$/
      if (!phoneRegex.test(formData.telefono.trim())) {
        newErrors.telefono = "El teléfono no tiene un formato válido"
      }
    }

    // Validar email (opcional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "El email no tiene un formato válido"
      }
    }

    // Validar dirección (opcional)
    if (formData.direccion && formData.direccion.trim().length > 500) {
      newErrors.direccion = "La dirección no puede exceder 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Limpiar datos antes de enviar
      const cleanData: CreateClienteMaquinaria = {
        rut: formData.rut.trim(),
        nombre: formData.nombre.trim(),
        telefono: formData.telefono?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        direccion: formData.direccion?.trim() || undefined,
      }

      await onSubmit(cleanData)
    } catch (error) {
      console.error("Error al enviar formulario:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-person me-2"></i>
          Información del Cliente
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              RUT <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="rut"
              className={`form-control ${errors.rut ? "is-invalid" : ""}`}
              value={formData.rut}
              onChange={handleChange}
              placeholder="12.345.678-9"
              maxLength={12}
              style={{ fontFamily: "monospace" }}
              disabled={isEditing} // No permitir editar RUT en modo edición
            />
            {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
            <div className="form-text">Formato: 12.345.678-9</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Nombre/Razón Social <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Constructora ABC Ltda."
              maxLength={255}
            />
            {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-telephone me-2"></i>
          Información de Contacto
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              name="telefono"
              className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+56912345678"
              maxLength={15}
            />
            {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
            <div className="form-text">Formato: +56912345678 o 912345678</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="contacto@empresa.cl"
              maxLength={255}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-geo-alt me-2"></i>
          Información Adicional
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">Dirección</label>
            <textarea
              name="direccion"
              className={`form-control ${errors.direccion ? "is-invalid" : ""}`}
              value={formData.direccion}
              onChange={handleChange}
              rows={3}
              placeholder="Av. Principal 123, Santiago, Chile"
              maxLength={500}
            />
            {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
            <div className="form-text">Máximo 500 caracteres</div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {isEditing ? "Actualizando..." : "Creando..."}
            </>
          ) : (
            <>
              <i className={`bi ${isEditing ? "bi-pencil" : "bi-plus-circle"} me-2`}></i>
              {isEditing ? "Actualizar Cliente" : "Crear Cliente"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
