import type React from "react"
import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card, Table, Form, Spinner } from "react-bootstrap"
import SupplierModal from "@/components/stakeholders/SupplierModal"
import ConfirmModal from "@/components/stakeholders/ConfirmModal"
import { useSuppliers } from "@/hooks/stakeholders/useSuppliers"
import type { Supplier, CreateSupplierData, UpdateSupplierData } from "@/types/stakeholders/supplier.types"
import { useToast, Toast } from "@/components/common/Toast"
import "../../styles/pages/suppliers.css"

export const SupplierPage: React.FC = () => {
  const {
    suppliers,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSuppliers()

  const { toasts, removeToast, showSuccess, showError } = useToast()

  // Estados para filtrado local
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [localFilters, setLocalFilters] = useState({
    name: "",
    rut: "",
    email: "",
    address: "",
    phone: "",
  })

  // Estados existentes
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined)
  const [filters, setFilters] = useState({ rut: "", email: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  // Efecto para sincronizar suppliers del hook con el estado local
  useEffect(() => {
    setAllSuppliers(suppliers)
    setFilteredSuppliers(suppliers)
  }, [suppliers])

  // Efecto para aplicar filtros locales
  useEffect(() => {
    let filtered = [...allSuppliers]

    // Aplicar filtros locales
    if (localFilters.name) {
      filtered = filtered.filter((supplier) => supplier.name.toLowerCase().includes(localFilters.name.toLowerCase()))
    }

    if (localFilters.rut) {
      filtered = filtered.filter((supplier) => supplier.rut.toLowerCase().includes(localFilters.rut.toLowerCase()))
    }

    if (localFilters.email) {
      filtered = filtered.filter((supplier) => supplier.email.toLowerCase().includes(localFilters.email.toLowerCase()))
    }

    if (localFilters.address) {
      filtered = filtered.filter((supplier) =>
        supplier.address.toLowerCase().includes(localFilters.address.toLowerCase()),
      )
    }

    if (localFilters.phone) {
      filtered = filtered.filter((supplier) => supplier.phone.includes(localFilters.phone))
    }

    setFilteredSuppliers(filtered)
  }, [allSuppliers, localFilters])

  const handleCreateClick = () => {
    setEditingSupplier(undefined)
    setShowModal(true)
  }

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowModal(true)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
  }

  const confirmDeleteSupplier = async () => {
    if (!supplierToDelete) return

    const result = await deleteSupplier(supplierToDelete.id)
    if (result.success) {
      showSuccess("¡Proveedor eliminado!", "El proveedor se ha eliminado exitosamente del sistema", 4000)
    } else {
      showError("Error al eliminar", result.error || "Ocurrió un error al eliminar el proveedor.")
    }
    setSupplierToDelete(null)
  }

  const handleSubmit = async (data: CreateSupplierData | UpdateSupplierData) => {
    const isEdit = Boolean(editingSupplier)
    const result = isEdit
      ? await updateSupplier(editingSupplier!.id, data as UpdateSupplierData)
      : await createSupplier(data as CreateSupplierData)

    if (result.success) {
      showSuccess(isEdit ? "¡Proveedor actualizado!" : "¡Proveedor creado!", result.message, 4000)
      setShowModal(false)
    } else {
      showError("Error", result.error || "Ocurrió un error inesperado")
    }
  }

  // Manejo de filtros del servidor
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadSuppliers(filters)
  }

  const handleFilterReset = async () => {
    setFilters({ rut: "", email: "" })
    await loadSuppliers({})
  }

  // Manejo de filtros locales
  const handleLocalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocalFilterReset = () => {
    setLocalFilters({
      name: "",
      rut: "",
      email: "",
      address: "",
      phone: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value.trim() !== "")
  const hasActiveLocalFilters = Object.values(localFilters).some((value) => value.trim() !== "")

  return (
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-building fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Gestión de Proveedores</h3>
                    <p className="mb-0 opacity-75">Administrar información de proveedores del sistema</p>
                  </div>
                </div>
                <div>
                  <Button
                    variant={showFilters ? "outline-light" : "light"}
                    className="me-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`}></i>
                    {showFilters ? "Ocultar" : "Mostrar"} Panel de Filtros
                  </Button>
                  <Button variant="light" onClick={handleCreateClick}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Nuevo Proveedor
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Panel de filtros */}
          {showFilters && (
            <>
              {/* Filtros del servidor */}
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-server me-2"></i>
                    Filtros del Servidor
                  </h6>
                  <small className="text-muted">Estos filtros consultan la base de datos</small>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleFilterSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>RUT</Form.Label>
                          <Form.Control
                            type="text"
                            name="rut"
                            value={filters.rut}
                            onChange={handleFilterChange}
                            placeholder="Buscar por RUT"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Correo Electrónico</Form.Label>
                          <Form.Control
                            type="text"
                            name="email"
                            value={filters.email}
                            onChange={handleFilterChange}
                            placeholder="Buscar por correo"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12} className="d-flex align-items-end">
                        <div className="d-flex gap-2 mb-3">
                          <Button variant="primary" type="submit">
                            <i className="bi bi-search me-2"></i>
                            Buscar en Servidor
                          </Button>
                          <Button variant="outline-secondary" type="button" onClick={handleFilterReset}>
                            <i className="bi bi-x-circle me-2"></i>
                            Limpiar
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {/* Filtros locales */}
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">
                        <i className="bi bi-funnel me-2"></i>
                        Filtros Locales
                      </h6>
                      <small className="text-muted">Filtrado rápido en tiempo real</small>
                    </div>
                    {hasActiveLocalFilters && (
                      <Button variant="outline-secondary" size="sm" onClick={handleLocalFilterReset}>
                        <i className="bi bi-x-circle me-1"></i>
                        Limpiar Filtros
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={localFilters.name}
                          onChange={handleLocalFilterChange}
                          placeholder="Filtrar por nombre"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>RUT</Form.Label>
                        <Form.Control
                          type="text"
                          name="rut"
                          value={localFilters.rut}
                          onChange={handleLocalFilterChange}
                          placeholder="Filtrar por RUT"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Correo</Form.Label>
                        <Form.Control
                          type="text"
                          name="email"
                          value={localFilters.email}
                          onChange={handleLocalFilterChange}
                          placeholder="Filtrar por correo"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={localFilters.address}
                          onChange={handleLocalFilterChange}
                          placeholder="Filtrar por dirección"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={localFilters.phone}
                          onChange={handleLocalFilterChange}
                          placeholder="Filtrar por teléfono"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando proveedores...</p>
            </div>
          )}

          {/* Tabla de proveedores */}
          {!isLoading && (
            <Card className="shadow-sm">
              <Card.Body>
                {filteredSuppliers.length === 0 ? (
                  hasActiveFilters || hasActiveLocalFilters ? (
                    <div className="text-center py-5">
                      <i className="bi bi-building-x fs-1 text-muted mb-3 d-block"></i>
                      <h5 className="text-muted">No hay resultados que coincidan con tu búsqueda</h5>
                      <p className="text-muted">Intenta ajustar los filtros para obtener más resultados</p>
                      <div className="d-flex gap-2 justify-content-center">
                        {hasActiveLocalFilters && (
                          <Button variant="outline-secondary" onClick={handleLocalFilterReset}>
                            <i className="bi bi-arrow-clockwise me-2"></i> Limpiar Filtros Locales
                          </Button>
                        )}
                        {hasActiveFilters && (
                          <Button variant="outline-primary" onClick={handleFilterReset}>
                            <i className="bi bi-arrow-clockwise me-2"></i> Mostrar Todos
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-building fs-1 text-muted mb-3 d-block"></i>
                      <h5 className="text-muted">No hay proveedores registrados</h5>
                      <p className="text-muted">Los proveedores aparecerán aquí cuando sean registrados</p>
                      <Button variant="primary" onClick={handleCreateClick}>
                        <i className="bi bi-plus-lg me-2"></i>
                        Registrar Primer Proveedor
                      </Button>
                    </div>
                  )
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Proveedores Registrados ({filteredSuppliers.length} de {allSuppliers.length})
                      </h6>
                      {hasActiveLocalFilters && (
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-funnel-fill me-1"></i>
                          <small>Filtros locales activos</small>
                        </div>
                      )}
                    </div>
                    <div className="table-responsive">
                      <Table hover>
                        <thead className="table-light">
                          <tr>
                            <th>Nombre</th>
                            <th>RUT</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th className="text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSuppliers.map((supplier) => (
                            <tr key={supplier.id}>
                              <td>
                                <div className="fw-bold">{supplier.name}</div>
                              </td>
                              <td>{supplier.rut}</td>
                              <td>{supplier.address}</td>
                              <td>{supplier.phone}</td>
                              <td>{supplier.email}</td>
                              <td className="text-center">
                                <div className="btn-group">
                                  <Button
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => handleEditClick(supplier)}
                                    title="Editar proveedor"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    onClick={() => handleDeleteClick(supplier)}
                                    title="Eliminar proveedor"
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
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <SupplierModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingSupplier}
      />

      <ConfirmModal
        show={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={confirmDeleteSupplier}
        title="Eliminar proveedor"
        message={`¿Estás seguro que deseas eliminar al proveedor "${supplierToDelete?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </Container>
  )
}