"use client"

import type React from "react"
import { useState } from "react"
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap"
import type { SparePart } from "@/types/machinaryMaintenance/sparePart.types"
import { useSpareParts } from "@/hooks/MachinaryMaintenance/SparePart/useSpareParts"
import { useCreateSparePart } from "@/hooks/MachinaryMaintenance/SparePart/useCreateSparePart"
import { useUpdateSparePart } from "@/hooks/MachinaryMaintenance/SparePart/useUpdateSparePart"
import { useDeleteSparePart } from "@/hooks/MachinaryMaintenance/SparePart/useDeleteSparePart"
import ListSparePart from "@/components/MachineryMaintenance/SpareParts/ListSparePart"
import SparePartModal from "@/components/MachineryMaintenance/SpareParts/SparePartModal"
import { Toast, useToast } from "@/components/common/Toast"

const SparePartsPage: React.FC = () => {
  const { spareParts, loading, error, reload } = useSpareParts()
  const { create, loading: creating } = useCreateSparePart()
  const { updateSparePart, loading: updating } = useUpdateSparePart()
  const { deleteSparePart, loading: deleting } = useDeleteSparePart()

  const { toasts, removeToast, showSuccess, showError } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingPart, setEditingPart] = useState<SparePart | null>(null)

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
    if (confirm("¿Estás seguro de eliminar este repuesto?")) {
      try {
        await deleteSparePart(id)
        showSuccess("Repuesto eliminado", "Se eliminó correctamente")
        reload()
      } catch (error) {
        console.error(error)
        showError("Error al eliminar", "No se pudo eliminar el repuesto")
      }
    }
  }

  return (
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
                <Button variant="light" onClick={() => handleOpenModal()} className="d-flex align-items-center">
                <i className="bi bi-plus-circle me-2"></i>
                Registrar Repuesto
              </Button>
              </div>
            </Card.Header>
          </Card>

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
                <ListSparePart data={spareParts} onEdit={handleOpenModal} onDelete={reload} onReload={reload} />
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
          />

          {/* Toasts */}
          <Toast toasts={toasts} removeToast={removeToast} />
        </Col>
      </Row>
    </Container>
  );
}

export default SparePartsPage