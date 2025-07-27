import React from "react"
import { Card, Form, Row, Col, Button } from "react-bootstrap"

interface Props {
  filters: {
    nombre: string
    stockMin: string
  }
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  hasActiveFilters: boolean
}

const SparePartLocalFilters: React.FC<Props> = ({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0"><i className="bi bi-funnel me-2" />Filtros Locales</h6>
          <small className="text-muted">Filtra los repuestos por nombre y stock mínimo</small>
        </div>
        {hasActiveFilters && (
          <Button variant="outline-secondary" size="sm" onClick={onReset}>
            <i className="bi bi-x-circle me-1" /> Limpiar Filtros
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre del Repuesto</Form.Label>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre"
                name="nombre"
                value={filters.nombre}
                onChange={onFilterChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Stock Mínimo</Form.Label>
              <Form.Control
                type="text"
                name="stockMin"
                min={0}
                placeholder="Cantidad Almacenada"
                value={filters.stockMin}
                onChange={onFilterChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default SparePartLocalFilters
