"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import CustomerModal from "@/components/stakeholders/CustomerModal"
import ConfirmModal from "@/components/stakeholders/ConfirmModal"
import { FiltersPanel } from "@/components/stakeholders/filters/FiltersPanel"
import { CustomerTable } from "@/components/stakeholders/CustomerTable"
import { useCustomers } from "@/hooks/stakeholders/useCustomers"
import type { Customer, CreateCustomerData, UpdateCustomerData } from "@/types/stakeholders/customer.types"
import { useToast, Toast } from "@/components/common/Toast"
import "../../styles/pages/customers.css"

export const CustomerPage: React.FC = () => {
  const {
    customers,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomers()

  const { toasts, removeToast, showSuccess, showError } = useToast()

  // Estados para filtrado local
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [localFilters, setLocalFilters] = useState({
    name: "",
    rut: "",
    email: "",
    address: "",
    phone: "",
  })

  // Estados existentes
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined)
  const [filters, setFilters] = useState({ rut: "", email: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  // Efecto para sincronizar customers del hook con el estado local
  useEffect(() => {
    setAllCustomers(customers)
    setFilteredCustomers(customers)
  }, [customers])

  // Efecto para aplicar filtros locales
  useEffect(() => {
    let filtered = [...allCustomers]

    // Aplicar filtros locales
    if (localFilters.name) {
      filtered = filtered.filter((customer) => customer.name.toLowerCase().includes(localFilters.name.toLowerCase()))
    }

    if (localFilters.rut) {
      filtered = filtered.filter((customer) => customer.rut.toLowerCase().includes(localFilters.rut.toLowerCase()))
    }

    if (localFilters.email) {
      filtered = filtered.filter((customer) => customer.email.toLowerCase().includes(localFilters.email.toLowerCase()))
    }

    if (localFilters.address) {
      filtered = filtered.filter((customer) =>
        customer.address.toLowerCase().includes(localFilters.address.toLowerCase()),
      )
    }

    if (localFilters.phone) {
      filtered = filtered.filter((customer) => customer.phone.includes(localFilters.phone))
    }

    setFilteredCustomers(filtered)
  }, [allCustomers, localFilters])

  const handleCreateClick = () => {
    setEditingCustomer(undefined)
    setShowModal(true)
  }

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowModal(true)
  }

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer)
  }

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return

    const result = await deleteCustomer(customerToDelete.id)
    if (result.success) {
      showSuccess("¡Cliente eliminado!", "El cliente se ha eliminado exitosamente del sistema", 4000)
    } else {
      showError("Error al eliminar", result.error || "Ocurrió un error al eliminar el cliente.")
    }
    setCustomerToDelete(null)
  }

  const handleSubmit = async (data: CreateCustomerData | UpdateCustomerData) => {
    const isEdit = Boolean(editingCustomer)
    const result = isEdit
      ? await updateCustomer(editingCustomer!.id, data as UpdateCustomerData)
      : await createCustomer(data as CreateCustomerData)

    if (result.success) {
      showSuccess(isEdit ? "¡Cliente actualizado!" : "¡Cliente creado!", result.message, 4000)
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
    await loadCustomers(filters)
  }

  const handleFilterReset = async () => {
    setFilters({ rut: "", email: "" })
    await loadCustomers({})
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
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className="inventory-sidebar-wrapper">
          <InventorySidebar />
        </div>

        {/* Contenido principal */}
        <div className="inventory-main-content flex-grow-1">
          <Container fluid className="py-2">
            <Row>
              <Col>
                {/* Encabezado de página */}
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-gradient-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-people fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Gestión de Clientes</h3>
                          <p className="mb-0 opacity-75">Administrar información de clientes del sistema</p>
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
                          Nuevo Cliente
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

                {/* Tabla de clientes */}
                <CustomerTable
                  customers={filteredCustomers}
                  allCustomersCount={allCustomers.length}
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

            <CustomerModal
              show={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleSubmit}
              isSubmitting={isCreating || isUpdating}
              initialData={editingCustomer}
            />

            <ConfirmModal
            show={!!customerToDelete}
            onClose={() => setCustomerToDelete(null)}
            onConfirm={confirmDeleteCustomer}
            title="Eliminar cliente"
            message={`¿Estás seguro que deseas eliminar al cliente "${customerToDelete?.name}"?`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            headerVariant="danger" // Encabezado rojo
            warningContent={
              // Contenido de advertencia personalizable
              <>
                <p className="mb-0">Esta acción:</p>
                <ul>
                  <li>Marcará el cliente como eliminado en el sistema.</li>
                  <li>Desactivará su ficha de empresa.</li>
                  <li>Registrará el motivo de eliminación en el historial.</li>
                </ul>
              </>
            }
          />


            {/* Sistema de notificaciones */}
            <Toast toasts={toasts} removeToast={removeToast} />
          </Container>
        </div>
      </div>
    </Container>
  )
}
