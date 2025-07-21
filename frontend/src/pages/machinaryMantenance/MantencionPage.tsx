import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { getMaintenanceRecords } from '@/services/machinaryMaintenance/maintenanceRecord.service'; 
import {UpdateMaintenanceRecordData} from '@/types/machinaryMaintenance/maintenanceRecord.types'
import { useMaintenanceRecords } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords';
import { useCreateMaintenanceRecord } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useCreateMaintenanceRecord';
import { useUpdateMaintenanceRecord } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useUpdateMaintenanceRecord';
import { useDeleteMaintenanceRecord } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useDeleteMaintenanceRecord';
import MaintenanceRecordList from '@/components/MachineryMaintenance/MaintenanceRecord/MaintenanceRecordList';
import MaintenanceRecordModal from '@/components/MachineryMaintenance/MaintenanceRecord/MaintenanceRecordModal';
import '../../styles/pages/mantencionMaquinaria.css';
import { Toast, useToast } from '@/components/common/Toast';
import { updateMaintenance } from '@/services/machinaryMaintenance/maintenanceRecord.service';
import MaintenanceSparePartPanel from '@/components/MachineryMaintenance/MaintenanceSpareParts/MaintenanceSparePartPanel';

const MantencionPage: React.FC = () => {
  const { records, loading, error, reload } = useMaintenanceRecords();
  const { create, loading: creating } = useCreateMaintenanceRecord();
  const { update, loading: updating } = useUpdateMaintenanceRecord();
  const { deleteRecord, loading: deleting } = useDeleteMaintenanceRecord();

  const {
    toasts,
    removeToast,
    showSuccess,
    showError,
  } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const [showSparePartPanel, setShowSparePartPanel] = useState(false);
  const [selectedMantencionId, setSelectedMantencionId] = useState<number | null>(null);
  const [grupoMaquinariaSeleccionado, setGrupoMaquinariaSeleccionado] = useState<string>('');

      

  const handleOpenSpareParts = (mantencion: MaintenanceRecord) => {
  setSelectedMantencionId(mantencion.id);
  setGrupoMaquinariaSeleccionado(mantencion.maquinaria.grupo);
  setShowSparePartPanel(true);
  };
  const handleOpenModal = (record?: MaintenanceRecord) => {
    setEditingRecord(record || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
  };
  
  const [finishingRecord, setFinishingRecord] = useState<MaintenanceRecord | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);

      const handleOpenFinishModal = (record: MaintenanceRecord) => {
        setFinishingRecord(record);
        setShowFinishModal(true);
      };

      const handleCloseFinishModal = () => {
        setShowFinishModal(false);
        setFinishingRecord(null);
      };

      const handleFinalize = async (data: UpdateMaintenanceRecordData) => {

        if (!finishingRecord) return;
        await update(finishingRecord.id, data);

        showSuccess("Mantención finalizada", "Se ha completado la mantención");
        handleCloseFinishModal();
        reload();
      };

  const handleCreateOrUpdate = async (data: any) => {
  try{

      if (editingRecord) {
        const cleanData: any = {};

        if (data.maquinariaId) cleanData.maquinariaId = data.maquinariaId;
        if (data.mecanicoId) cleanData.mecanicoId = data.mecanicoId;
        if (data.descripcionEntrada?.trim()) cleanData.descripcionEntrada = data.descripcionEntrada.trim();
        if (data.descripcionSalida?.trim()) cleanData.descripcionSalida = data.descripcionSalida.trim();
        if (data.estado) cleanData.estado = data.estado;
        if (data.razonMantencion) cleanData.razonMantencion = data.razonMantencion;
        if (data.fechaSalida && data.fechaSalida.trim() !== '') cleanData.fechaSalida = data.fechaSalida.trim();


        if (Array.isArray(data.repuestosUtilizados)) {
          const repuestosValidos = data.repuestosUtilizados.filter(
            (rep: any) => rep.repuestoId && rep.cantidad > 0
          );
          if (repuestosValidos.length > 0) {
            cleanData.repuestosUtilizados = repuestosValidos;
          }
        }

        await update(editingRecord.id, cleanData);
        showSuccess('Mantención actualizada', 'Los cambios han sido guardados exitosamente');
      } else {
        await create(data);
        showSuccess('Mantención registrada', 'La mantención ha sido creada correctamente');
      }

      handleCloseModal();
      reload();
      
    } catch(error){
      console.error(error);
      showError('Error al guardar', 'Ocurrió un problema al guardar la mantención');
    };
  }


  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta mantención?')) {
    try {
      await deleteRecord(id);
      showSuccess('Mantención eliminada', 'Se eliminó correctamente');
      reload();
    } catch (error) {
      console.error(error);
      showError('Error al eliminar', 'No se pudo eliminar la mantención');
    }
  }
  };

  return (
    <div className="mantencion-page container mt-4">
      <div className="mantencion-header">
        <h2>Mantenciones Registradas</h2>
        <Button onClick={() => handleOpenModal()}>+ Registrar Mantención</Button>
      </div>

        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : error ? (
          <div className="text-danger">Error: {error}</div>
        ) : (
          <div className="mantencion-table">
            <MaintenanceRecordList records={records} onEdit={handleOpenModal} onDelete={handleDelete} onFinish={handleOpenFinishModal} onSpareParts={handleOpenSpareParts}/>
          </div>
        )}

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
                                cantidad: r.cantidad
                              }))
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

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MantencionPage;
