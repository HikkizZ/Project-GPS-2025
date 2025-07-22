"use client"

import type React from "react"
import { useState } from "react"
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import type { MaintenanceRecord } from "@/types/machinaryMaintenance/maintenanceRecord.types"
import type { UpdateMaintenanceRecordData } from "@/types/machinaryMaintenance/maintenanceRecord.types"
import { useMaintenanceRecords } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords"
import { useCreateMaintenanceRecord } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useCreateMaintenanceRecord"
import { useUpdateMaintenanceRecord } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useUpdateMaintenanceRecord"
import { useDeleteMaintenanceRecord } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useDeleteMaintenanceRecord"
import MaintenanceRecordList from "@/components/MachineryMaintenance/MaintenanceRecord/MaintenanceRecordList"
import MaintenanceRecordModal from "@/components/MachineryMaintenance/MaintenanceRecord/MaintenanceRecordModal"
import "@/styles/pages/mantencionMaquinaria.css"
import { Toast, useToast } from "@/components/common/Toast"
import MaintenanceSparePartPanel from "@/components/MachineryMaintenance/MaintenanceSpareParts/MaintenanceSparePartPanel"
import FinalizeMaintenanceModal from '@/components/MachineryMaintenance/MaintenanceRecord/FinalizeMaintenanceModal';
import MaintenanceSidebar from "@/components/MachineryMaintenance/MaintenanceSidebar";

const MantencionPage: React.FC = () => {
  const { records, loading, error, reload } = useMaintenanceRecords()
  const { create, loading: creating } = useCreateMaintenanceRecord()
  const { update, loading: updating } = useUpdateMaintenanceRecord()
  const { deleteRecord, loading: deleting } = useDeleteMaintenanceRecord()

  const { toasts, removeToast, showSuccess, showError } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [showSparePartPanel, setShowSparePartPanel] = useState(false)
  const [finishingRecord, setFinishingRecord] = useState<MaintenanceRecord | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedMantencionId, setSelectedMantencionId] = useState<number | null>(null)
  const [grupoMaquinariaSeleccionado, setGrupoMaquinariaSeleccionado] = useState<string>("")

  const handleOpenSpareParts = (mantencion: MaintenanceRecord) => {
    setSelectedMantencionId(mantencion.id)
    setGrupoMaquinariaSeleccionado(mantencion.maquinaria.grupo)
    setShowSparePartPanel(true)
  }

  const handleOpenModal = (record?: MaintenanceRecord) => {
    setEditingRecord(record || null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRecord(null)
  }

  

    const handleOpenFinishModal = (record: MaintenanceRecord) => {
      setFinishingRecord(record);
      setShowFinishModal(true);
    };

    const handleCloseFinishModal = () => {
      setFinishingRecord(null);
      setShowFinishModal(false);
    };

    const handleFinalize = async (data: any) => {

      if (!finishingRecord) return;

      await update(finishingRecord.id, data);

      showSuccess("Mantención finalizada", "Se ha completado la mantención");
      handleCloseFinishModal();
      reload();
    };

    const handleCreateOrUpdate = async (data: any) => {
      try {
        if (editingRecord) {
          const cleanData: any = {}

          if (data.maquinariaId) cleanData.maquinariaId = data.maquinariaId
          if (data.mecanicoId) cleanData.mecanicoId = data.mecanicoId
          if (data.descripcionEntrada?.trim()) cleanData.descripcionEntrada = data.descripcionEntrada.trim()
          if (data.descripcionSalida?.trim()) cleanData.descripcionSalida = data.descripcionSalida.trim()
          if (data.estado) cleanData.estado = data.estado
          if (data.razonMantencion) cleanData.razonMantencion = data.razonMantencion
          if (data.fechaSalida && data.fechaSalida.trim() !== "") cleanData.fechaSalida = data.fechaSalida.trim()

          if (Array.isArray(data.repuestosUtilizados)) {
            const repuestosValidos = data.repuestosUtilizados.filter((rep: any) => rep.repuestoId && rep.cantidad > 0)
            if (repuestosValidos.length > 0) {
              cleanData.repuestosUtilizados = repuestosValidos
            }
          }

          await update(editingRecord.id, cleanData)
          showSuccess("Mantención actualizada", "Los cambios han sido guardados exitosamente")
        } else {
          await create(data)
          showSuccess("Mantención registrada", "La mantención ha sido creada correctamente")
        }

        handleCloseModal()
        reload()
      } catch (error) {
        console.error(error)
        showError("Error al guardar", "Ocurrió un problema al guardar la mantención")
      }
    }

    const handleDelete = async (id: number) => {
      if (confirm("¿Estás seguro de que deseas eliminar esta mantención?")) {
        try {
          await deleteRecord(id)
          showSuccess("Mantención eliminada", "Se eliminó correctamente")
          reload()
        } catch (error) {
          console.error(error)
          showError("Error al eliminar", "No se pudo eliminar la mantención")
        }
      }
    }

   return (
     <div className="d-flex">
      <MaintenanceSidebar />
      <div className="flex-grow-1"></div>
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-tools fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Registro de Mantenciones</h3>
                    <p className="mb-0 opacity-75">
                      Administra mantenciones activas y realiza nuevos registros
                    </p>
                  </div>
                </div>
                <Button variant="light" onClick={() => handleOpenModal()}>
                <i className="bi bi-plus-circle me-2"></i>
                Registrar Mantención
              </Button>
              </div>
            </Card.Header>
          </Card>

          {/* Contenido principal */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Lista de Mantenciones
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando mantenciones...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              ) : (
                <MaintenanceRecordList
                  records={records}
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                  onFinish={handleOpenFinishModal}
                  onSpareParts={handleOpenSpareParts}
                  onReload={reload}
                />
              )}
            </Card.Body>
          </Card>

          {/* Modales */}
          <MaintenanceRecordModal
            show={showModal}
            onHide={handleCloseModal}
            onSubmit={handleCreateOrUpdate}
            initialData={
              editingRecord
                ? {
                    ...editingRecord,
                    repuestosUtilizados: editingRecord.repuestosUtilizados.map((r) => ({
                      repuestoId: r.id,
                      cantidad: r.cantidad,
                    })),
                  }
                : undefined
            }
            loading={creating || updating}
          />

          {selectedMantencionId !== null && (
            <MaintenanceSparePartPanel
              mantencionId={selectedMantencionId}
              grupoMaquinaria={grupoMaquinariaSeleccionado}
              show={showSparePartPanel}
              onHide={() => setShowSparePartPanel(false)}
              onReload={reload}
            />
          )}

          <FinalizeMaintenanceModal
            show={showFinishModal}
            onHide={handleCloseFinishModal}
            onSubmit={handleFinalize}
            loading={updating}
            fechaEntrada={finishingRecord?.fechaEntrada?.toString().split("T")[0] ?? ""}
            estadoActual={finishingRecord?.estado ?? ""}
          />

          {/* Toasts */}
          <Toast toasts={toasts} removeToast={removeToast} />
        </Col>
      </Row>
    </Container>
    </div>
  );
}

export default MantencionPage