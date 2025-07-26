import type React from "react"
import { Row, Col, Button, Card, Form } from "react-bootstrap"

interface ServerFiltersProps {
  filters: {
    rut: string
    email: string
  }
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
}

export const ServerFilters: React.FC<ServerFiltersProps> = ({ filters, onFilterChange, onSubmit, onReset }) => {
  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-light">
        <h6 className="mb-0">
          <i className="bi bi-server me-2"></i>
          Filtros del Servidor
        </h6>
        <small className="text-muted">Estos filtros consultan la base de datos</small>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  name="rut"
                  value={filters.rut}
                  onChange={onFilterChange}
                  placeholder="Buscar por RUT"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="text"
                  name="email"
                  value={filters.email}
                  onChange={onFilterChange}
                  placeholder="Buscar por correo"
                />
              </Form.Group>
            </Col>
            <Col md={12} className="d-flex align-items-end">
              <div className="d-flex gap-2 mb-3">
                <Button variant="primary" type="submit">
                  <i className="bi bi-search me-2"></i>
                  Buscar en Servidor
                </Button>
                <Button variant="outline-secondary" type="button" onClick={onReset}>
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  )
}
