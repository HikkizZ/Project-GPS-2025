import type React from "react"
import { useState, useEffect } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner, Form, InputGroup } from "react-bootstrap"
import { ArriendoMaquinariaForm } from "../../components/maquinaria/arriendoMaquinariaForm"
import { ArriendoDetalleModal } from "../../components/maquinaria/arriendoDetalleModal"
import { EstadoPagoModal } from "../../components/maquinaria/estadoPagoModal"
import MaquinariaSidebar from "../../components/maquinaria/maquinariaSideBar"
import { useArriendoMaquinaria } from "../../hooks/maquinaria/useArriendoMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import type { CreateArriendoMaquinaria, ArriendoMaquinaria } from "../../types/arriendoMaquinaria.types"

export const ArriendoMaquinariaPage: React.FC = () => {
  const { reportes, loading, error, crearReporte, refetch } = useArriendoMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState<ArriendoMaquinaria | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showEstadoPagoModal, setShowEstadoPagoModal] = useState(false)

  // Estados para filtros y búsqueda
  const [filteredReportes, setFilteredReportes] = useState<ArriendoMaquinaria[]>([])
  const [searchNumeroReporte, setSearchNumeroReporte] = useState("")
  const [selectedPatente, setSelectedPatente] = useState("")
  const [selectedCliente, setSelectedCliente] = useState("")

  // Obtener listas únicas para los filtros
  const patentesUnicas = [...new Set(reportes.map((r) => r.patente))].sort()
  const clientesUnicos = [...new Set(reportes.map((r) => r.nombreCliente))].sort()

  // Efecto para filtrar reportes cuando cambian los filtros o la lista de reportes
  useEffect(() => {
    let reportesFiltrados = [...reportes]

    // Filtro por número de reporte
    if (searchNumeroReporte.trim()) {
      reportesFiltrados = reportesFiltrados.filter((reporte) =>
        reporte.numeroReporte.toLowerCase().includes(searchNumeroReporte.toLowerCase()),
      )
    }

    // Filtro por patente
    if (selectedPatente) {
      reportesFiltrados = reportesFiltrados.filter((reporte) => reporte.patente === selectedPatente)
    }

    // Filtro por cliente
    if (selectedCliente) {
      reportesFiltrados = reportesFiltrados.filter((reporte) => reporte.nombreCliente === selectedCliente)
    }

    setFilteredReportes(reportesFiltrados)
  }, [reportes, searchNumeroReporte, selectedPatente, selectedCliente])

  const handleSubmit = async (data: CreateArriendoMaquinaria) => {
    try {
      await crearReporte(data)
      setShowCreateModal(false)
    } catch (error) {
      // El error ya se maneja en el hook
    }
  }

  const handleVerDetalles = (reporte: ArriendoMaquinaria) => {
    setSelectedReporte(reporte)
    setShowDetalleModal(true)
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

  const handleExportarExcel = async () => {
    try {
      // Exportar los reportes filtrados, no todos
      const datosParaExcel = filteredReportes.map((reporte) => ({
        "Número Reporte": reporte.numeroReporte,
        Patente: reporte.patente,
        "Marca/Modelo": `${reporte.marca} ${reporte.modelo}`,
        Cliente: reporte.nombreCliente,
        "RUT Cliente": reporte.rutCliente,
        Obra: reporte.obra,
        "Fecha Trabajo": formatDate(reporte.fechaTrabajo),
        "Km Final": reporte.kmFinal || 0,
        "Valor Servicio": reporte.valorServicio || 0,
        Detalle: reporte.detalle || "-",
      }))

      await exportToExcel(datosParaExcel, "reportes_trabajo_maquinaria", "Reportes")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al generar el archivo Excel")
    }
  }

  // Verifica si hay filtros activos
  const hasActiveFilters = searchNumeroReporte.trim() || selectedPatente || selectedCliente

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <MaquinariaSidebar />

      {/* Contenido principal */}
      <div className="flex-grow-1">
        <Container fluid className="py-4">
          <Row>
            <Col>
              {/* Encabezado de página */}
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-gradient-primary text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-text fs-4 me-3"></i>
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
                        disabled={isExporting || filteredReportes.length === 0}
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

              {/* Panel de filtros y búsqueda */}
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
                          <i className="bi bi-x-circle me-1"></i>
                          Limpiar Filtros
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
                        <InputGroup.Text>
                          <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Ej: 12345"
                          value={searchNumeroReporte}
                          onChange={(e) => setSearchNumeroReporte(e.target.value)}
                        />
                        {searchNumeroReporte && (
                          <Button variant="outline-secondary" onClick={() => setSearchNumeroReporte("")}>
                            <i className="bi bi-x"></i>
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

                  {/* Indicador de resultados */}
                  <Row className="mt-3">
                    <Col>
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Mostrando {filteredReportes.length} de {reportes.length} reportes
                        </span>
                        {hasActiveFilters && (
                          <span className="badge bg-primary">
                            <i className="bi bi-funnel-fill me-1"></i>
                            Filtros activos
                          </span>
                        )}
                      </div>
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

              {/* Loading spinner */}
              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando reportes...</p>
                </div>
              )}

              {/* Tabla de reportes */}
              {!loading && (
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Historial de Reportes
                        {hasActiveFilters && <span className="badge bg-secondary ms-2">Filtrado</span>}
                      </h5>
                      <div>
                        <span className="badge bg-primary">Total: {filteredReportes.length} reportes</span>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {filteredReportes.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-file-text fs-1 text-muted mb-3 d-block"></i>
                        {hasActiveFilters ? (
                          <>
                            <h5 className="text-muted">No se encontraron reportes</h5>
                            <p className="text-muted mb-3">No hay reportes que coincidan con los filtros aplicados</p>
                            <Button variant="outline-primary" onClick={handleClearFilters}>
                              <i className="bi bi-funnel me-2"></i>
                              Limpiar Filtros
                            </Button>
                          </>
                        ) : (
                          <>
                            <h5 className="text-muted">No hay reportes registrados</h5>
                            <p className="text-muted mb-0">Comienza registrando tu primer reporte de trabajo diario</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="table-light">
                            <tr>
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
                              <tr key={reporte.id}>
                                <td className="font-monospace fw-bold">{reporte.numeroReporte}</td>
                                <td className="font-monospace fw-bold">{reporte.patente}</td>
                                <td>{reporte.nombreCliente}</td>
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

      {/* Modal de registro */}
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
            <i className="bi bi-file-text me-2"></i>
            Registrar Nuevo Reporte de Trabajo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <ArriendoMaquinariaForm onSubmit={handleSubmit} loading={loading} />
        </Modal.Body>
      </Modal>

      {/* Modal de detalles */}
      <ArriendoDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        reporte={selectedReporte}
      />

      {/* Modal de Estado de Pago */}
      <EstadoPagoModal show={showEstadoPagoModal} onHide={() => setShowEstadoPagoModal(false)} />
    </div>
  )
}
