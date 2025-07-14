"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner } from "react-bootstrap"
import { VentaMaquinariaForm } from "../../components/maquinaria/ventaMaquinariaForm"
import { useVentaMaquinaria } from "../../hooks/maquinaria/useVentaMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import type { CreateVentaMaquinaria, VentaMaquinaria } from "../../types/maquinaria.types"
import { useNavigate } from "react-router-dom"

export const VentaMaquinariaPage: React.FC = () => {
  const { ventas, loading, error, registrarVenta, eliminarVenta } = useVentaMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVenta, setEditingVenta] = useState<VentaMaquinaria | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateVentaMaquinaria) => {
    try {
      await registrarVenta(data)
      setShowCreateModal(false)
      // Mostrar notificación de éxito
    } catch (error) {
      console.error("Error al registrar venta:", error)
      // Mostrar notificación de error
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar esta venta?")) {
      try {
        await eliminarVenta(id)
        // Mostrar notificación de éxito
      } catch (error) {
        console.error("Error al eliminar venta:", error)
        // Mostrar notificación de error
      }
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

  const totalVentas = ventas?.reduce((sum, venta) => sum + (venta?.valorVenta || 0), 0) || 0
  const totalGanancias = ventas?.reduce((sum, venta) => sum + calcularGanancia(venta), 0) || 0

  // Función para exportar ventas
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
          Comprador: venta.comprador || "Sin comprador",
          Observaciones: venta.observaciones || "",
        }
      })

      await exportToExcel(datosParaExcel, "ventas_maquinaria", "Ventas")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al generar el archivo Excel")
    }
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header con navegación */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <Button variant="outline-secondary" onClick={() => navigate("/maquinaria")} className="me-3">
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Maquinaria
              </Button>
              <div>
                <h2 className="mb-1">
                  <i className="bi bi-cash-coin me-2"></i>
                  Venta de Maquinaria
                </h2>
                <p className="text-muted mb-0">Registra las ventas de maquinaria y controla la rentabilidad</p>
              </div>
            </div>
            <div>
              <Button variant="primary" onClick={() => navigate("/maquinaria/compras")}>
                <i className="bi bi-truck me-2"></i>
                Ver Compras
              </Button>
            </div>
          </div>

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

          {/* Resumen de ventas */}
          {ventas.length > 0 && (
            <Row className="mb-4">
              <Col md={4}>
                <Card className="bg-primary text-white">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">Total Ventas</h6>
                        <h4 className="mb-0">{formatCurrency(totalVentas)}</h4>
                      </div>
                      <i className="bi bi-currency-dollar fs-1 opacity-50"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className={`text-white ${totalGanancias >= 0 ? "bg-success" : "bg-danger"}`}>
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">Ganancias Totales</h6>
                        <h4 className="mb-0">{formatCurrency(totalGanancias)}</h4>
                      </div>
                      <i className={`bi ${totalGanancias >= 0 ? "bi-graph-up" : "bi-graph-down"} fs-1 opacity-50`}></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-info text-white">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">Maquinarias Vendidas</h6>
                        <h4 className="mb-0">{ventas.length}</h4>
                      </div>
                      <i className="bi bi-truck fs-1 opacity-50"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

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
                          <th>Patente</th>
                          <th>Fecha Venta</th>
                          <th>Valor Compra</th>
                          <th>Valor Venta</th>
                          <th>Ganancia</th>
                          <th>% Ganancia</th>
                          <th>Comprador</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventas.map((venta) => {
                          const ganancia = calcularGanancia(venta)
                          const porcentaje = calcularPorcentajeGanancia(venta)

                          return (
                            <tr key={venta.id}>
                              <td className="font-monospace fw-bold">{venta.patente}</td>
                              <td>{formatDate(venta.fechaVenta)}</td>
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
                              <td>{venta.comprador || "-"}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <Button
                                    variant="outline-primary"
                                    onClick={() => setEditingVenta(venta)}
                                    title="Ver detalles"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    onClick={() => handleDelete(venta.id)}
                                    title="Eliminar"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
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
    </Container>
  )
}
