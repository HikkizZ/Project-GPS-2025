import type React from "react"
import { useState } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner, Badge } from "react-bootstrap"
import { VentaMaquinariaForm } from "../../components/maquinaria/ventaMaquinariaForm"
import { VentaDetalleModal } from "../../components/maquinaria/ventaDetalleModal"
import MaquinariaSidebar from "../../components/maquinaria/maquinariaSideBar"
import { useVentaMaquinaria } from "../../hooks/maquinaria/useVentaMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import { useAuth } from "../../context"
import type { CreateVentaMaquinaria, VentaMaquinaria } from "../../types/maquinaria.types"

export const VentaMaquinariaPage: React.FC = () => {
  const { ventas, loading, error, registrarVenta, eliminarVenta, restaurarVenta, refetch } = useVentaMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState<VentaMaquinaria | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)

  // Verificar si el usuario es SuperAdministrador
  const isSuperAdmin = user?.role === "SuperAdministrador"

  const handleSubmit = async (data: CreateVentaMaquinaria) => {
    try {
      await registrarVenta(data)
      setShowCreateModal(false)
      // Forzar actualización después de crear
      setTimeout(() => {
        refetch()
      }, 100)
    } catch (error) {
      console.error("Error al registrar venta:", error)
    }
  }

  const handleVerDetalles = (venta: VentaMaquinaria) => {
    setSelectedVenta(venta)
    setShowDetalleModal(true)
  }

  const handleEliminarVenta = async (venta: VentaMaquinaria) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar la venta de la maquinaria ${venta.patente}? Esta acción se puede revertir.`,
      )
    ) {
      return
    }

    try {
      await eliminarVenta(venta.id)
      // Refrescar la lista para mostrar el cambio de estado
      refetch()
    } catch (error) {
      console.error("Error al eliminar venta:", error)
      alert("Error al eliminar la venta")
    }
  }

  const handleRestaurarVenta = async (venta: VentaMaquinaria) => {
    if (!window.confirm(`¿Está seguro de restaurar la venta de la maquinaria ${venta.patente}?`)) {
      return
    }

    try {
      await restaurarVenta(venta.id)
      // Refrescar la lista para mostrar el cambio de estado
      refetch()
    } catch (error) {
      console.error("Error al restaurar venta:", error)
      alert("Error al restaurar la venta")
    }
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

  const calcularGanancia = (venta: VentaMaquinaria) => {
    if (!venta?.valorVenta || !venta?.valorCompra) return 0
    return venta.valorVenta - venta.valorCompra
  }

  const calcularPorcentajeGanancia = (venta: VentaMaquinaria) => {
    if (!venta?.valorCompra || venta.valorCompra === 0) return 0
    if (!venta?.valorVenta) return 0
    return ((venta.valorVenta - venta.valorCompra) / venta.valorCompra) * 100
  }

  // Función helper para determinar si una venta está activa
  const isVentaActiva = (venta: VentaMaquinaria) => {
    return venta.isActive !== false
  }

  const handleExportarExcel = async () => {
    try {
      const datosParaExcel = ventas.map((venta) => {
        const ganancia = calcularGanancia(venta)
        const porcentaje = calcularPorcentajeGanancia(venta)

        return {
          Patente: venta.patente,
          "Fecha Venta": formatDate(venta.fechaVenta),
          "Valor Compra": venta.valorCompra || 0,
          "Valor Venta": venta.valorVenta || 0,
          Ganancia: ganancia,
          "Porcentaje Ganancia": `${porcentaje.toFixed(2)}%`,
          Cliente: venta.customer?.name || venta.comprador || "Sin cliente",
          Estado: isVentaActiva(venta) ? "Activa" : "Inactiva",
          Observaciones: venta.observaciones || "",
        }
      })

      await exportToExcel(datosParaExcel, "ventas_maquinaria", "Ventas")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al generar el archivo Excel")
    }
  }

  // Separar ventas activas e inactivas para mostrar estadísticas
  const ventasActivas = ventas.filter((v) => isVentaActiva(v))
  const ventasInactivas = ventas.filter((v) => !isVentaActiva(v))

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
                <Card.Header className="bg-gradient-success text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-cash-coin fs-4 me-3"></i>
                      <div>
                        <h3 className="mb-1">Venta de Maquinaria</h3>
                        <p className="mb-0 opacity-75">Registra las ventas de maquinaria y controla la rentabilidad</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        onClick={handleExportarExcel}
                        disabled={isExporting || ventas.length === 0}
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
                      <Button variant="light" onClick={() => setShowCreateModal(true)}>
                        <i className="bi bi-plus-circle me-2"></i>
                        Nueva Venta
                      </Button>
                    </div>
                  </div>
                </Card.Header>
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
                  <p className="mt-3 text-muted">Cargando ventas...</p>
                </div>
              )}

              {/* Tabla de ventas */}
              {!loading && !error && (
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Historial de Ventas
                      </h5>
                      <div className="d-flex gap-2">
                        <Badge bg="success">Activas: {ventasActivas.length}</Badge>
                        {ventasInactivas.length > 0 && (
                          <Badge bg="secondary">Inactivas: {ventasInactivas.length}</Badge>
                        )}
                        <Badge bg="primary">Total: {ventas.length}</Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {ventas.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-cash-coin fs-1 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted">No hay ventas registradas</h5>
                        <p className="text-muted mb-4">Comienza registrando tu primera venta de maquinaria</p>
                        <Button variant="success" onClick={() => setShowCreateModal(true)}>
                          <i className="bi bi-plus-circle me-2"></i>
                          Registrar Venta
                        </Button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="text-center">Estado</th>
                              <th className="text-center">Patente</th>
                              <th className="text-center">Fecha Venta</th>
                              <th className="text-end">Valor Compra</th>
                              <th className="text-end">Valor Venta</th>
                              <th className="text-end">Ganancia</th>
                              <th className="text-end">% Ganancia</th>
                              <th>Cliente</th>
                              <th className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ventas.map((venta, index) => {
                              const ganancia = calcularGanancia(venta)
                              const porcentaje = calcularPorcentajeGanancia(venta)

                              return (
                                <tr
                                  key={venta.id || `venta-${index}`}
                                  className={!isVentaActiva(venta) ? "table-secondary" : ""}
                                >
                                  <td className="text-center">
                                    {!isVentaActiva(venta) ? (
                                      <Badge bg="secondary">
                                        <i className="bi bi-x-circle me-1"></i>
                                        Inactiva
                                      </Badge>
                                    ) : (
                                      <Badge bg="success">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Activa
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="text-center font-monospace fw-bold">{venta.patente}</td>
                                  <td className="text-center">{formatDate(venta.fechaVenta)}</td>
                                  <td className="text-end font-monospace">{formatCurrency(venta.valorCompra)}</td>
                                  <td className="text-end font-monospace">{formatCurrency(venta.valorVenta)}</td>
                                  <td
                                    className={`text-end font-monospace ${ganancia >= 0 ? "text-success" : "text-danger"}`}
                                  >
                                    {formatCurrency(ganancia)}
                                  </td>
                                  <td className={`text-end ${ganancia >= 0 ? "text-success" : "text-danger"}`}>
                                    {porcentaje.toFixed(2)}%
                                  </td>
                                  <td>{venta.customer?.name || venta.comprador || "-"}</td>
                                  <td className="text-center">
                                    <div className="btn-group btn-group-sm">
                                      <Button
                                        variant="outline-primary"
                                        onClick={() => handleVerDetalles(venta)}
                                        title="Ver detalles"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </Button>

                                      {/* Botones de soft delete solo para SuperAdministrador */}
                                      {isSuperAdmin && (
                                        <>
                                          {isVentaActiva(venta) ? (
                                            <Button
                                              variant="outline-danger"
                                              onClick={() => handleEliminarVenta(venta)}
                                              title="Eliminar venta (soft delete)"
                                            >
                                              <i className="bi bi-trash"></i>
                                            </Button>
                                          ) : (
                                            <Button
                                              variant="outline-success"
                                              onClick={() => handleRestaurarVenta(venta)}
                                              title="Restaurar venta"
                                            >
                                              <i className="bi bi-arrow-clockwise"></i>
                                            </Button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
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
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            border: "none",
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-cash-coin me-2"></i>
            Registrar Nueva Venta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <VentaMaquinariaForm onSubmit={handleSubmit} loading={loading} />
        </Modal.Body>
      </Modal>

      {/* Modal de detalles */}
      <VentaDetalleModal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} venta={selectedVenta} />
    </div>
  )
}
