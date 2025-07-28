import type React from "react"
import { useState, useEffect } from "react"
import {
  Modal,
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap"
import { ArriendoMaquinariaForm } from "../../components/maquinaria/arriendoMaquinariaForm"
import { ArriendoDetalleModal } from "../../components/maquinaria/arriendoDetalleModal"
import { EstadoPagoModal } from "../../components/maquinaria/estadoPagoModal"
import MaquinariaSidebar from "../../components/maquinaria/maquinariaSideBar"
import { useArriendoMaquinaria } from "../../hooks/maquinaria/useArriendoMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import { useAuth } from "../../context"
import { useToast } from "../../components/common/Toast"
import type { CreateArriendoMaquinaria, ArriendoMaquinaria } from "../../types/arriendoMaquinaria.types"

export const ArriendoMaquinariaPage: React.FC = () => {
  const { reportes, loading, error, crearReporte, eliminarReporte, restaurarReporte, refetch } = useArriendoMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState<ArriendoMaquinaria | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showEstadoPagoModal, setShowEstadoPagoModal] = useState(false)

  const isSuperAdmin = user?.role === "SuperAdministrador"

  const [filteredReportes, setFilteredReportes] = useState<ArriendoMaquinaria[]>([])
  const [searchNumeroReporte, setSearchNumeroReporte] = useState("")
  const [selectedPatente, setSelectedPatente] = useState("")
  const [selectedCliente, setSelectedCliente] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)

  const patentesUnicas = [...new Set(reportes.map((r) => r.patente))].sort()
  const clientesUnicos = [...new Set(reportes.map((r) => r.nombreCliente || "Sin cliente"))].sort()

  useEffect(() => {
    let reportesFiltrados = [...reportes]

    if (!includeInactive) {
      reportesFiltrados = reportesFiltrados.filter((r) => r.isActive !== false)
    }

    if (searchNumeroReporte.trim()) {
      reportesFiltrados = reportesFiltrados.filter((reporte) =>
        reporte.numeroReporte.toLowerCase().includes(searchNumeroReporte.toLowerCase()),
      )
    }

    if (selectedPatente) {
      reportesFiltrados = reportesFiltrados.filter((reporte) => reporte.patente === selectedPatente)
    }

    if (selectedCliente) {
      reportesFiltrados = reportesFiltrados.filter((reporte) => {
        const nombreCliente = reporte.nombreCliente || "Sin cliente"
        return nombreCliente === selectedCliente
      })
    }

    setFilteredReportes(reportesFiltrados)
  }, [reportes, searchNumeroReporte, selectedPatente, selectedCliente, includeInactive])

  const handleSubmit = async (data: CreateArriendoMaquinaria) => {
    try {
      await crearReporte(data)
      setShowCreateModal(false)
      showSuccess("Reporte creado", `Reporte ${data.numeroReporte} creado exitosamente`)
      setSearchNumeroReporte("")
      setSelectedPatente("")
      setSelectedCliente("")
    } catch (error) {
      showError("Error al crear reporte", "No se pudo crear el reporte de trabajo")
    }
  }

  const handleVerDetalles = (reporte: ArriendoMaquinaria) => {
    setSelectedReporte(reporte)
    setShowDetalleModal(true)
  }

  const handleEliminarReporte = async (reporte: ArriendoMaquinaria) => {
    if (
      !window.confirm(`¿Está seguro de eliminar el reporte ${reporte.numeroReporte}? Esta acción se puede revertir.`)
    ) {
      return
    }

    try {
      await eliminarReporte(reporte.id)
      showSuccess("Reporte eliminado", `Reporte ${reporte.numeroReporte} eliminado exitosamente`)
    } catch (error) {
      showError("Error al eliminar", "No se pudo eliminar el reporte")
    }
  }

  const handleRestaurarReporte = async (reporte: ArriendoMaquinaria) => {
    if (!window.confirm(`¿Está seguro de restaurar el reporte ${reporte.numeroReporte}?`)) {
      return
    }

    try {
      await restaurarReporte(reporte.id)
      showSuccess("Reporte restaurado", `Reporte ${reporte.numeroReporte} restaurado exitosamente`)
    } catch (error) {
      showError("Error al restaurar", "No se pudo restaurar el reporte")
    }
  }

  const handleClearFilters = () => {
    setSearchNumeroReporte("")
    setSelectedPatente("")
    setSelectedCliente("")
  }

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

  const isReporteActivo = (reporte: ArriendoMaquinaria) => {
    return reporte.isActive !== false
  }

  const handleExportarExcel = async () => {
    try {
      setShowCreateModal(false)

      if (reportes.length === 0) {
        showError("Sin datos", "No hay datos para exportar")
        return
      }

      const datosParaExcel = reportes.map((reporte) => ({
        "Número Reporte": reporte.numeroReporte,
        Patente: reporte.patente,
        "Marca/Modelo": `${reporte.marca} ${reporte.modelo}`,
        Cliente: reporte.nombreCliente || "Sin cliente",
        "RUT Cliente": reporte.rutCliente || "-",
        Obra: reporte.obra,
        "Fecha Trabajo": formatDate(reporte.fechaTrabajo),
        "Km Final": reporte.kmFinal || 0,
        "Valor Servicio": reporte.valorServicio || 0,
        Estado: isReporteActivo(reporte) ? "Activo" : "Inactivo",
        Detalle: reporte.detalle || "-",
      }))

      await exportToExcel(datosParaExcel, "reportes_trabajo_maquinaria", "Reportes")
      showSuccess("Exportación exitosa", "Archivo Excel exportado exitosamente")
    } catch (error) {
      showError("Error al exportar", "No se pudo generar el archivo Excel")
    }
  }

  const hasActiveFilters = searchNumeroReporte.trim() || selectedPatente || selectedCliente
  const reportesActivos = filteredReportes.filter((r) => isReporteActivo(r))
  const reportesInactivos = filteredReportes.filter((r) => !isReporteActivo(r))

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
                      <div className="fs-4 me-3">
                        <i className="bi bi-truck fs-4 me-3"></i>
                      </div>
                      <div>
                        <h3 className="mb-1">Reportes de Trabajo Diario</h3>
                        <p className="mb-0 opacity-75">Registra el trabajo diario realizado por cada maquinaria</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="warning"
                        className="text-dark fw-bold d-flex align-items-center"
                        onClick={() => setShowEstadoPagoModal(true)}
                        style={{ minWidth: "160px" }}
                      >
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Estado de Pago
                      </Button>
                      <Button
                        onClick={handleExportarExcel}
                        disabled={isExporting || reportes.length === 0}
                        className="text-white fw-bold d-flex align-items-center"
                        style={{
                          backgroundColor: "#28a745",
                          borderColor: "#28a745",
                          minWidth: "140px",
                        }}
                      >
                        {isExporting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Exportando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-file-earmark-excel me-2"></i>
                            Exportar Excel
                          </>
                        )}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Nuevo Reporte
                      </Button>
                    </div>
                  </div>
                </Card.Header>
              </Card>

              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-gear me-2"></i>
                      Configuración de Vista
                    </h5>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3 align-items-end">
                    <Col md={3}>
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="switch"
                          id="include-inactive-switch"
                          label="Incluir reportes inactivos"
                          checked={includeInactive}
                          onChange={(e) => setIncludeInactive(e.target.checked)}
                          disabled={loading}
                        />
                      </div>
                    </Col>

                    <Col md={9}>
                      <div className="d-flex gap-2 align-items-center">
                        <span className="text-muted small">📊 Total: {reportes.length} reportes</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-funnel me-2"></i>
                      Filtros de Búsqueda
                    </h5>
                    <div className="d-flex gap-2">
                      {hasActiveFilters && (
                        <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
                          ❌ Limpiar Filtros
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Label>Buscar por Número de Reporte</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Ej: 12345"
                          value={searchNumeroReporte}
                          onChange={(e) => setSearchNumeroReporte(e.target.value)}
                        />
                        {searchNumeroReporte && (
                          <Button variant="outline-secondary" onClick={() => setSearchNumeroReporte("")}>
                            ❌
                          </Button>
                        )}
                      </InputGroup>
                    </Col>

                    <Col md={4}>
                      <Form.Label>Filtrar por Patente</Form.Label>
                      <Form.Select value={selectedPatente} onChange={(e) => setSelectedPatente(e.target.value)}>
                        <option value="">Todas las patentes</option>
                        {patentesUnicas.map((patente) => (
                          <option key={patente} value={patente}>
                            {patente}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col md={4}>
                      <Form.Label>Filtrar por Cliente</Form.Label>
                      <Form.Select value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)}>
                        <option value="">Todos los clientes</option>
                        {clientesUnicos.map((cliente) => (
                          <option key={cliente} value={cliente}>
                            {cliente}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col>
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted">
                          ℹ️ Mostrando {filteredReportes.length} de {reportes.length} reportes
                        </span>
                        {hasActiveFilters && <span className="badge bg-primary">🔍 Filtros activos</span>}
                        {includeInactive && <span className="badge bg-warning text-dark">👁️ Incluyendo inactivos</span>}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {error && (
                <Alert variant="danger" className="mb-3">
                  ⚠️ {error}
                </Alert>
              )}

              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando reportes...</p>
                </div>
              )}

              {!loading && (
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-table me-2"></i>
                        Historial de Reportes
                        {hasActiveFilters && <span className="badge bg-secondary ms-2">Filtrado</span>}
                      </h5>
                      <div className="d-flex gap-2">
                        <Badge bg="success">Activos: {reportesActivos.length}</Badge>
                        {reportesInactivos.length > 0 && (
                          <Badge bg="secondary">Inactivos: {reportesInactivos.length}</Badge>
                        )}
                        <Badge bg="primary">Total: {filteredReportes.length}</Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {filteredReportes.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="fs-1 text-muted mb-3">📄</div>
                        {hasActiveFilters ? (
                          <>
                            <h5 className="text-muted">No se encontraron reportes</h5>
                            <p className="text-muted mb-3">No hay reportes que coincidan con los filtros aplicados</p>
                            <Button variant="outline-primary" onClick={handleClearFilters}>
                              🔍 Limpiar Filtros
                            </Button>
                          </>
                        ) : reportes.length === 0 ? (
                          <>
                            <h5 className="text-muted">No hay reportes registrados</h5>
                            <p className="text-muted mb-0">Comienza registrando tu primer reporte de trabajo diario</p>
                          </>
                        ) : (
                          <>
                            <h5 className="text-muted">No hay reportes para mostrar</h5>
                            <p className="text-muted mb-3">Intenta cambiar los filtros</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Estado</th>
                              <th>N° Reporte</th>
                              <th>Patente</th>
                              <th>Cliente</th>
                              <th>Fecha</th>
                              <th>Obra</th>
                              <th>Km Final</th>
                              <th className="text-end">Valor</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredReportes.map((reporte) => (
                              <tr key={reporte.id} className={!isReporteActivo(reporte) ? "table-secondary" : ""}>
                                <td>
                                  {!isReporteActivo(reporte) ? (
                                    <Badge bg="secondary">
                                      <i className="bi bi-x-circle me-1"></i>
                                      Inactivo
                                    </Badge>
                                  ) : (
                                    <Badge bg="success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Activo
                                    </Badge>
                                  )}
                                </td>
                                <td className="font-monospace fw-bold">{reporte.numeroReporte}</td>
                                <td className="font-monospace fw-bold">{reporte.patente}</td>
                                <td>{reporte.nombreCliente || "Sin cliente"}</td>
                                <td>{formatDate(reporte.fechaTrabajo)}</td>
                                <td className="text-truncate" style={{ maxWidth: "200px" }} title={reporte.obra}>
                                  {reporte.obra}
                                </td>
                                <td className="font-monospace">{reporte.kmFinal?.toLocaleString() || 0} km</td>
                                <td className="text-end font-monospace">{formatCurrency(reporte.valorServicio)}</td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleVerDetalles(reporte)}
                                      title="Ver detalles"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </Button>

                                    {isSuperAdmin && (
                                      <>
                                        {isReporteActivo(reporte) ? (
                                          <Button
                                            variant="outline-danger"
                                            onClick={() => handleEliminarReporte(reporte)}
                                            title="Eliminar reporte (soft delete)"
                                          >
                                            <i className="bi bi-trash"></i>
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outline-success"
                                            onClick={() => handleRestaurarReporte(reporte)}
                                            title="Restaurar reporte"
                                          >
                                            <i className="bi bi-arrow-clockwise"></i>
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
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

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
            border: "none",
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-plus-circle me-2"></i>
            Registrar Nuevo Reporte de Trabajo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <ArriendoMaquinariaForm onSubmit={handleSubmit} loading={loading} />
        </Modal.Body>
      </Modal>

      <ArriendoDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        reporte={selectedReporte}
      />

      <EstadoPagoModal show={showEstadoPagoModal} onHide={() => setShowEstadoPagoModal(false)} />
    </div>
  )
}
