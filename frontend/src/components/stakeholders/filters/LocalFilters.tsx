import type React from "react"
import { Row, Col, Button, Card, Form } from "react-bootstrap"

interface LocalFiltersProps {
  filters: {
    name: string
    rut: string
    email: string
    address: string
    phone: string
  }
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={filters.name}
                onChange={onFilterChange}
                placeholder="Filtrar por nombre"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={filters.rut}
                onChange={onFilterChange}
                placeholder="Filtrar por RUT"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="text"
                name="email"
                value={filters.email}
                onChange={onFilterChange}
                placeholder="Filtrar por correo"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={filters.address}
                onChange={onFilterChange}
                placeholder="Filtrar por dirección"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={filters.phone}
                onChange={onFilterChange}
                placeholder="Filtrar por teléfono"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
