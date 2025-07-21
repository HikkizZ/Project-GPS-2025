"use client"

import type React from "react"
import { Modal, Button, Row, Col, Badge, Alert } from "react-bootstrap"
import type { Maquinaria } from "../../types/maquinaria.types"

interface MaquinariaDetalleModalProps {
  show: boolean
  onHide: () => void
  maquinaria: Maquinaria | null
}

export const MaquinariaDetalleModal: React.FC<MaquinariaDetalleModalProps> = ({ show, onHide, maquinaria }) => {
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

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "Disponible"
      case "en_arriendo":
        return "En Arriendo"
      case "en_mantencion":
        return "En Mantención"
      case "vendida":
        return "Vendida"
      default:
        return estado
    }
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "success"
      case "en_arriendo":
        return "primary"
      case "en_mantencion":
        return "warning"
      case "vendida":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getGrupoTexto = (grupo: string) => {
    return grupo?.replace(/_/g, " ").toUpperCase() || "Sin grupo"
  }

  if (!maquinaria) return null

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-gear-wide-connected me-2"></i>
          Detalles de Maquinaria - {maquinaria.patente}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información Básica */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-info-circle me-2"></i>
            Información Básica
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <label className="fw-bold">Patente:</label>
              <div className="fs-5 text-primary font-monospace">{maquinaria.patente}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Estado:</label>
              <div>
                <Badge bg={getEstadoBadgeColor(maquinaria.estado)} className="fs-6">
                  {getEstadoTexto(maquinaria.estado)}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Grupo:</label>
              <div>
                <Badge bg="secondary">{getGrupoTexto(maquinaria.grupo)}</Badge>
              </div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Marca:</label>
              <div>{maquinaria.marca}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Modelo:</label>
              <div>{maquinaria.modelo}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Año:</label>
              <div>{maquinaria.año}</div>
            </Col>
          </Row>
        </div>

        {/* Información Financiera */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-currency-dollar me-2"></i>
            Información Financiera
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <label className="fw-bold">Avalúo Fiscal:</label>
              <div className="text-info fs-5">{formatCurrency(maquinaria.avaluoFiscal)}</div>
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
              <label className="fw-bold">Número de Chasis:</label>
              <div className="font-monospace">{maquinaria.numeroChasis}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Kilometraje Actual:</label>
              <div className="fs-5 fw-bold text-primary">{maquinaria.kilometrajeActual?.toLocaleString() || 0} km</div>
            </Col>
          </Row>
        </div>

        {/* Historial de Compras */}
        {maquinaria.compras && maquinaria.compras.length > 0 && (
          <div className="mb-4">
            <h5>
              <i className="bi bi-clock-history me-2"></i>
              Historial de Compras
            </h5>
            {maquinaria.compras.map((compra, index) => (
              <div key={index} className="border rounded p-3 mb-2 bg-light">
                <Row className="g-2">
                  <Col md={6}>
                    <small className="fw-bold">Fecha de Compra:</small>
                    <div>{formatDate(compra.fechaCompra)}</div>
                  </Col>
                  <Col md={6}>
                    <small className="fw-bold">Valor:</small>
                    <div>{formatCurrency(compra.valorCompra)}</div>
                  </Col>
                  {compra.proveedor && (
                    <Col md={12}>
                      <small className="fw-bold">Proveedor:</small>
                      <div>{compra.proveedor}</div>
                    </Col>
                  )}
                  {compra.observaciones && (
                    <Col md={12}>
                      <small className="fw-bold">Observaciones:</small>
                      <div className="text-muted">{compra.observaciones}</div>
                    </Col>
                  )}
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* Historial de Ventas */}
        {maquinaria.ventas && maquinaria.ventas.length > 0 && (
          <div className="mb-4">
            <h5>
              <i className="bi bi-cash-coin me-2"></i>
              Historial de Ventas
            </h5>
            {maquinaria.ventas.map((venta, index) => (
              <div key={index} className="border rounded p-3 mb-2 bg-light">
                <Row className="g-2">
                  <Col md={6}>
                    <small className="fw-bold">Fecha de Venta:</small>
                    <div>{formatDate(venta.fechaVenta)}</div>
                  </Col>
                  <Col md={6}>
                    <small className="fw-bold">Valor de Venta:</small>
                    <div className="text-success">{formatCurrency(venta.valorVenta)}</div>
                  </Col>
                  {venta.comprador && (
                    <Col md={12}>
                      <small className="fw-bold">Comprador:</small>
                      <div>{venta.comprador}</div>
                    </Col>
                  )}
                  {venta.observaciones && (
                    <Col md={12}>
                      <small className="fw-bold">Observaciones:</small>
                      <div className="text-muted">{venta.observaciones}</div>
                    </Col>
                  )}
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* Información de Estado */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-activity me-2"></i>
            Estado Actual
          </h5>
          <div className="p-3 border rounded bg-light">
            <Row>
              <Col md={12}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold">Estado actual:</span>
                    <Badge bg={getEstadoBadgeColor(maquinaria.estado)} className="ms-2 fs-6">
                      {getEstadoTexto(maquinaria.estado)}
                    </Badge>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">ID: {maquinaria.id}</small>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Información adicional si no hay compras */}
        {(!maquinaria.compras || maquinaria.compras.length === 0) && (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Esta maquinaria no tiene historial de compras registrado
          </Alert>
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
