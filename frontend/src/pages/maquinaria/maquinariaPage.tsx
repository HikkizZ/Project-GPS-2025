"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner, Badge, Form } from "react-bootstrap"
import { useMaquinaria } from "../../hooks/maquinaria/useMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import type { Maquinaria } from "../../types/maquinaria.types"
import { useNavigate } from "react-router-dom"

export const MaquinariaPage: React.FC = () => {
  const { maquinarias, loading, error, actualizarKilometraje, cambiarEstado } = useMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroGrupo, setFiltroGrupo] = useState<string>("todos")
  const [showKilometrajeModal, setShowKilometrajeModal] = useState(false)
  const [maquinariaSeleccionada, setMaquinariaSeleccionada] = useState<Maquinaria | null>(null)
  const [nuevoKilometraje, setNuevoKilometraje] = useState<number>(0)
  const navigate = useNavigate()

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

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "success"
      case "en_arriendo":
        return "primary"
      case "en_mantencion":
        return "warning"
      case "vendida":
        return "secondary"
      case "fuera_de_servicio":
        return "danger"
      default:
        return "secondary"
    }
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
      case "fuera_de_servicio":
        return "Fuera de Servicio"
      default:
        return estado
    }
  }

  const handleActualizarKilometraje = async () => {
    if (!maquinariaSeleccionada) return

    try {
      await actualizarKilometraje(maquinariaSeleccionada.id, nuevoKilometraje)
      setShowKilometrajeModal(false)
      setMaquinariaSeleccionada(null)
      setNuevoKilometraje(0)
    } catch (error) {
      console.error("Error al actualizar kilometraje:", error)
    }
  }

  const handleCambiarEstado = async (maquinaria: Maquinaria, nuevoEstado: string) => {
    if (window.confirm(`¿Está seguro de cambiar el estado a "${getEstadoTexto(nuevoEstado)}"?`)) {
      try {
        await cambiarEstado(maquinaria.id, nuevoEstado)
      } catch (error) {
        console.error("Error al cambiar estado:", error)
      }
    }
  }

  const abrirModalKilometraje = (maquinaria: Maquinaria) => {
    setMaquinariaSeleccionada(maquinaria)
    setNuevoKilometraje(maquinaria.kilometrajeActual || 0)
    setShowKilometrajeModal(true)
  }

  // Filtrar maquinarias
  const maquinariasFiltradas = maquinarias.filter((maquinaria) => {
    const cumpleFiltroEstado = filtroEstado === "todos" || maquinaria.estado === filtroEstado
    const cumpleFiltroGrupo = filtroGrupo === "todos" || maquinaria.grupo === filtroGrupo
    return cumpleFiltroEstado && cumpleFiltroGrupo
  })

  // Función para exportar maquinarias filtradas
  const handleExportarExcel = async () => {
    try {
      // Preparar datos para Excel
      const datosParaExcel = maquinariasFiltradas.map((maquinaria) => ({
        Patente: maquinaria.patente,
        Marca: maquinaria.marca,
        Modelo: maquinaria.modelo,
        Grupo: maquinaria.grupo?.replace(/_/g, " ") || "Sin grupo",
        Año: maquinaria.año,
        Estado: getEstadoTexto(maquinaria.estado),
        Kilometraje: maquinaria.kilometrajeActual || 0,
        "Avalúo Fiscal": maquinaria.avaluoFiscal || 0,
        "Fecha Registro": formatDate(maquinaria.createdAt),
      }))

      // Determinar nombre del archivo según filtros
      let nombreArchivo = "inventario_maquinaria"
      if (filtroEstado !== "todos") {
        nombreArchivo += `_${filtroEstado}`
      }
      if (filtroGrupo !== "todos") {
        nombreArchivo += `_${filtroGrupo.replace(/_/g, "_")}`
      }

      await exportToExcel(datosParaExcel, nombreArchivo, "Inventario Maquinaria")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al generar el archivo Excel")
    }
  }

  // Estadísticas
  const estadisticas = {
    total: maquinarias.length,
    disponible: maquinarias.filter((m) => m.estado === "disponible").length,
    enArriendo: maquinarias.filter((m) => m.estado === "en_arriendo").length,
    enMantencion: maquinarias.filter((m) => m.estado === "en_mantencion").length,
    vendida: maquinarias.filter((m) => m.estado === "vendida").length,
    fueraServicio: maquinarias.filter((m) => m.estado === "fuera_de_servicio").length,
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header con navegación */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <Button variant="outline-secondary" onClick={() => navigate("/dashboard")} className="me-3">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Dashboard
              </Button>
              <div>
                <h2 className="mb-1">
                  <i className="bi bi-gear-wide-connected me-2"></i>
                  Inventario de Maquinaria
                </h2>
                <p className="text-muted mb-0">Gestiona el estado y mantenimiento de toda la maquinaria</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => navigate("/maquinaria/compras")}>
                <i className="bi bi-truck me-2"></i>
                Compras
              </Button>
              <Button variant="success" onClick={() => navigate("/maquinaria/ventas")}>
                <i className="bi bi-cash-coin me-2"></i>
                Ventas
              </Button>
            </div>
          </div>

          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-info text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-gear-wide-connected fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Inventario de Maquinaria</h3>
                    <p className="mb-0 opacity-75">Gestiona el estado y mantenimiento de toda la maquinaria</p>
                  </div>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Estadísticas */}
          <Row className="mb-4">
            <Col md={2}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-1">{estadisticas.total}</h4>
                  <small>Total</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="bg-success text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-1">{estadisticas.disponible}</h4>
                  <small>Disponible</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="bg-info text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-1">{estadisticas.enArriendo}</h4>
                  <small>En Arriendo</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="bg-warning text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-1">{estadisticas.enMantencion}</h4>
                  <small>Mantención</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="bg-secondary text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-1">{estadisticas.vendida}</h4>
                  <small>Vendida</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="bg-danger text-white">
                <Card.Body className="text-center">
                  <h4 className="mb-1">{estadisticas.fueraServicio}</h4>
                  <small>Fuera Servicio</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtros y Exportación */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filtrar por Estado</Form.Label>
                    <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                      <option value="todos">Todos los estados</option>
                      <option value="disponible">Disponible</option>
                      <option value="en_arriendo">En Arriendo</option>
                      <option value="en_mantencion">En Mantención</option>
                      <option value="vendida">Vendida</option>
                      <option value="fuera_de_servicio">Fuera de Servicio</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filtrar por Grupo</Form.Label>
                    <Form.Select value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)}>
                      <option value="todos">Todos los grupos</option>
                      <option value="camion_tolva">Camión Tolva</option>
                      <option value="batea">Batea</option>
                      <option value="cama_baja">Cama Baja</option>
                      <option value="pluma">Pluma</option>
                      <option value="escavadora">Excavadora</option>
                      <option value="retroexcavadora">Retroexcavadora</option>
                      <option value="cargador_frontal">Cargador Frontal</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      onClick={handleExportarExcel}
                      disabled={isExporting || maquinariasFiltradas.length === 0}
                      className="flex-grow-1 text-white fw-bold"
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
              <p className="mt-3 text-muted">Cargando maquinaria...</p>
            </div>
          )}

          {/* Tabla de maquinaria */}
          {!loading && !error && (
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Inventario de Maquinaria
                  </h5>
                  <div>
                    <span className="badge bg-primary">
                      Mostrando: {maquinariasFiltradas.length} de {maquinarias.length}
                    </span>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {maquinariasFiltradas.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-gear-wide-connected fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">No hay maquinaria que coincida con los filtros</h5>
                    <p className="text-muted mb-4">Ajusta los filtros para ver más resultados</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Patente</th>
                          <th>Marca/Modelo</th>
                          <th>Grupo</th>
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
                            <td>
                              <span className="badge bg-secondary">
                                {maquinaria?.grupo?.replace(/_/g, " ") || "Sin grupo"}
                              </span>
                            </td>
                            <td>{maquinaria.año}</td>
                            <td>
                              <Badge bg={getEstadoBadgeVariant(maquinaria.estado)}>
                                {getEstadoTexto(maquinaria.estado)}
                              </Badge>
                            </td>
                            <td className="font-monospace">
                              {maquinaria.kilometrajeActual?.toLocaleString("es-CL") || "0"} km
                            </td>
                            <td className="text-end font-monospace">{formatCurrency(maquinaria.avaluoFiscal)}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => abrirModalKilometraje(maquinaria)}
                                  title="Actualizar kilometraje"
                                  disabled={maquinaria.estado === "vendida"}
                                >
                                  <i className="bi bi-speedometer2"></i>
                                </Button>
                                {maquinaria.estado !== "vendida" && (
                                  <>
                                    {maquinaria.estado === "disponible" && (
                                      <>
                                        <Button
                                          variant="outline-warning"
                                          onClick={() => handleCambiarEstado(maquinaria, "en_mantencion")}
                                          title="Enviar a mantención"
                                        >
                                          <i className="bi bi-tools"></i>
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          onClick={() => handleCambiarEstado(maquinaria, "fuera_de_servicio")}
                                          title="Fuera de servicio"
                                        >
                                          <i className="bi bi-x-circle"></i>
                                        </Button>
                                      </>
                                    )}
                                    {maquinaria.estado === "en_mantencion" && (
                                      <Button
                                        variant="outline-success"
                                        onClick={() => handleCambiarEstado(maquinaria, "disponible")}
                                        title="Marcar como disponible"
                                      >
                                        <i className="bi bi-check-circle"></i>
                                      </Button>
                                    )}
                                    {maquinaria.estado === "fuera_de_servicio" && (
                                      <Button
                                        variant="outline-success"
                                        onClick={() => handleCambiarEstado(maquinaria, "disponible")}
                                        title="Reactivar"
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

      {/* Modal de actualizar kilometraje */}
      <Modal show={showKilometrajeModal} onHide={() => setShowKilometrajeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-speedometer2 me-2"></i>
            Actualizar Kilometraje
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {maquinariaSeleccionada && (
            <div>
              <p>
                <strong>Maquinaria:</strong> {maquinariaSeleccionada.marca} {maquinariaSeleccionada.modelo} (
                {maquinariaSeleccionada.patente})
              </p>
              <p>
                <strong>Kilometraje actual:</strong>{" "}
                {maquinariaSeleccionada.kilometrajeActual?.toLocaleString("es-CL") || "0"} km
              </p>
              <Form.Group>
                <Form.Label>Nuevo Kilometraje</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="number"
                    value={nuevoKilometraje}
                    onChange={(e) => setNuevoKilometraje(Number(e.target.value))}
                    min={maquinariaSeleccionada.kilometrajeActual || 0}
                  />
                  <span className="input-group-text">km</span>
                </div>
                <Form.Text className="text-muted">
                  El kilometraje debe ser mayor o igual al actual (
                  {maquinariaSeleccionada.kilometrajeActual?.toLocaleString("es-CL") || "0"} km)
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowKilometrajeModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleActualizarKilometraje}
            disabled={
              !maquinariaSeleccionada || nuevoKilometraje < (maquinariaSeleccionada.kilometrajeActual || 0) || loading
            }
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Actualizando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Actualizar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
