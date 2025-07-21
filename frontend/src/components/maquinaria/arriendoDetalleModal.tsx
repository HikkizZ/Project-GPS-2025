"use client"

import type React from "react"
import { Modal, Button, Row, Col } from "react-bootstrap"
import type { ArriendoMaquinaria } from "../../types/arriendoMaquinaria.types"

interface ArriendoDetalleModalProps {
  show: boolean
  onHide: () => void
  reporte: ArriendoMaquinaria | null
}

export const ArriendoDetalleModal: React.FC<ArriendoDetalleModalProps> = ({ show, onHide, reporte }) => {
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

  if (!reporte) return null

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          Detalles del Reporte - {reporte.numeroReporte}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información del Reporte */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-file-text me-2"></i>
            Información del Reporte
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Número de Reporte:</label>
                <div className="fs-5 text-primary font-monospace">{reporte.numeroReporte}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Fecha de Trabajo:</label>
                <div>{formatDate(reporte.fechaTrabajo)}</div>
              </div>
            </Col>
          </Row>
        </div>

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
                <div className="fs-5 text-primary font-monospace">{reporte.patente}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Marca y Modelo:</label>
                <div>
                  {reporte.marca} {reporte.modelo}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Kilometraje Final:</label>
                <div>{reporte.kmFinal?.toLocaleString() || 0} km</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información del Cliente */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-person me-2"></i>
            Información del Cliente
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Nombre:</label>
                <div>{reporte.nombreCliente}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">RUT:</label>
                <div className="font-monospace">{reporte.rutCliente}</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información del Trabajo */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-building me-2"></i>
            Información del Trabajo
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <div>
                <label className="fw-bold">Obra:</label>
                <div>{reporte.obra}</div>
              </div>
            </Col>
            {reporte.detalle && (
              <Col md={12}>
                <div>
                  <label className="fw-bold">Observaciones/Detalle:</label>
                  <div className="bg-light p-2 rounded">{reporte.detalle}</div>
                </div>
              </Col>
            )}
            <Col md={6}>
              <div>
                <label className="fw-bold">Valor del Servicio:</label>
                <div className="fs-4 fw-bold text-success">{formatCurrency(reporte.valorServicio)}</div>
              </div>
            </Col>
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
