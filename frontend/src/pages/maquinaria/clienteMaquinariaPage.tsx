import type React from "react"
import { useState } from "react"
import { Modal, Container, Row, Col, Card, Button, Table, Alert, Spinner, Form, InputGroup } from "react-bootstrap"
import { ClienteMaquinariaForm } from "../../components/maquinaria/clienteMaquinariaForm"
import MaquinariaSidebar from "../../components/maquinaria/maquinariaSideBar"
import { useClienteMaquinaria } from "../../hooks/maquinaria/useClienteMaquinaria"
import { useExcelExport } from "../../hooks/useExcelExport"
import type { CreateClienteMaquinaria, ClienteMaquinaria } from "../../types/arriendoMaquinaria.types"

export const ClienteMaquinariaPage: React.FC = () => {
  const { clientes, loading, error, crearCliente, actualizarCliente, buscarClientes, refetch } =
    useClienteMaquinaria()
  const { exportToExcel, isExporting } = useExcelExport()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<ClienteMaquinaria | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSubmit = async (data: CreateClienteMaquinaria) => {
    try {
      if (editingCliente) {
        await actualizarCliente(editingCliente.id, data)
        setEditingCliente(null)
      }
    } catch (error) {
      console.error("Error al procesar cliente:", error)
      // El error ya se maneja en el hook, no necesitamos hacer nada más aquí
    }
  }

  const handleEdit = (cliente: ClienteMaquinaria) => {
    setEditingCliente(cliente)
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
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleEdit(cliente)}
                                      title="Editar"
                                    >
                                      <i className="bi bi-pencil"></i>
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
    </div>
  )
}
