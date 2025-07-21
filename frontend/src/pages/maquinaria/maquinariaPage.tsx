"use client"

import type React from "react"
import { useState } from "react"
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Form } from "react-bootstrap"
import { MaquinariaDetalleModal } from "../../components/maquinaria/maquinariaDetalleModal"
import { useMaquinaria } from "../../hooks/maquinaria/useMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import type { Maquinaria } from "../../types/maquinaria.types"
import { useNavigate } from "react-router-dom"

export const MaquinariaPage: React.FC = () => {
  const { maquinarias, loading, error } = useMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<Maquinaria | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const navigate = useNavigate()

  const formatCurrency = (value: number | undefined | null) => {
    if (!value || value === 0) return "$0"
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value)
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

  const handleVerDetalles = (maquinaria: Maquinaria) => {
    setSelectedMaquinaria(maquinaria)
    setShowDetalleModal(true)
  }

  // Filtrar maquinarias
  const maquinariasFiltradas = maquinarias.filter((maquinaria) => {
    return filtroEstado === "todos" || maquinaria.estado === filtroEstado
  })

  const handleExportarExcel = async () => {
    try {
      const datosParaExcel = maquinariasFiltradas.map((maquinaria) => ({
        Patente: maquinaria.patente,
        Marca: maquinaria.marca,
        Modelo: maquinaria.modelo,
        Año: maquinaria.año,
        Estado: getEstadoTexto(maquinaria.estado),
        Kilometraje: maquinaria.kilometrajeActual || 0,
        "Avalúo Fiscal": maquinaria.avaluoFiscal || 0,
      }))

      await exportToExcel(datosParaExcel, "inventario_maquinaria", "Inventario Maquinaria")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al generar el archivo Excel")
    }
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-gear-wide-connected me-2"></i>
                Inventario de Maquinaria
              </h2>
              <p className="text-muted mb-0">Gestiona el inventario de maquinaria</p>
            </div>
          </div>

          {/* Navegación a módulos */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="py-4">
              <div className="text-center mb-3">
                <h5 className="mb-2">Módulos de Maquinaria</h5>
              </div>
              <div className="d-flex justify-content-center gap-4">
                <Button
                  variant="info"
                  size="lg"
                  onClick={() => navigate("/maquinaria/arriendos")}
                  className="px-4 py-3"
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  Arriendos
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/maquinaria/compras")}
                  className="px-4 py-3"
                >
                  <i className="bi bi-truck me-2"></i>
                  Compras
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => navigate("/maquinaria/ventas")}
                  className="px-4 py-3"
                >
                  <i className="bi bi-cash-coin me-2"></i>
                  Ventas
                </Button>
                <Button
                  variant="warning"
                  size="lg"
                  onClick={() => navigate("/maquinaria/clientes")}
                  className="px-4 py-3"
                >
                  <i className="bi bi-people me-2"></i>
                  Clientes
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Filtros */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Row className="align-items-end">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Filtrar por Estado</Form.Label>
                    <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                      <option value="todos">Todos los estados</option>
                      <option value="disponible">Disponible</option>
                      <option value="en_arriendo">En Arriendo</option>
                      <option value="en_mantencion">En Mantención</option>
                      <option value="vendida">Vendida</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Button
                    variant="success"
                    onClick={handleExportarExcel}
                    disabled={isExporting || maquinariasFiltradas.length === 0}
                  >
                    {isExporting ? (
                      <>
                        <i className="bi bi-file-earmark-excel me-2"></i>
                        Exportando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-file-earmark-excel me-2"></i>
                        Exportar Excel
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Mensajes de error */}
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando maquinaria...</p>
            </div>
          )}

          {/* Tabla */}
          {!loading && !error && (
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Inventario ({maquinariasFiltradas.length} de {maquinarias.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {maquinariasFiltradas.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-gear-wide-connected fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">No hay maquinaria que mostrar</h5>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Patente</th>
                          <th>Marca/Modelo</th>
                          <th>Año</th>
                          <th>Estado</th>
                          <th>Kilometraje</th>
                          <th>Avalúo Fiscal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maquinariasFiltradas.map((maquinaria) => (
                          <tr key={maquinaria.id}>
                            <td className="font-monospace fw-bold">{maquinaria.patente}</td>
                            <td>
                              <div>
                                <div className="fw-semibold">{maquinaria.marca}</div>
                                <small className="text-muted">{maquinaria.modelo}</small>
                              </div>
                            </td>
                            <td>{maquinaria.año}</td>
                            <td>
                              <span className={`badge bg-${getEstadoBadgeColor(maquinaria.estado)}`}>
                                {getEstadoTexto(maquinaria.estado)}
                              </span>
                            </td>
                            <td className="font-monospace">
                              {maquinaria.kilometrajeActual?.toLocaleString("es-CL") || "0"} km
                            </td>
                            <td className="font-monospace text-end">{formatCurrency(maquinaria.avaluoFiscal)}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleVerDetalles(maquinaria)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de detalles */}
      <MaquinariaDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        maquinaria={selectedMaquinaria}
      />
    </Container>
  )
}
