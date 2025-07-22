"use client"

import type React from "react"
import { Row, Col, Button, Card, Form } from "react-bootstrap"
import { ProductType } from "@/types/inventory/product.types" // Importar ProductType

interface LocalFiltersProps {
  filters: {
    product: string
    salePrice: string
  }
  // Aceptar HTMLTextAreaElement también, ya que FormControlElement lo incluye
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const LocalFilters: React.FC<LocalFiltersProps> = ({ filters, onFilterChange, onReset, hasActiveFilters }) => {
  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0">
              <i className="bi bi-funnel me-2"></i>
              Filtros Locales
            </h6>
            <small className="text-muted">Filtrado rápido en tiempo real</small>
          </div>
          {hasActiveFilters && (
            <Button variant="outline-secondary" size="sm" onClick={onReset}>
              <i className="bi bi-x-circle me-1"></i>
              Limpiar Filtros
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Producto</Form.Label>
              <Form.Control
                as="select" // Cambiado a select para el enum
                name="product"
                value={filters.product}
                onChange={onFilterChange}
              >
                <option value="">Todos los tipos</option>
                {Object.values(ProductType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Precio de Venta</Form.Label>
              <Form.Control
                type="text"
                name="salePrice"
                value={filters.salePrice}
                onChange={onFilterChange}
                placeholder="Filtrar por precio"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
