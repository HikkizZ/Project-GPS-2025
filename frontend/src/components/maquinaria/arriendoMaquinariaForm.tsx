import type React from "react"
import { useState, useEffect } from "react"
import type { CreateArriendoMaquinaria } from "../../types/arriendoMaquinaria.types"
import { useMaquinaria } from "../../hooks/maquinaria/useMaquinaria"
import { useCustomers } from "../../hooks/stakeholders/useCustomers"
import { useAuth } from "../../context"

interface ArriendoMaquinariaFormProps {
  onSubmit: (data: CreateArriendoMaquinaria) => Promise<void>
  loading?: boolean
  initialData?: Partial<CreateArriendoMaquinaria>
}

export const ArriendoMaquinariaForm: React.FC<ArriendoMaquinariaFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {
  const { maquinarias, loading: maquinariasLoading } = useMaquinaria()
  const { customers, isLoading: customersLoading } = useCustomers()
  const { user } = useAuth()

  const isSuperAdmin = user?.role === "SuperAdministrador"
  const maquinariasDisponibles = maquinarias.filter((m) => m.estado === "disponible")

  const [formData, setFormData] = useState<CreateArriendoMaquinaria & { customerId?: number }>({
    numeroReporte: initialData.numeroReporte || "",
    patente: initialData.patente || "",
    rutCliente: initialData.rutCliente || "",
    nombreCliente: initialData.nombreCliente || "",
    obra: initialData.obra || "",
    detalle: initialData.detalle || "",
    kmFinal: initialData.kmFinal || 0,
    valorServicio: initialData.valorServicio || 0,
    fechaTrabajo: initialData.fechaTrabajo || new Date().toISOString().split("T")[0],
    customerId: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<any>(null)

  useEffect(() => {
    if (formData.patente) {
      const maquinaria = maquinariasDisponibles.find((m) => m.patente === formData.patente)
      if (maquinaria) {
        setSelectedMaquinaria(maquinaria)
        if (formData.kmFinal === 0) {
          setFormData((prev) => ({
            ...prev,
            kmFinal: maquinaria.kilometrajeActual + 50,
          }))
        }
      }
    } else {
      setSelectedMaquinaria(null)
    }
  }, [formData.patente, maquinariasDisponibles])

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

  const generateReportNumber = (): string => {
    const randomNum = Math.floor(Math.random() * 90000) + 10000
    return randomNum.toString()
  }

  const handleGoToClientes = () => {
    window.open("/inventario/clientes", "_blank")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "valorServicio") {
      const numericValue = parseNumber(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else if (name === "kmFinal") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }))
    } else if (name === "numeroReporte") {
      const numericValue = value.replace(/\D/g, "").slice(0, 5)
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else if (name === "customerId") {
      const customerId = value ? Number(value) : undefined
      const selectedCustomer = customers.find((c) => c.id === customerId)

      setFormData((prev) => ({
        ...prev,
        customerId,
        rutCliente: selectedCustomer?.rut || "",
        nombreCliente: selectedCustomer?.name || "",
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.numeroReporte.trim()) {
      newErrors.numeroReporte = "El número de reporte es requerido"
    } else if (formData.numeroReporte.length < 4 || formData.numeroReporte.length > 5) {
      newErrors.numeroReporte = "El número de reporte debe tener entre 4 y 5 dígitos"
    }

    if (!formData.patente) newErrors.patente = "Debe seleccionar una maquinaria"
    if (!formData.customerId) newErrors.customerId = "Debe seleccionar un cliente"
    if (!formData.obra.trim()) newErrors.obra = "La obra es requerida"
    if (!formData.fechaTrabajo) newErrors.fechaTrabajo = "La fecha de trabajo es requerida"
    if (formData.valorServicio <= 0) newErrors.valorServicio = "El valor del servicio debe ser mayor a 0"
    if (formData.kmFinal <= 0) newErrors.kmFinal = "El kilometraje final debe ser mayor a 0"

    if (selectedMaquinaria && formData.kmFinal <= selectedMaquinaria.kilometrajeActual) {
      newErrors.kmFinal = `El kilometraje final debe ser mayor a ${selectedMaquinaria.kilometrajeActual} km (actual)`
    }

    const fechaSeleccionada = new Date(formData.fechaTrabajo)
    const hoy = new Date()
    hoy.setHours(23, 59, 59, 999)
    if (fechaSeleccionada > hoy) {
      newErrors.fechaTrabajo = "La fecha de trabajo no puede ser futura"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const { customerId, ...dataToSubmit } = formData
      const finalData = {
        ...dataToSubmit,
        kmFinal: Number(formData.kmFinal),
        valorServicio: Number(formData.valorServicio),
      }

      await onSubmit(finalData)

      setFormData({
        numeroReporte: "",
        patente: "",
        rutCliente: "",
        nombreCliente: "",
        obra: "",
        detalle: "",
        kmFinal: 0,
        valorServicio: 0,
        fechaTrabajo: new Date().toISOString().split("T")[0],
        customerId: undefined,
      })
      setErrors({})
      setSelectedMaquinaria(null)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al enviar formulario:", error)
      }
    }
  }

  if (maquinariasLoading || customersLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">
          Cargando datos del formulario...
          {maquinariasLoading && " (maquinarias)"}
          {customersLoading && " (clientes)"}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-info-circle me-2"></i>
          Información del Reporte
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              Número de Reporte (4-5 dígitos) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                name="numeroReporte"
                className={`form-control ${errors.numeroReporte ? "is-invalid" : ""}`}
                value={formData.numeroReporte}
                onChange={handleChange}
                placeholder="12345"
                maxLength={5}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setFormData((prev) => ({ ...prev, numeroReporte: generateReportNumber() }))}
                title="Generar número automático"
              >
                🔄
              </button>
              {errors.numeroReporte && <div className="invalid-feedback">{errors.numeroReporte}</div>}
            </div>
            <div className="form-text">
              Formato: solo números (ej: 12345)
              {isSuperAdmin && (
                <div className="text-info mt-1">
                  <i className="bi bi-shield-check me-1"></i>
                  <strong>SuperAdmin:</strong> Puedes reutilizar números de reportes eliminados
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Fecha de Trabajo <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              name="fechaTrabajo"
              className={`form-control ${errors.fechaTrabajo ? "is-invalid" : ""}`}
              value={formData.fechaTrabajo}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.fechaTrabajo && <div className="invalid-feedback">{errors.fechaTrabajo}</div>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-truck me-2"></i>
          Información de la Maquinaria
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">
              Maquinaria (Patente) <span className="text-danger">*</span>
            </label>
            <select
              name="patente"
              className={`form-select ${errors.patente ? "is-invalid" : ""}`}
              value={formData.patente}
              onChange={handleChange}
            >
              <option value="">Seleccione una maquinaria</option>
              {maquinariasDisponibles.map((maquinaria) => (
                <option key={maquinaria.id} value={maquinaria.patente}>
                  {maquinaria.patente} - {maquinaria.marca} {maquinaria.modelo} ({maquinaria.grupo.replace(/_/g, " ")})
                  - {maquinaria.kilometrajeActual} km
                </option>
              ))}
            </select>
            {errors.patente && <div className="invalid-feedback">{errors.patente}</div>}
            {selectedMaquinaria && (
              <div className="form-text">
                <strong>Detalles:</strong> {selectedMaquinaria.marca} {selectedMaquinaria.modelo} - Grupo:{" "}
                {selectedMaquinaria.grupo.replace(/_/g, " ")} - Kilometraje actual:{" "}
                {selectedMaquinaria.kilometrajeActual} km - Estado: {selectedMaquinaria.estado}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Kilometraje Final <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type="number"
                name="kmFinal"
                className={`form-control ${errors.kmFinal ? "is-invalid" : ""}`}
                value={formData.kmFinal || ""}
                onChange={handleChange}
                min={selectedMaquinaria ? selectedMaquinaria.kilometrajeActual + 1 : 1}
                placeholder={selectedMaquinaria ? `Mayor a ${selectedMaquinaria.kilometrajeActual}` : "0"}
              />
              <span className="input-group-text">km</span>
              {errors.kmFinal && <div className="invalid-feedback">{errors.kmFinal}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Valor del Servicio (CLP) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="text"
                name="valorServicio"
                className={`form-control ${errors.valorServicio ? "is-invalid" : ""}`}
                value={formatNumber(formData.valorServicio)}
                onChange={handleChange}
                placeholder="450.000"
                style={{ textAlign: "right" }}
              />
              {errors.valorServicio && <div className="invalid-feedback">{errors.valorServicio}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-person me-2"></i>
          Información del Cliente
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">
              Cliente <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <select
                name="customerId"
                className={`form-select ${errors.customerId ? "is-invalid" : ""}`}
                value={formData.customerId || ""}
                onChange={handleChange}
                disabled={customersLoading}
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.rut}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleGoToClientes}
                title="Ir a gestión de clientes (nueva pestaña)"
                disabled={customersLoading}
              >
                <i className="bi bi-people me-1"></i>
                Agregar Cliente
              </button>
            </div>
            {errors.customerId && <div className="invalid-feedback">{errors.customerId}</div>}
            {customersLoading && <div className="form-text">Cargando clientes...</div>}
            {!customersLoading && customers.length === 0 && (
              <div className="form-text text-warning">
                <i className="bi bi-exclamation-triangle me-1"></i>
                No hay clientes disponibles.{" "}
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-underline"
                  onClick={handleGoToClientes}
                >
                  Crear nuevo cliente
                </button>
              </div>
            )}
            <div className="form-text">
              <i className="bi bi-info-circle me-1"></i>
              Usa el botón "Gestionar" para crear nuevos clientes sin perder este formulario
            </div>
          </div>

          {formData.customerId && formData.nombreCliente && (
            <div className="col-md-12">
              <div className="alert alert-info">
                <h6 className="alert-heading">ℹ️ Cliente Seleccionado</h6>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Nombre:</strong> {formData.nombreCliente}
                  </div>
                  <div className="col-md-6">
                    <strong>RUT:</strong> {formData.rutCliente}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-building me-2"></i>
          Información del Trabajo
        </h5>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">
              Obra/Proyecto <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="obra"
              className={`form-control ${errors.obra ? "is-invalid" : ""}`}
              value={formData.obra}
              onChange={handleChange}
              placeholder="Construcción Edificio Central"
              maxLength={500}
            />
            {errors.obra && <div className="invalid-feedback">{errors.obra}</div>}
          </div>

          <div className="col-md-12">
            <label className="form-label">Observaciones/Detalle del Trabajo</label>
            <textarea
              name="detalle"
              className="form-control"
              value={formData.detalle}
              onChange={handleChange}
              rows={3}
              placeholder="Excavación de fundaciones, movimiento de tierra, etc..."
              maxLength={1000}
            />
            <div className="form-text">Máximo 1000 caracteres</div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Creando Reporte...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Crear Reporte de Trabajo
            </>
          )}
        </button>
      </div>
    </form>
  )
}
