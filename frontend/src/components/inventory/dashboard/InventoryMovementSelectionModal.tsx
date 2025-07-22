"use client"

import type React from "react"
import { Modal, Button, Row, Col } from "react-bootstrap"

interface InventoryMovementSelectionModalProps {
  show: boolean
  onClose: () => void
  onSelectPurchase: () => void
  onSelectSale: () => void
}

export const InventoryMovementSelectionModal: React.FC<InventoryMovementSelectionModalProps> = ({
  show,
  onClose,
  onSelectPurchase,
  onSelectSale,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header className="bg-gradient-primary text-white" closeButton>
        <Modal.Title>
          <i className="bi bi-arrow-left-right me-2"></i>
          Seleccionar Tipo de Movimiento
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="text-center mb-4 text-muted">¿Qué tipo de movimiento de inventario deseas registrar?</p>
        <Row className="justify-content-center g-3">
          <Col md={6}>
            <Button
              variant="success"
              className="w-100 py-4 d-flex flex-column align-items-center justify-content-center inventory-movement-button"
              onClick={onSelectPurchase}
            >
              <i className="bi bi-box-arrow-in-down fs-1 mb-2"></i>
              <span className="fs-5 fw-bold">Comprar Materiales</span>
              <small className="text-white-75">Registrar entrada de stock</small>
            </Button>
          </Col>
          <Col md={6}>
            <Button
              variant="danger"
              className="w-100 py-4 d-flex flex-column align-items-center justify-content-center inventory-movement-button"
              onClick={onSelectSale}
            >
              <i className="bi bi-box-arrow-up fs-1 mb-2"></i>
              <span className="fs-5 fw-bold">Vender Materiales</span>
              <small className="text-white-75">Registrar salida de stock</small>
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}
