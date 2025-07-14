"use client"

import type React from "react"
import { useState } from "react"
import type { CreateVentaMaquinaria } from "../../types/maquinaria.types"
import { useMaquinaria } from "../../hooks/maquinaria/useMaquinaria"
import { usePatente } from "../../hooks/maquinaria/usePatente"

interface VentaMaquinariaFormProps {
  onSubmit: (data: CreateVentaMaquinaria) => Promise<void>
  loading?: boolean
  initialData?: Partial<CreateVentaMaquinaria>
}

export const VentaMaquinariaForm: React.FC<VentaMaquinariaFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {
  // Agregar hook para obtener maquinarias disponibles
  const { maquinarias } = useMaquinaria()
  const { formatPatente } = usePatente()

  // Filtrar solo maquinarias disponibles para venta
  const maquinariasDisponibles = maquinarias.filter((m) => m.estado === "disponible")

  const [formData, setFormData] = useState<CreateVentaMaquinaria & { maquinariaId?: number }>({
    patente: initialData.patente || "",
    fechaVenta: initialData.fechaVenta || new Date().toISOString().split("T")[0],
    valorCompra: initialData.valorCompra || 0,
    valorVenta: initialData.valorVenta || 0,
    comprador: initialData.comprador || "",
    observaciones: initialData.observaciones || "",
    maquinariaId: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Función para formatear números con separadores de miles
  const formatNumber = (value: number): string => {
    if (value === 0) return ""
    return value.toLocaleString("es-CL")
  }

  // Función para parsear números desde string formateado
  const parseNumber = (value: string): number => {
    if (!value || value.trim() === "") return 0
    // Remover puntos y espacios, mantener solo números
    const cleanValue = value.replace(/[.\s]/g, "")
    const parsed = Number.parseInt(cleanValue, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "valorVenta") {
      // Para campos monetarios, parsear el valor
      const numericValue = parseNumber(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else {
      // Para campos de texto
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

  const handlePatenteChange = (patente: string) => {
    const maquinariaSeleccionada = maquinariasDisponibles.find((m) => m.patente === patente)

    if (maquinariaSeleccionada) {
      setFormData((prev) => ({
        ...prev,
        patente,
        maquinariaId: maquinariaSeleccionada.id,
        // Buscar el valor de compra desde las compras de esta maquinaria
        valorCompra: maquinariaSeleccionada.compras?.[0]?.valorCompra || 0,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        patente,
        maquinariaId: undefined,
        valorCompra: 0,
      }))
    }

    // Limpiar error del campo
    if (errors.patente) {
      setErrors((prev) => ({ ...prev, patente: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patente.trim()) newErrors.patente = "Debe seleccionar una maquinaria"
    if (!formData.fechaVenta) newErrors.fechaVenta = "La fecha de venta es requerida"
    if (!formData.maquinariaId) newErrors.patente = "Debe seleccionar una maquinaria válida"
    if (formData.valorCompra <= 0) {
      newErrors.valorCompra =
        "No se pudo obtener el valor de compra. Verifique que la maquinaria tenga un registro de compra."
    }
    if (formData.valorVenta < 1000000) {
      newErrors.valorVenta = "El valor de venta debe ser al menos $1.000.000"
    }
    if (formData.valorVenta > 2000000000) {
      newErrors.valorVenta = "El valor de venta no puede exceder $2.000.000.000"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error al enviar formulario:", error)
    }
  }

  const ganancia = formData.valorVenta - formData.valorCompra
  const porcentajeGanancia = formData.valorCompra > 0 ? ((ganancia / formData.valorCompra) * 100).toFixed(2) : "0"

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-info-circle me-2"></i>
          Información de la Venta
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              Patente de la Maquinaria <span className="text-danger">*</span>
            </label>
            <select
              name="patente"
              className={`form-select ${errors.patente ? "is-invalid" : ""}`}
              value={formData.patente}
              onChange={(e) => handlePatenteChange(e.target.value)}
              style={{
                fontFamily: "monospace",
                letterSpacing: "1px",
              }}
            >
              <option value="">Seleccione una maquinaria...</option>
              {maquinariasDisponibles.map((maquinaria) => (
                <option key={maquinaria.id} value={maquinaria.patente}>
                  {formatPatente(maquinaria.patente)} - {maquinaria.marca} {maquinaria.modelo} ({maquinaria.año})
                </option>
              ))}
            </select>
            {errors.patente && <div className="invalid-feedback">{errors.patente}</div>}
            <div className="form-text">Solo se muestran maquinarias disponibles para venta</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Fecha de Venta <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              name="fechaVenta"
              className={`form-control ${errors.fechaVenta ? "is-invalid" : ""}`}
              value={formData.fechaVenta}
              onChange={handleChange}
            />
            {errors.fechaVenta && <div className="invalid-feedback">{errors.fechaVenta}</div>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-currency-dollar me-2"></i>
          Información Financiera
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              Valor de Compra Original (CLP) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="text"
                name="valorCompra"
                className="form-control bg-light"
                value={formatNumber(formData.valorCompra)}
                readOnly
                style={{ textAlign: "right" }}
              />
            </div>
            <div className="form-text">
              {formData.patente
                ? "Valor automático basado en el registro de compra"
                : "Seleccione una maquinaria para ver el valor de compra"}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Valor de Venta (CLP) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="text"
                name="valorVenta"
                className={`form-control ${errors.valorVenta ? "is-invalid" : ""}`}
                value={formatNumber(formData.valorVenta)}
                onChange={handleChange}
                placeholder="95.000.000"
                style={{ textAlign: "right" }}
              />
              {errors.valorVenta && <div className="invalid-feedback">{errors.valorVenta}</div>}
            </div>
            <div className="form-text">Mínimo: $1.000.000 - Máximo: $2.000.000.000</div>
          </div>
        </div>

        {/* Resumen de ganancia */}
        {(formData.valorCompra > 0 || formData.valorVenta > 0) && (
          <div className="ganancia-summary mt-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-calculator me-2"></i>
                  Resumen Financiero
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <span>Ganancia/Pérdida:</span>
                      <span className={`fw-bold ${ganancia >= 0 ? "text-success" : "text-danger"}`}>
                        ${ganancia.toLocaleString("es-CL")} CLP
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <span>Porcentaje:</span>
                      <span className={`fw-bold ${ganancia >= 0 ? "text-success" : "text-danger"}`}>
                        {porcentajeGanancia}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-person me-2"></i>
          Información del Comprador
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">Comprador</label>
            <input
              type="text"
              name="comprador"
              className="form-control"
              value={formData.comprador}
              onChange={handleChange}
              placeholder="Nombre del comprador o empresa"
              maxLength={255}
            />
          </div>

          <div className="col-md-12">
            <label className="form-label">Observaciones</label>
            <textarea
              name="observaciones"
              className="form-control"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Información adicional sobre la venta..."
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Registrando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Registrar Venta
            </>
          )}
        </button>
      </div>
    </form>
  )
}
