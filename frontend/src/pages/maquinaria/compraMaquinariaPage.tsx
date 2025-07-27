import type React from "react"
import { useState } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner, Badge } from "react-bootstrap"
import { CompraMaquinariaForm } from "../../components/maquinaria/compraMaquinariaForm"
import { CompraDetalleModal } from "../../components/maquinaria/compraDetalleModal"
import MaquinariaSidebar from "../../components/maquinaria/maquinariaSideBar"
import { useCompraMaquinaria } from "../../hooks/maquinaria/useCompraMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import { useAuth } from "../../context"
import type { CreateCompraMaquinaria, CompraMaquinaria } from "../../types/maquinaria.types"

export const CompraMaquinariaPage: React.FC = () => {
  const { compras, loading, error, crearCompra, eliminarPadron, eliminarCompra, restaurarCompra, refetch } =
    useCompraMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCompra, setSelectedCompra] = useState<CompraMaquinaria | null>(null)
  const [showDetalleModal, setShowDetalleModal] = useState(false)

  // Verificar si el usuario es SuperAdministrador
  const isSuperAdmin = user?.role === "SuperAdministrador"

  const handleSubmit = async (data: CreateCompraMaquinaria, file?: File) => {
    try {
      await crearCompra(data, file)
      setShowCreateModal(false)
      // Forzar actualización después de crear
      setTimeout(() => {
        refetch()
      }, 100)
    } catch (error) {
      console.error("Error al crear compra:", error)
    }
  }

  const handleVerDetalles = (compra: CompraMaquinaria) => {
    setSelectedCompra(compra)
    setShowDetalleModal(true)
  }

  const handleEliminarPadron = async (id: number) => {
    try {
      await eliminarPadron(id)
      if (selectedCompra && selectedCompra.id === id) {
        const compraActualizada = compras.find((c) => c.id === id)
        if (compraActualizada) {
          setSelectedCompra(compraActualizada)
        }
      }
    } catch (error) {
      console.error("Error al eliminar padrón:", error)
    }
  }

  const handleEliminarCompra = async (compra: CompraMaquinaria) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar la compra de la maquinaria ${compra.patente}? Esta acción se puede revertir.`,
      )
    ) {
      return
    }

    try {
      await eliminarCompra(compra.id)
      // Refrescar la lista para mostrar el cambio de estado
      refetch()
    } catch (error) {
      console.error("Error al eliminar compra:", error)
      alert("Error al eliminar la compra")
    }
  }

  const handleRestaurarCompra = async (compra: CompraMaquinaria) => {
    if (!window.confirm(`¿Está seguro de restaurar la compra de la maquinaria ${compra.patente}?`)) {
      return
    }

    try {
      await restaurarCompra(compra.id)
      // Refrescar la lista para mostrar el cambio de estado
      refetch()
    } catch (error) {
      console.error("Error al restaurar compra:", error)
      alert("Error al restaurar la compra")
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

  // Función helper para determinar si una compra está activa
  const isCompraActiva = (compra: CompraMaquinaria) => {
    return compra.isActive !== false
  }

  const handleExportarExcel = async () => {
    try {
      const datosParaExcel = compras.map((compra) => ({
        Patente: compra.patente,
        Marca: compra.marca,
        Modelo: compra.modelo,
        Año: compra.anio,
        "Fecha Compra": formatDate(compra.fechaCompra),
        "Valor Compra": compra.valorCompra || 0,
        Proveedor: compra.supplier?.name || compra.proveedor || "Sin proveedor",
        Estado: isCompraActiva(compra) ? "Activa" : "Inactiva",
      }))

      await exportToExcel(datosParaExcel, "compras_maquinaria", "Compras")
    } catch (error) {
      console.error("Error al exportar:", error)
      alert("Error al generar el archivo Excel")
    }
  }

  // Separar compras activas e inactivas para mostrar estadísticas
  const comprasActivas = compras.filter((c) => isCompraActiva(c))
  const comprasInactivas = compras.filter((c) => !isCompraActiva(c))

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
                      <i className="bi bi-truck fs-4 me-3"></i>
                      <div>
                        <h3 className="mb-1">Compra de Maquinaria</h3>
                        <p className="mb-0 opacity-75">
                          Gestiona las compras de maquinaria y registra nuevas adquisiciones
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        onClick={handleExportarExcel}
                        disabled={isExporting || compras.length === 0}
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
                        Nueva Compra
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
                  <p className="mt-3 text-muted">Cargando compras...</p>
                </div>
              )}

              {/* Tabla de compras */}
              {!loading && (
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Historial de Compras
                      </h5>
                      <div className="d-flex gap-2">
                        <Badge bg="success">Activas: {comprasActivas.length}</Badge>
                        {comprasInactivas.length > 0 && (
                          <Badge bg="secondary">Inactivas: {comprasInactivas.length}</Badge>
                        )}
                        <Badge bg="primary">Total: {compras.length}</Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {compras.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-truck fs-1 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted">No hay compras registradas</h5>
                        <p className="text-muted mb-0">Comienza registrando tu primera compra de maquinaria</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Estado</th>
                              <th>Patente</th>
                              <th>Marca</th>
                              <th>Modelo</th>
                              <th>Año</th>
                              <th>Fecha Compra</th>
                              <th className="text-end">Valor</th>
                              <th>Proveedor</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compras.map((compra, index) => (
                              <tr
                                key={compra.id || `compra-${index}`}
                                className={!isCompraActiva(compra) ? "table-secondary" : ""}
                              >
                                <td>
                                  {!isCompraActiva(compra) ? (
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
                                <td className="font-monospace fw-bold">{compra.patente}</td>
                                <td>{compra.marca}</td>
                                <td>{compra.modelo}</td>
                                <td>{compra.anio}</td>
                                <td>{formatDate(compra.fechaCompra)}</td>
                                <td className="text-end font-monospace">{formatCurrency(compra.valorCompra)}</td>
                                <td className="text-start">
                                  {compra.supplier?.name || compra.proveedor || "Sin proveedor"}
                                </td>
                                <td className="text-start">

                                  <div className="btn-group btn-group-sm">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleVerDetalles(compra)}
                                      title="Ver detalles"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </Button>

                                    {/* Botones de soft delete solo para SuperAdministrador */}
                                    {isSuperAdmin && (
                                      <>
                                        {isCompraActiva(compra) ? (
                                          <Button
                                            variant="outline-danger"
                                            onClick={() => handleEliminarCompra(compra)}
                                            title="Eliminar compra (soft delete)"
                                          >
                                            <i className="bi bi-trash"></i>
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outline-success"
                                            onClick={() => handleRestaurarCompra(compra)}
                                            title="Restaurar compra"
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
            <i className="bi bi-truck me-2"></i>
            Registrar Nueva Compra
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <CompraMaquinariaForm onSubmit={handleSubmit} loading={loading} />
        </Modal.Body>
      </Modal>

      {/* Modal de detalles */}
      <CompraDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        compra={selectedCompra}
        onEliminarPadron={handleEliminarPadron}
      />
    </div>
  )
}
