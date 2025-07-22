import type React from "react"
import { useState, useEffect } from "react"
import type { CreateArriendoMaquinaria } from "../../types/arriendoMaquinaria.types"
import { useMaquinaria } from "../../hooks/maquinaria/useMaquinaria"
import { arriendoMaquinariaService } from "../../services/maquinaria/arriendoMaquinaria.service"
import type { ClienteMaquinaria } from "../../types/arriendoMaquinaria.types"

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
  // Usar el mismo hook que funciona en ventas
  const { maquinarias, loading: maquinariasLoading } = useMaquinaria()

  // Estado para clientes
  const [clientes, setClientes] = useState<ClienteMaquinaria[]>([])
  const [clientesLoading, setClientesLoading] = useState(false)

  // Filtrar solo maquinarias disponibles
  const maquinariasDisponibles = maquinarias.filter((m) => m.estado === "disponible")

  const [formData, setFormData] = useState<CreateArriendoMaquinaria>({
    numeroReporte: initialData.numeroReporte || "",
    patente: initialData.patente || "",
    rutCliente: initialData.rutCliente || "",
    nombreCliente: initialData.nombreCliente || "",
    obra: initialData.obra || "",
    detalle: initialData.detalle || "",
    kmFinal: initialData.kmFinal || 0,
    valorServicio: initialData.valorServicio || 0,
    fechaTrabajo: initialData.fechaTrabajo || new Date().toISOString().split("T")[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<any>(null)

  // Cargar clientes al montar el componente y cuando se abre el modal
  const fetchClientes = async () => {
    console.log("🔄 Form: Iniciando fetchClientes...")
    setClientesLoading(true)
    try {
      const response = await arriendoMaquinariaService.obtenerClientesMaquinaria()
      console.log("📊 Form: Respuesta completa:", response)

      if (response.success && response.data) {
        console.log("✅ Form: Clientes cargados:", response.data.length)
        console.log("📋 Form: Lista de clientes:", response.data)
        setClientes(response.data)
      } else {
        console.error("❌ Form: Error en respuesta:", response.message)
      }
    } catch (error) {
      console.error("💥 Form: Error al cargar clientes:", error)
    } finally {
      setClientesLoading(false)
    }
  }

  useEffect(() => {
    console.log("🚀 Form: useEffect para cargar clientes...")
    fetchClientes()
  }, [])

  // Debug logs
  useEffect(() => {
    console.log("🎯 Form: Estado del formulario:", {
      maquinarias: maquinariasDisponibles.length,
      clientes: clientes.length,
      maquinariasLoading,
      clientesLoading,
    })
  }, [maquinariasDisponibles.length, clientes.length, maquinariasLoading, clientesLoading])

  // Actualizar datos cuando se selecciona una maquinaria
  useEffect(() => {
    if (formData.patente) {
      const maquinaria = maquinariasDisponibles.find((m) => m.patente === formData.patente)
      if (maquinaria) {
        setSelectedMaquinaria(maquinaria)
        // Sugerir kilometraje final basado en el actual + 50km
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

  // Actualizar datos cuando se selecciona un cliente
  useEffect(() => {
    if (formData.rutCliente) {
      const cliente = clientes.find((c) => c.rut === formData.rutCliente)
      if (cliente) {
        console.log("🔍 Form: Cliente seleccionado:", cliente)
        setFormData((prev) => ({
          ...prev,
          nombreCliente: cliente.nombre,
        }))
      }
    }
  }, [formData.rutCliente, clientes])

  // Función para formatear números con separadores de miles
  const formatNumber = (value: number): string => {
    if (value === 0) return ""
    return value.toLocaleString("es-CL")
  }

  // Función para parsear números desde string formateado
  const parseNumber = (value: string): number => {
    if (!value || value.trim() === "") return 0
    const cleanValue = value.replace(/[.\s]/g, "")
    const parsed = Number.parseInt(cleanValue, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  // Función para generar número de reporte automático
  const generateReportNumber = (): string => {
    const randomNum = Math.floor(Math.random() * 90000) + 10000 // Genera número entre 10000-99999
    return randomNum.toString()
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
      // Solo permitir números para el número de reporte
      const numericValue = value.replace(/\D/g, "").slice(0, 5)
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
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

    if (!formData.numeroReporte.trim()) {
      newErrors.numeroReporte = "El número de reporte es requerido"
    } else if (formData.numeroReporte.length < 4 || formData.numeroReporte.length > 5) {
      newErrors.numeroReporte = "El número de reporte debe tener entre 4 y 5 dígitos"
    }

    if (!formData.patente) newErrors.patente = "Debe seleccionar una maquinaria"
    if (!formData.rutCliente) newErrors.rutCliente = "Debe seleccionar un cliente"
    if (!formData.nombreCliente.trim()) newErrors.nombreCliente = "El nombre del cliente es requerido"
    if (!formData.obra.trim()) newErrors.obra = "La obra es requerida"
    if (!formData.fechaTrabajo) newErrors.fechaTrabajo = "La fecha de trabajo es requerida"
    if (formData.valorServicio <= 0) newErrors.valorServicio = "El valor del servicio debe ser mayor a 0"
    if (formData.kmFinal <= 0) newErrors.kmFinal = "El kilometraje final debe ser mayor a 0"

    // Validar kilometraje final vs actual
    if (selectedMaquinaria && formData.kmFinal <= selectedMaquinaria.kilometrajeActual) {
      newErrors.kmFinal = `El kilometraje final debe ser mayor a ${selectedMaquinaria.kilometrajeActual} km (actual)`
    }

    // Validar que la fecha no sea futura
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
      // Asegurarse de que los datos numéricos sean números
      const dataToSubmit = {
        ...formData,
        kmFinal: Number(formData.kmFinal),
        valorServicio: Number(formData.valorServicio),
      }

      console.log("📤 Form: Enviando datos validados:", JSON.stringify(dataToSubmit, null, 2))
      await onSubmit(dataToSubmit)
    } catch (error) {
      console.error("💥 Form: Error al enviar formulario:", error)
    }
  }

  // Función para recargar clientes (útil si se agrega un cliente nuevo)
  const handleRefreshClientes = () => {
    console.log("🔄 Form: Recargando clientes...")
    fetchClientes()
  }

  if (maquinariasLoading || clientesLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">
          Cargando datos del formulario...
          {maquinariasLoading && " (maquinarias)"}
          {clientesLoading && " (clientes)"}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Debug info - TEMPORAL */}
      <div className="alert alert-info mb-3">
        <strong>Debug:</strong> Maquinarias: {maquinariasDisponibles.length} | Clientes: {clientes.length} | Loading: M=
        {maquinariasLoading.toString()} C={clientesLoading.toString()}
      </div>

      <div className="form-section">
        <h5 className="section-title">
          <i className="bi bi-file-text me-2"></i>
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
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              {errors.numeroReporte && <div className="invalid-feedback">{errors.numeroReporte}</div>}
            </div>
            <div className="form-text">Formato: solo números (ej: 12345)</div>
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
          <div className="col-md-6">
            <label className="form-label">
              Cliente <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <select
                name="rutCliente"
                className={`form-select ${errors.rutCliente ? "is-invalid" : ""}`}
                value={formData.rutCliente}
                onChange={handleChange}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.rut}>
                    {cliente.nombre} - {cliente.rut}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleRefreshClientes}
                title="Actualizar lista de clientes"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              {errors.rutCliente && <div className="invalid-feedback">{errors.rutCliente}</div>}
            </div>
            <div className="form-text">
              Si no encuentras el cliente, puedes{" "}
              <a href="/maquinaria/clientes" target="_blank" rel="noopener noreferrer">
                agregarlo aquí
              </a>{" "}
              y luego actualizar la lista.
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Nombre del Cliente <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="nombreCliente"
              className={`form-control ${errors.nombreCliente ? "is-invalid" : ""}`}
              value={formData.nombreCliente}
              onChange={handleChange}
              placeholder="Se completa automáticamente"
              readOnly={!!formData.rutCliente}
            />
            {errors.nombreCliente && <div className="invalid-feedback">{errors.nombreCliente}</div>}
          </div>
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
