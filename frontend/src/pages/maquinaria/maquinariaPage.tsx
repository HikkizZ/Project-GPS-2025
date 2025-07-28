import type React from "react"
import { useState } from "react"
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Form } from "react-bootstrap"
import { MaquinariaDetalleModal } from "../../components/maquinaria/maquinariaDetalleModal"
import MaquinariaSidebar from "../../components/maquinaria/maquinariaSideBar"
import { useMaquinaria } from "../../hooks/maquinaria/useMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import { useToast } from "../../components/common/Toast"
import type { Maquinaria } from "../../types/maquinaria.types"

export const MaquinariaPage: React.FC = () => {
  const { maquinarias, loading, error } = useMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const { showSuccess, showError } = useToast()
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<Maquinaria | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)

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

  const maquinariasFiltradas = maquinarias.filter((maquinaria) => {
    return filtroEstado === "todos" || maquinaria.estado === filtroEstado
  })

  const handleExportarExcel = async () => {
    try {
      if (maquinariasFiltradas.length === 0) {
        showError("Sin datos", "No hay datos para exportar")
        return
      }

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
      showSuccess("Exportación exitosa", "Inventario exportado a Excel correctamente")
    } catch (error) {
      showError("Error al exportar", "No se pudo generar el archivo Excel")
    }
  }

  return (
    <div className="d-flex">
      <MaquinariaSidebar />

      <div className="flex-grow-1">
        <Container fluid className="py-4">
          <Row>
            <Col>
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-gradient-primary text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-truck fs-4 me-3"></i>
                      <div>
                        <h3 className="mb-1">Inventario de Maquinaria</h3>
                        <p className="mb-0 opacity-75">Gestiona y controla tu inventario de maquinaria</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        onClick={handleExportarExcel}
                        disabled={isExporting || maquinariasFiltradas.length === 0}
                        className="text-white fw-bold"
                        style={{
                          backgroundColor: "#28a745",
                          borderColor: "#28a745",
                          color: "white",
                        }}
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
                    </div>
                  </div>
                </Card.Header>
              </Card>

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
                  </Row>
                </Card.Body>
              </Card>

              {error && (
                <Alert variant="danger" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando maquinaria...</p>
                </div>
              )}

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
                                <td className="font-monospace text-start">{formatCurrency(maquinaria.avaluoFiscal)}</td>
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
        </Container>
      </div>

      <MaquinariaDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        maquinaria={selectedMaquinaria}
      />
    </div>
  )
}
