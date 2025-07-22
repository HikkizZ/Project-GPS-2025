import type React from "react"
import { Modal, Button, Row, Col } from "react-bootstrap"
import type { VentaMaquinaria } from "../../types/maquinaria.types"

interface VentaDetalleModalProps {
  show: boolean
  onHide: () => void
  venta: VentaMaquinaria | null
}

export const VentaDetalleModal: React.FC<VentaDetalleModalProps> = ({ show, onHide, venta }) => {
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

  const calcularGanancia = (venta: VentaMaquinaria) => {
    if (!venta?.valorVenta || !venta?.valorCompra) return 0
    return venta.valorVenta - venta.valorCompra
  }

  const calcularPorcentajeGanancia = (venta: VentaMaquinaria) => {
    if (!venta?.valorCompra || venta.valorCompra === 0) return 0
    if (!venta?.valorVenta) return 0
    return ((venta.valorVenta - venta.valorCompra) / venta.valorCompra) * 100
  }

  if (!venta) return null

  const ganancia = calcularGanancia(venta)
  const porcentajeGanancia = calcularPorcentajeGanancia(venta)

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          Detalles de la Venta - {venta.patente}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información de la Maquinaria */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-truck me-2"></i>
            Información de la Maquinaria
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Patente:</label>
                <div className="fs-5 text-success font-monospace">{venta.patente}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Fecha de Venta:</label>
                <div>{formatDate(venta.fechaVenta)}</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información del Comprador */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-person me-2"></i>
            Información del Comprador
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <div>
                <label className="fw-bold">Comprador:</label>
                <div>{venta.comprador || "No especificado"}</div>
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
                <div className="fs-5 fw-bold text-danger">{formatCurrency(venta.valorCompra)}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Valor de Venta:</label>
                <div className="fs-5 fw-bold text-success">{formatCurrency(venta.valorVenta)}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Ganancia:</label>
                <div className={`fs-4 fw-bold ${ganancia >= 0 ? "text-success" : "text-danger"}`}>
                  {formatCurrency(ganancia)}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Porcentaje de Ganancia:</label>
                <div className={`fs-4 fw-bold ${ganancia >= 0 ? "text-success" : "text-danger"}`}>
                  {porcentajeGanancia.toFixed(2)}%
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Observaciones */}
        {venta.observaciones && (
          <div className="mb-4">
            <h5>
              <i className="bi bi-chat-text me-2"></i>
              Observaciones
            </h5>
            <Row className="g-3">
              <Col md={12}>
                <div>
                  <div className="bg-light p-3 rounded">{venta.observaciones}</div>
                </div>
              </Col>
            </Row>
          </div>
        )}
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
