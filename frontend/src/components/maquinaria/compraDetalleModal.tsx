import type React from "react"
import { Modal, Button, Row, Col, Badge, Alert } from "react-bootstrap"
import type { CompraMaquinaria } from "../../types/maquinaria.types"
import "../../styles/components/CompraDetalleModal.css"

interface CompraDetalleModalProps {
  show: boolean
  onHide: () => void
  compra: CompraMaquinaria | null
  onEliminarPadron?: (id: number) => Promise<void>
}

export const CompraDetalleModal: React.FC<CompraDetalleModalProps> = ({ show, onHide, compra, onEliminarPadron }) => {
  // Función helper para determinar si una compra está activa
  const isCompraActiva = (compra: CompraMaquinaria) => {
    return compra.isActive !== false
  }

  const formatCurrency = (value: number | undefined | null) => {
    if (!value || value === 0) return "$0"
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("es-CL")
    } catch (error) {
      return "-"
    }
  }

  const formatFileSize = (bytes: number | undefined | null) => {
    if (!bytes) return "-"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleEliminarPadron = async () => {
    if (!compra || !onEliminarPadron) return

    if (window.confirm("¿Está seguro de eliminar el padrón? Esta acción no se puede deshacer.")) {
      try {
        await onEliminarPadron(compra.id)
      } catch (error) {
        console.error("Error al eliminar padrón:", error)
        alert("Error al eliminar el padrón")
      }
    }
  }

  if (!compra) return null

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="compra-detalle-modal">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          Detalles de Compra - {compra.patente}
          {/* Mostrar estado en el título */}
          <div className="mt-1">
            {!isCompraActiva(compra) ? (
              <Badge bg="secondary">
                <i className="bi bi-x-circle me-1"></i>
                Compra Inactiva
              </Badge>
            ) : (
              <Badge bg="success">
                <i className="bi bi-check-circle me-1"></i>
                Compra Activa
              </Badge>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Alerta para compras inactivas */}
        {!isCompraActiva(compra) && (
          <Alert variant="warning" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Compra Inactiva:</strong> Esta compra ha sido eliminada (soft delete) y no está activa en el
            sistema.
          </Alert>
        )}

        {/* Padrón - Sección Principal */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-file-earmark me-2"></i>
            Padrón
          </h5>
          {compra.padronUrl ? (
            <div className="padron-preview">
              <div>
                <img
                  src={compra.padronUrl || "/placeholder.svg"}
                  alt="Padrón"
                  className="padron-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const errorDiv = target.nextElementSibling as HTMLElement
                    if (errorDiv) errorDiv.classList.remove("d-none")
                  }}
                />
                <Alert variant="danger" className="d-none">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error al cargar la imagen. URL: {compra.padronUrl}
                </Alert>
                <div className="mt-2">
                  <small className="text-muted">
                    {compra.padronOriginalName || "Archivo"} • {formatFileSize(compra.padronFileSize)}
                  </small>
                </div>
              </div>
              {/* Botón para eliminar padrón - solo si la compra está activa */}
              {onEliminarPadron && isCompraActiva(compra) && (
                <div className="mt-3">
                  <Button variant="outline-danger" size="sm" onClick={handleEliminarPadron}>
                    <i className="bi bi-trash me-2"></i>
                    Eliminar Padrón
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-padron-alert">
              <div className="no-padron-icon">
                <i className="bi bi-info-circle"></i>
              </div>
              <p className="mb-0">No hay padrón asociado a esta compra</p>
            </div>
          )}
        </div>

        {/* Información Básica */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-info-circle me-2"></i>
            Información Básica
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Patente:</label>
                <div className="fs-5 text-primary font-monospace">{compra.patente}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Grupo:</label>
                <div>
                  <Badge bg="secondary">{compra.grupo?.replace(/_/g, " ") || "Sin grupo"}</Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Marca:</label>
                <div>{compra.marca}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Modelo:</label>
                <div>{compra.modelo}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Año:</label>
                <div>{compra.anio}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Fecha de Compra:</label>
                <div>{formatDate(compra.fechaCompra)}</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información Financiera */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-cash-coin me-2"></i>
            Información Financiera
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Valor de Compra:</label>
                <div className="fs-5 fw-bold text-success">{formatCurrency(compra.valorCompra)}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Avalúo Fiscal:</label>
                <div className="fs-5 fw-bold text-info">{formatCurrency(compra.avaluoFiscal)}</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información Técnica */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-gear me-2"></i>
            Información Técnica
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <div>
                <label className="fw-bold">Número de Chasis:</label>
                <div className="font-monospace">{compra.numeroChasis}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Kilometraje Inicial:</label>
                <div>{compra.kilometrajeInicial?.toLocaleString() || 0} km</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información Adicional */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-building me-2"></i>
            Información Adicional
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <div>
                <label className="fw-bold">Proveedor:</label>
                {compra.supplier ? (
                  <div className="mt-2">
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="info">
                        <i className="bi bi-building me-1"></i>
                        {compra.supplier.name}
                      </Badge>
                      <small className="text-muted">RUT: {compra.supplier.rut}</small>
                    </div>
                    <div className="mt-1">
                      <small className="text-muted">
                        <i className="bi bi-envelope me-1"></i>
                        {compra.supplier.email}
                      </small>
                      <span className="mx-2">•</span>
                      <small className="text-muted">
                        <i className="bi bi-telephone me-1"></i>
                        {compra.supplier.phone}
                      </small>
                    </div>
                    <div className="mt-1">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {compra.supplier.address}
                      </small>
                    </div>
                  </div>
                ) : compra.proveedor ? (
                  <div className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    {compra.proveedor} (registro legacy)
                  </div>
                ) : (
                  <div className="text-muted">No especificado</div>
                )}
              </div>
            </Col>
            {compra.observaciones && (
              <Col md={12}>
                <div>
                  <label className="fw-bold">Observaciones:</label>
                  <div className="bg-light p-3 rounded">{compra.observaciones}</div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <i className="bi bi-x-circle me-2"></i>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
