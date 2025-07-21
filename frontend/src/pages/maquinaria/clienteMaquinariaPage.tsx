"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner, Form, InputGroup } from "react-bootstrap"
import { ClienteMaquinariaForm } from "../../components/maquinaria/clienteMaquinariaForm"
import { useClienteMaquinaria, useEstadisticasClientes } from "../../hooks/maquinaria/useClienteMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import type { CreateClienteMaquinaria, ClienteMaquinaria } from "../../types/arriendoMaquinaria.types"
import { useNavigate } from "react-router-dom"

export const ClienteMaquinariaPage: React.FC = () => {
  const { clientes, loading, error, crearCliente, actualizarCliente, eliminarCliente, buscarClientes, refetch } =
    useClienteMaquinaria()
  const { estadisticas, refetch: refetchEstadisticas } = useEstadisticasClientes()
  const { exportToExcel, isExporting } = useExcelExport()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<ClienteMaquinaria | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  // Log para debug
  useEffect(() => {
    console.log("🎯 Página: Estado actual:", {
      clientesCount: clientes.length,
      loading,
      error,
      clientes: clientes,
    })
  }, [clientes, loading, error])

  const handleSubmit = async (data: CreateClienteMaquinaria) => {
    try {
      if (editingCliente) {
        await actualizarCliente(editingCliente.id, data)
        setEditingCliente(null)
      } else {
        await crearCliente(data)
        setShowCreateModal(false)
        // Actualizar estadísticas después de crear
        refetchEstadisticas()
      }
    } catch (error) {
      console.error("Error al procesar cliente:", error)
      // El error ya se maneja en el hook, no necesitamos hacer nada más aquí
    }
  }

  const handleEdit = (cliente: ClienteMaquinaria) => {
    setEditingCliente(cliente)
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar el cliente "${nombre}"?`)) {
      try {
        await eliminarCliente(id)
        // Actualizar estadísticas después de eliminar
        refetchEstadisticas()
      } catch (error) {
        console.error("Error al eliminar cliente:", error)
      }
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      await buscarClientes(searchTerm.trim())
    } else {
      refetch()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    refetch()
  }

  const handleExportarExcel = async () => {
    try {
      const datosParaExcel = clientes.map((cliente) => ({
        RUT: cliente.rut,
        "Nombre/Razón Social": cliente.nombre,
        Teléfono: cliente.telefono || "-",
        Email: cliente.email || "-",
        Dirección: cliente.direccion || "-",
        "Fecha Creación": cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString("es-CL") : "-",
      }))

      await exportToExcel(datosParaExcel, "clientes_maquinaria", "Clientes")
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
                  <i className="bi bi-people me-2"></i>
                  Clientes de Maquinaria
                </h2>
                <p className="text-muted mb-0">Gestiona los clientes que contratan servicios de maquinaria</p>
              </div>
            </div>
            <div>
              <Button variant="info" onClick={() => navigate("/maquinaria/arriendos")}>
                <i className="bi bi-file-text me-2"></i>
                Ver Reportes
              </Button>
            </div>
          </div>

          {/* Debug info - TEMPORAL */}
          <Alert variant="info" className="mb-3">
            <strong>Debug:</strong> Clientes cargados: {clientes.length} | Loading: {loading.toString()} | Error:{" "}
            {error || "ninguno"}
          </Alert>

          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-info text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-people fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Clientes de Maquinaria</h3>
                    <p className="mb-0 opacity-75">Administra la información de tus clientes</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    onClick={handleExportarExcel}
                    disabled={isExporting || clientes.length === 0}
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
                    Nuevo Cliente
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Estadísticas */}
          {estadisticas && (
            <Row className="mb-4">
              <Col md={4}>
                <Card className="bg-primary text-white">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">Total Clientes</h6>
                        <h4 className="mb-0">{estadisticas.totalClientes}</h4>
                      </div>
                      <i className="bi bi-people fs-1 opacity-50"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-success text-white">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">Con Teléfono</h6>
                        <h4 className="mb-0">{estadisticas.clientesConTelefono}</h4>
                      </div>
                      <i className="bi bi-telephone fs-1 opacity-50"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="bg-info text-white">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">Con Email</h6>
                        <h4 className="mb-0">{estadisticas.clientesConEmail}</h4>
                      </div>
                      <i className="bi bi-envelope fs-1 opacity-50"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Barra de búsqueda */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="align-items-end">
                  <Col md={8}>
                    <Form.Label>Buscar Cliente</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button type="submit" variant="outline-primary">
                        <i className="bi bi-search"></i>
                      </Button>
                      {searchTerm && (
                        <Button variant="outline-secondary" onClick={handleClearSearch}>
                          <i className="bi bi-x"></i>
                        </Button>
                      )}
                    </InputGroup>
                  </Col>
                </Row>
              </Form>
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
              <p className="mt-3 text-muted">Cargando clientes...</p>
            </div>
          )}

          {/* Tabla de clientes */}
          {!loading && (
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Lista de Clientes
                  </h5>
                  <div>
                    <span className="badge bg-primary">Total: {clientes.length} clientes</span>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {clientes.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">No hay clientes registrados</h5>
                    <p className="text-muted mb-0">
                      Comienza agregando tu primer cliente desde el botón "Nuevo Cliente"
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>RUT</th>
                          <th>Nombre/Razón Social</th>
                          <th>Teléfono</th>
                          <th>Email</th>
                          <th>Dirección</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientes.map((cliente) => (
                          <tr key={cliente.id}>
                            <td className="font-monospace fw-bold">{cliente.rut}</td>
                            <td>{cliente.nombre}</td>
                            <td>{cliente.telefono || "-"}</td>
                            <td>{cliente.email || "-"}</td>
                            <td className="text-truncate" style={{ maxWidth: "200px" }} title={cliente.direccion}>
                              {cliente.direccion || "-"}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <Button variant="outline-primary" onClick={() => handleEdit(cliente)} title="Editar">
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  onClick={() => handleDelete(cliente.id, cliente.nombre)}
                                  title="Eliminar"
                                >
                                  <i className="bi bi-trash"></i>
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

      {/* Modal de creación */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
            border: "none",
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Nuevo Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          <ClienteMaquinariaForm onSubmit={handleSubmit} loading={loading} />
        </Modal.Body>
      </Modal>

      {/* Modal de edición */}
      <Modal show={!!editingCliente} onHide={() => setEditingCliente(null)} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #ffc107 0%, #e0a800 100%)",
            border: "none",
          }}
          className="text-dark"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-pencil me-2"></i>
            Editar Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.5rem" }}>
          {editingCliente && (
            <ClienteMaquinariaForm
              onSubmit={handleSubmit}
              loading={loading}
              initialData={editingCliente}
              isEditing={true}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}
