import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';
import { useSpareParts } from '@/hooks/MachinaryMaintenance/SparePart/useSpareParts';
import { useCreateSparePart } from '@/hooks/MachinaryMaintenance/SparePart/useCreateSparePart';
import { useUpdateSparePart } from '@/hooks/MachinaryMaintenance/SparePart/useUpdateSparePart';
import { useDeleteSparePart } from '@/hooks/MachinaryMaintenance/SparePart/useDeleteSparePart';
import ListSparePart from '@/components/MachineryMaintenance/SpareParts/ListSparePart';
import SparePartModal from '@/components/MachineryMaintenance/SpareParts/SparePartModal';
import { Toast, useToast } from '@/components/common/Toast';

const SparePartsPage: React.FC = () => {
  const { spareParts, loading, error, reload } = useSpareParts();
  const { create, loading: creating } = useCreateSparePart();
  const { updateSparePart, loading: updating } = useUpdateSparePart();
  const { deleteSparePart, loading: deleting } = useDeleteSparePart();

  const {
    toasts,
    removeToast,
    showSuccess,
    showError
  } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const handleOpenModal = (part?: SparePart) => {
    setEditingPart(part || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingPart(null);
    setShowModal(false);
  };

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingPart) {
        await updateSparePart(editingPart.id, data);
        showSuccess('Repuesto actualizado', 'Los cambios han sido guardados');
      } else {
        await create(data);
        showSuccess('Repuesto creado', 'Se registró correctamente');
      }

      handleCloseModal();
      reload();
    } catch (error) {
      console.error(error);
      showError('Error al guardar', 'Ocurrió un problema al registrar el repuesto');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este repuesto?')) {
      try {
        await deleteSparePart(id);
        showSuccess('Repuesto eliminado', 'Se eliminó correctamente');
        reload();
      } catch (error) {
        console.error(error);
        showError('Error al eliminar', 'No se pudo eliminar el repuesto');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Repuestos</h2>
        <Button onClick={() => handleOpenModal()}>+ Registrar Repuesto</Button>
      </div>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <div className="text-danger">Error: {error}</div>
      ) : (
        <ListSparePart data={spareParts} onEdit={handleOpenModal} onDelete={handleDelete} onReload={reload} />
      )}

      <SparePartModal
        show={showModal}
        onHide={handleCloseModal}
        onSubmit={handleCreateOrUpdate}
        initialData={editingPart || undefined}
        loading={creating || updating}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default SparePartsPage;
