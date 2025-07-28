"use client"

import type React from "react"
import { Modal, Button, Row, Col, Badge, Alert } from "react-bootstrap"
import type { Maquinaria } from "../../types/maquinaria.types"
import { maquinariaService } from "../../services/maquinaria/maquinaria.service"

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

  const handleDescargarPadron = async () => {
    if (!maquinaria) return

    // Verificar que la maquinaria tenga padrón
    if (!maquinaria.padronUrl) {
      alert("Esta maquinaria no tiene padrón disponible para descargar")
      return
    }

    try {
      console.log(`Intentando descargar padrón para maquinaria ID: ${maquinaria.id}`)
      await maquinariaService.descargarPadron(maquinaria.id)
    } catch (error) {
      console.error("Error al descargar padrón:", error)
      alert(`Error al descargar el padrón: ${error.message}`)
    }
  }

  if (!maquinaria) return null

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>
          <i className="bi bi-gear-wide-connected me-2"></i>
          Detalles de Maquinaria - {maquinaria.patente}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {maquinaria.padronUrl && (
          <div className="mb-4">
            <h5>
              <i className="bi bi-file-earmark me-2"></i>
              Padrón
            </h5>
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
              <div className="text-primary">
                <i className="bi bi-file-earmark-pdf fs-2"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1">Documento PDF</h6>
                <small className="text-muted">Padrón de maquinaria</small>
              </div>
              <Button variant="primary" onClick={handleDescargarPadron}>
                <i className="bi bi-download me-2"></i>
                Descargar
              </Button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h5>
            <i className="bi bi-info-circle me-2"></i>
            Información Básica
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Patente:</label>
                <div className="fs-5 text-primary font-monospace">{maquinaria.patente}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Estado:</label>
                <div>
                  <Badge bg={getEstadoBadgeColor(maquinaria.estado)} className="fs-6">
                    {getEstadoTexto(maquinaria.estado)}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Grupo:</label>
                <div>
                  <Badge bg="secondary">{getGrupoTexto(maquinaria.grupo)}</Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Marca:</label>
                <div>{maquinaria.marca}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Modelo:</label>
                <div>{maquinaria.modelo}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Año:</label>
                <div>{maquinaria.año}</div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="mb-4">
          <h5>
            <i className="bi bi-cash-coin me-2"></i>
            Información Financiera
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <div>
                <label className="fw-bold">Avalúo Fiscal:</label>
                <div className="fs-5 fw-bold text-dark">{formatCurrency(maquinaria.avaluoFiscal)}</div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="mb-4">
          <h5>
            <i className="bi bi-gear me-2"></i>
            Información Técnica
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <div>
                <label className="fw-bold">Número de Chasis:</label>
                <div className="font-monospace">{maquinaria.numeroChasis}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Kilometraje Actual:</label>
                <div className="fs-5 fw-bold text-dark">{maquinaria.kilometrajeActual?.toLocaleString() || 0} km</div>
              </div>
            </Col>
          </Row>
        </div>

        {maquinaria.compras && maquinaria.compras.filter((compra) => compra.isActive !== false).length > 0 && (
          <div className="mb-4">
            <h5>
              <i className="bi bi-truck me-2"></i>
              Historial de Compras
            </h5>
            {maquinaria.compras
              .filter((compra) => compra.isActive !== false)
              .map((compra, index) => (
                <div key={index} className="bg-light p-3 rounded mb-2">
                  <Row className="g-2">
                    <Col md={6}>
                      <div>
                        <label className="fw-bold">Fecha de Compra:</label>
                        <div>{formatDate(compra.fechaCompra)}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <label className="fw-bold">Valor:</label>
                        <div className="fw-bold text-dark">{formatCurrency(compra.valorCompra)}</div>
                      </div>
                    </Col>
                    {compra.proveedor && (
                      <Col md={12}>
                        <div>
                          <label className="fw-bold">Proveedor:</label>
                          <div>{compra.proveedor}</div>
                        </div>
                      </Col>
                    )}
                    {compra.observaciones && (
                      <Col md={12}>
                        <div>
                          <label className="fw-bold">Observaciones:</label>
                          <div className="text-muted">{compra.observaciones}</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              ))}
          </div>
        )}

        {maquinaria.ventas && maquinaria.ventas.filter((venta) => venta.isActive !== false).length > 0 && (
          <div className="mb-4">
            <h5>
              <i className="bi bi-cash-coin me-2"></i>
              Historial de Ventas
            </h5>
            {maquinaria.ventas
              .filter((venta) => venta.isActive !== false)
              .map((venta, index) => (
                <div key={index} className="bg-light p-3 rounded mb-2">
                  <Row className="g-2">
                    <Col md={6}>
                      <div>
                        <label className="fw-bold">Fecha de Venta:</label>
                        <div>{formatDate(venta.fechaVenta)}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <label className="fw-bold">Valor de Venta:</label>
                        <div className="fw-bold text-success">{formatCurrency(venta.valorVenta)}</div>
                      </div>
                    </Col>
                    {venta.comprador && (
                      <Col md={12}>
                        <div>
                          <label className="fw-bold">Comprador:</label>
                          <div>{venta.comprador}</div>
                        </div>
                      </Col>
                    )}
                    {venta.observaciones && (
                      <Col md={12}>
                        <div>
                          <label className="fw-bold">Observaciones:</label>
                          <div className="text-muted">{venta.observaciones}</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              ))}
          </div>
        )}

        <div className="mb-4">
          <div
            className={`alert ${maquinaria.estado === "disponible" ? "alert-success" : maquinaria.estado === "vendida" ? "alert-secondary" : "alert-primary"}`}
          >
            <div className="d-flex align-items-center">
              <i
                className={`bi ${maquinaria.estado === "disponible" ? "bi-check-circle" : maquinaria.estado === "vendida" ? "bi-x-circle" : "bi-info-circle"} fs-4 me-3`}
              ></i>
              <div>
                <h6 className="mb-1">Estado: {getEstadoTexto(maquinaria.estado)}</h6>
              </div>
            </div>
          </div>
        </div>

        {(!maquinaria.compras || maquinaria.compras.filter((compra) => compra.isActive !== false).length === 0) && (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Esta maquinaria no tiene historial de compras activo registrado
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
