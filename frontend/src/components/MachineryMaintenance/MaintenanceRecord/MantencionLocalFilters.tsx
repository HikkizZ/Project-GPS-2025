import React from "react"
import { Card, Form, Row, Col, Button } from "react-bootstrap"
import type { Maquinaria } from "@/types/maquinaria.types"
import type { Trabajador } from "@/types/recursosHumanos/trabajador.types"
import { GrupoMaquinaria } from "@/types/maquinaria.types"
import { EstadoMantencion } from "@/types/machinaryMaintenance/maintenanceRecord.types"

interface Props {
  filters: {
    estado: string
    grupo: string
    patente: string
    mecanicoId: string
  }
  maquinarias: Maquinaria[]
  mecanicos: Trabajador[]
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onReset: () => void
  hasActiveFilters: boolean
}

const MantencionLocalFilters: React.FC<Props> = ({
  filters,
  maquinarias,
  mecanicos,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  const uniquePatentes = [...new Set(maquinarias.map((m) => m.patente))]

  const formatEnumText = (text: string) =>
    text
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0"><i className="bi bi-funnel me-2" />Filtros Locales</h6>
          <small className="text-muted">Filtra las mantenciones registradas</small>
        </div>
        {hasActiveFilters && (
          <Button variant="outline-secondary" size="sm" onClick={onReset}>
            <i className="bi bi-x-circle me-1" /> Limpiar Filtros
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Estado</Form.Label>
              <Form.Select name="estado" value={filters.estado} onChange={onFilterChange}>
                <option value="">Todos</option>
                <option value={EstadoMantencion.PENDIENTE}>Pendiente</option>
                <option value={EstadoMantencion.EN_PROCESO}>En Proceso</option>
                <option value={EstadoMantencion.COMPLETADA}>Completada</option>
                <option value={EstadoMantencion.IRRECUPERABLE}>Irrecuperable</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Grupo de Maquinaria</Form.Label>
              <Form.Select name="grupo" value={filters.grupo} onChange={onFilterChange}>
                <option value="">Todos</option>
                {Object.values(GrupoMaquinaria).map((grupo) => (
                  <option key={grupo} value={grupo}>{formatEnumText(grupo)}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Patente</Form.Label>
              <Form.Select name="patente" value={filters.patente} onChange={onFilterChange}>
                <option value="">Todas</option>
                {uniquePatentes.map((patente) => (
                  <option key={patente} value={patente}>{patente}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Mecánico</Form.Label>
              <Form.Select name="mecanicoId" value={filters.mecanicoId} onChange={onFilterChange}>
                <option value="">Todos</option>
                {mecanicos.map((mec) => (
                  <option key={mec.id} value={mec.id}>
                    {mec.nombres} {mec.apellidoPaterno} {mec.apellidoMaterno}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default MantencionLocalFilters
