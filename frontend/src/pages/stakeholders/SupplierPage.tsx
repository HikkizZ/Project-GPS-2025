import type React from "react"
import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import SupplierModal from "@/components/stakeholders/SupplierModal"
import ConfirmModal from "@/components/stakeholders/ConfirmModal"
import { FiltersPanel } from "@/components/stakeholders/filters/FiltersPanel"
import { SupplierTable } from "@/components/stakeholders/SupplierTable"
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
          <FiltersPanel
            showFilters={showFilters}
            serverFilters={filters}
            onServerFilterChange={handleFilterChange}
            onServerFilterSubmit={handleFilterSubmit}
            onServerFilterReset={handleFilterReset}
            localFilters={localFilters}
            onLocalFilterChange={handleLocalFilterChange}
            onLocalFilterReset={handleLocalFilterReset}
            hasActiveLocalFilters={hasActiveLocalFilters}
          />

          {/* Tabla de proveedores */}
          <SupplierTable
            suppliers={filteredSuppliers}
            allSuppliersCount={allSuppliers.length}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            hasActiveLocalFilters={hasActiveLocalFilters}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onCreateClick={handleCreateClick}
            onFilterReset={handleFilterReset}
            onLocalFilterReset={handleLocalFilterReset}
          />
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
