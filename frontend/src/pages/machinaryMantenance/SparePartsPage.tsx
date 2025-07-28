import type React from "react"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap"
import type { SparePart } from "@/types/machinaryMaintenance/sparePart.types"
import { useSpareParts } from "@/hooks/MachinaryMaintenance/SparePart/useSpareParts"
import { useCreateSparePart } from "@/hooks/MachinaryMaintenance/SparePart/useCreateSparePart"
import { useUpdateSparePart } from "@/hooks/MachinaryMaintenance/SparePart/useUpdateSparePart"
import { useDeleteSparePart } from "@/hooks/MachinaryMaintenance/SparePart/useDeleteSparePart"
import ListSparePart from "@/components/MachineryMaintenance/SpareParts/ListSparePart"
import SparePartModal from "@/components/MachineryMaintenance/SpareParts/SparePartModal"
import SparePartLocalFilters from "@/components/MachineryMaintenance/SpareParts/SparePartFilters"
import { Toast, useToast } from "@/components/common/Toast"
import MaintenanceSidebar from "@/components/MachineryMaintenance/MaintenanceSidebar"
import  Pagination  from "@/components/MachineryMaintenance/Pagination"
import { useAuth } from "@/context/useAuth";


const SparePartsPage: React.FC = () => {
  const { spareParts, loading, error, reload } = useSpareParts()
  const { create, loading: creating } = useCreateSparePart()
  const { updateSparePart, loading: updating } = useUpdateSparePart()
  const { deleteSparePart, loading: deleting } = useDeleteSparePart()
  const { user } = useAuth();

  const puedeRegistrar = user?.role === "Mantenciones de Maquinaria";


  const { toasts, removeToast, showSuccess, showError } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingPart, setEditingPart] = useState<SparePart | null>(null)

  const [showFilters, setShowFilters] = useState(false)
  const [filteredParts, setFilteredParts] = useState<SparePart[]>([])
  const [filters, setFilters] = useState({
    nombre: "",
    stockMin: ""
  })

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedFilteredParts = [...filteredParts].sort((a, b) => a.name.localeCompare(b.name));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFilteredParts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedFilteredParts.length / itemsPerPage);
  


  const hasActiveFilters = Object.values(filters).some((v) => v.trim() !== "")

  useEffect(() => {
    let data = [...spareParts]

    if (filters.nombre) {
      const lower = filters.nombre.toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(lower))
    }

    if (filters.stockMin) {
      const min = parseInt(filters.stockMin)
      if (!isNaN(min)) {
        data = data.filter(p => p.stock >= min)
      }
    }

    setFilteredParts(data);
    setCurrentPage(1);
  }, [spareParts, filters])

  

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleResetFilters = () => {
    setFilters({ nombre: "", stockMin: "" })
    setShowFilters(false)
  }

  const handleOpenModal = (part?: SparePart) => {
    setEditingPart(part || null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setEditingPart(null)
    setShowModal(false)
  }

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingPart) {
        await updateSparePart(editingPart.id, data)
        showSuccess("Repuesto actualizado", "Los cambios han sido guardados")
      } else {
        await create(data)
        showSuccess("Repuesto creado", "Se registró correctamente")
      }

      handleCloseModal()
      reload()
    } catch (error) {
      console.error(error)
      showError("Error al guardar", "Ocurrió un problema al registrar el repuesto")
    }
  }

  const handleDelete = async (id: number) => {
    try {
        await deleteSparePart(id)
        showSuccess("Repuesto eliminado", "Se eliminó correctamente")
        reload()
      } catch (error) {
        showError("Error al eliminar", "No se pudo eliminar el repuesto")
      }
  }

  return (
    <div className="d-flex">
      <MaintenanceSidebar />
      <div className="flex-grow-1">
        <Container fluid className="py-4">
          <Row>
            <Col>
              {/* Header */}
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-gradient-primary text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-nut fs-4 me-3"></i>
                      <div>
                        <h3 className="mb-1">Gestión de Repuestos</h3>
                        <p className="mb-0 opacity-75">
                          Visualiza, edita y registra repuestos para mantención de maquinaria
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant={showFilters ? "outline-light" : "light"}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`} />
                        {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                      </Button>
                    
                        <Button variant="light" onClick={() => handleOpenModal()} className="d-flex align-items-center">
                          <i className="bi bi-plus-circle me-2"></i>
                          Registrar Repuesto
                        </Button>
                      

                    </div>
                  </div>
                </Card.Header>
              </Card>

              {showFilters && (
                <SparePartLocalFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              )}

              {/* Contenido principal */}
              <Card className="shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Inventario de Repuestos
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3 text-muted">Cargando repuestos...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="danger" className="m-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  ) : (
                    <>
                      <ListSparePart
                        data={currentItems}
                        totalItems={filteredParts.length}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        onReload={reload}
                      />
                      {totalPages > 1 && (
                        <Pagination
                          totalPages={totalPages}
                          currentPage={currentPage}
                          onPageChange={setCurrentPage}
                        />
                      )}
                    </>

                  )}
                  
                </Card.Body>
              </Card>

              {/* Modal para registro o edición */}
              <SparePartModal
                show={showModal}
                onHide={handleCloseModal}
                onSubmit={handleCreateOrUpdate}
                initialData={editingPart || undefined}
                loading={creating || updating}
                allParts={spareParts} 
              />

              {/* Toasts */}
              <Toast toasts={toasts} removeToast={removeToast} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default SparePartsPage
