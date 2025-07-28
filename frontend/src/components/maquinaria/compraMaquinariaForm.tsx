"use client"

import type React from "react"
import { useState } from "react"
import { GrupoMaquinaria, type CreateCompraMaquinaria } from "../../types/maquinaria.types"
import { PatenteInput } from "../common/PatenteInput"
import { useSuppliers } from "../../hooks/stakeholders/useSuppliers"

interface CompraMaquinariaFormProps {
  onSubmit: (data: CreateCompraMaquinaria, file?: File) => Promise<void>
  loading?: boolean
  initialData?: Partial<CreateCompraMaquinaria>
}

export const CompraMaquinariaForm: React.FC<CompraMaquinariaFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {
  const { suppliers, isLoading: loadingSuppliers } = useSuppliers()

  const [formData, setFormData] = useState<CreateCompraMaquinaria>({
    patente: initialData.patente || "",
    grupo: initialData.grupo || GrupoMaquinaria.ESCAVADORA,
    marca: initialData.marca || "",
    modelo: initialData.modelo || "",
    anio: initialData.anio || new Date().getFullYear(),
    fechaCompra: initialData.fechaCompra || new Date().toISOString().split("T")[0],
    valorCompra: initialData.valorCompra || 0,
    avaluoFiscal: initialData.avaluoFiscal || 0,
    numeroChasis: initialData.numeroChasis || "",
    kilometrajeInicial: initialData.kilometrajeInicial || 0,
    supplierId: initialData.supplierId || undefined,
    observaciones: initialData.observaciones || "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatNumber = (value: number): string => {
    if (value === 0) return ""
    return value.toLocaleString("es-CL")
  }

  const parseNumber = (value: string): number => {
    if (!value || value.trim() === "") return 0
    const cleanValue = value.replace(/[.\s]/g, "")
    const parsed = Number.parseInt(cleanValue, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleGoToProveedores = () => {
    window.open("/inventario/proveedores", "_blank")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "valorCompra" || name === "avaluoFiscal") {
      const numericValue = parseNumber(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else if (name === "anio" || name === "kilometrajeInicial") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }))
    } else if (name === "supplierId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, padron: "Solo se permiten archivos PDF" }))
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, padron: "El archivo no puede ser mayor a 10MB" }))
        return
      }

      setSelectedFile(file)
      setErrors((prev) => ({ ...prev, padron: "" }))
    }
  }

  const handlePatenteChange = (patente: string) => {
    setFormData((prev) => ({ ...prev, patente }))

    if (errors.patente) {
      setErrors((prev) => ({ ...prev, patente: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patente.trim()) newErrors.patente = "La patente es requerida"
    if (!formData.marca.trim()) newErrors.marca = "La marca es requerida"
    if (!formData.modelo.trim()) newErrors.modelo = "El modelo es requerido"
    if (!formData.numeroChasis.trim()) newErrors.numeroChasis = "El número de chasis es requerido"
    if (formData.anio < 1900 || formData.anio > new Date().getFullYear() + 1) {
      newErrors.anio = "El año debe ser válido"
    }
    if (formData.valorCompra < 1000000) {
      newErrors.valorCompra = "El valor de compra debe ser al menos $1.000.000"
    }
    if (formData.valorCompra > 2000000000) {
      newErrors.valorCompra = "El valor de compra no puede exceder $2.000.000.000"
    }
    if (formData.avaluoFiscal < 1000000) {
      newErrors.avaluoFiscal = "El avalúo fiscal debe ser al menos $1.000.000"
    }
    if (formData.avaluoFiscal > 2000000000) {
      newErrors.avaluoFiscal = "El avalúo fiscal no puede exceder $2.000.000.000"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit(formData, selectedFile || undefined)
    } catch (error) {
      console.error("Error al enviar formulario:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-info-circle me-2"></i>
          Información Básica
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <PatenteInput
              value={formData.patente}
              onChange={handlePatenteChange}
              error={errors.patente}
              required
              placeholder="AB-12-34"
              label="Patente"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Grupo de Maquinaria <span className="text-danger">*</span>
            </label>
            <select name="grupo" className="form-select" value={formData.grupo} onChange={handleChange}>
              {Object.values(GrupoMaquinaria).map((grupo) => (
                <option key={grupo} value={grupo}>
                  {grupo.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Marca <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="marca"
              className={`form-control ${errors.marca ? "is-invalid" : ""}`}
              value={formData.marca}
              onChange={handleChange}
              placeholder="CAT, Volvo, etc."
              maxLength={100}
            />
            {errors.marca && <div className="invalid-feedback">{errors.marca}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Modelo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="modelo"
              className={`form-control ${errors.modelo ? "is-invalid" : ""}`}
              value={formData.modelo}
              onChange={handleChange}
              placeholder="320D, EC210, etc."
              maxLength={100}
            />
            {errors.modelo && <div className="invalid-feedback">{errors.modelo}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Año <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              name="anio"
              className={`form-control ${errors.anio ? "is-invalid" : ""}`}
              value={formData.anio}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 1}
            />
            {errors.anio && <div className="invalid-feedback">{errors.anio}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Fecha de Compra <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              name="fechaCompra"
              className="form-control"
              value={formData.fechaCompra}
              onChange={handleChange}
            />
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
              Valor de Compra (CLP) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="text"
                name="valorCompra"
                className={`form-control ${errors.valorCompra ? "is-invalid" : ""}`}
                value={formatNumber(formData.valorCompra)}
                onChange={handleChange}
                placeholder="85.000.000"
                style={{ textAlign: "right" }}
              />
              {errors.valorCompra && <div className="invalid-feedback">{errors.valorCompra}</div>}
            </div>
            <div className="form-text">Mínimo: $1.000.000 - Máximo: $2.000.000.000</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Avalúo Fiscal (CLP) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="text"
                name="avaluoFiscal"
                className={`form-control ${errors.avaluoFiscal ? "is-invalid" : ""}`}
                value={formatNumber(formData.avaluoFiscal)}
                onChange={handleChange}
                placeholder="80.000.000"
                style={{ textAlign: "right" }}
              />
              {errors.avaluoFiscal && <div className="invalid-feedback">{errors.avaluoFiscal}</div>}
            </div>
            <div className="form-text">Mínimo: $1.000.000 - Máximo: $2.000.000.000</div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-gear me-2"></i>
          Información Técnica
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">
              Número de Chasis <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="numeroChasis"
              className={`form-control ${errors.numeroChasis ? "is-invalid" : ""}`}
              value={formData.numeroChasis}
              onChange={handleChange}
              placeholder="CAT320D2020001"
              maxLength={100}
            />
            {errors.numeroChasis && <div className="invalid-feedback">{errors.numeroChasis}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Kilometraje Inicial</label>
            <div className="input-group">
              <input
                type="number"
                name="kilometrajeInicial"
                className="form-control"
                value={formData.kilometrajeInicial || ""}
                onChange={handleChange}
                min="0"
                max="999999"
                placeholder="0"
              />
              <span className="input-group-text">km</span>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Padrón (PDF)</label>
            <input
              type="file"
              name="padron"
              className={`form-control ${errors.padron ? "is-invalid" : ""}`}
              onChange={handleFileChange}
              accept=".pdf"
            />
            {errors.padron && <div className="invalid-feedback">{errors.padron}</div>}
            <div className="form-text">Solo archivos PDF. Tamaño máximo: 10MB</div>
            {selectedFile && (
              <div className="mt-2">
                <small className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Archivo seleccionado: {selectedFile.name}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-building me-2"></i>
          Información Adicional
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">Proveedor</label>
            <div className="input-group">
              <select
                name="supplierId"
                className={`form-select ${errors.supplierId ? "is-invalid" : ""}`}
                value={formData.supplierId || ""}
                onChange={handleChange}
                disabled={loadingSuppliers}
              >
                <option value="">Seleccionar proveedor (opcional)</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} - {supplier.rut}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleGoToProveedores}
                title="Ir a gestión de proveedores"
                disabled={loadingSuppliers}
              >
                <i className="bi bi-people me-1"></i>
                Agregar Proveedor
              </button>
            </div>
            {errors.supplierId && <div className="invalid-feedback">{errors.supplierId}</div>}
            {loadingSuppliers && <div className="form-text">Cargando proveedores...</div>}
            {!loadingSuppliers && suppliers.length === 0 && (
              <div className="form-text text-warning">
                No hay proveedores disponibles.{" "}
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-underline"
                  onClick={handleGoToProveedores}
                >
                  Crear nuevo proveedor
                </button>
              </div>
            )}
          </div>

          <div className="col-md-12">
            <label className="form-label">Observaciones</label>
            <textarea
              name="observaciones"
              className="form-control"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Información adicional sobre la compra..."
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Registrar Compra
            </>
          )}
        </button>
      </div>
    </form>
  )
}
