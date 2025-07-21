import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import SupplierTable from '@/components/stakeholders/SupplierTable';
import SupplierModal from '@/components/stakeholders/SupplierModal';
import { useSuppliers } from '@/hooks/stakeholders/useSuppliers';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/types/stakeholders/supplier.types';
import { useToast } from '@/components/common/Toast';

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
  } = useSuppliers();

  const { showSuccess, showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);

  const handleCreateClick = () => {
    setEditingSupplier(undefined);
    setShowModal(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    const confirmed = confirm('¿Estás seguro que deseas eliminar este proveedor?');
    if (!confirmed) return;

    const result = await deleteSupplier(id);
    if (result.success) {
      showSuccess('Proveedor eliminado', result.message);
    } else {
      showError('Error al eliminar', result.error || 'Ocurrió un error al eliminar el proveedor.');
    }
  };

  const handleSubmit = async (data: CreateSupplierData | UpdateSupplierData) => {
    const isEdit = Boolean(editingSupplier);

    const result = isEdit
      ? await updateSupplier(editingSupplier!.id, data as UpdateSupplierData)
      : await createSupplier(data as CreateSupplierData);

    if (result.success) {
      showSuccess(isEdit ? 'Proveedor actualizado' : 'Proveedor creado', result.message);
      setShowModal(false);
    } else {
      showError('Error', result.error || 'Ocurrió un error inesperado');
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h2>Gestión de Proveedores</h2>
        </Col>
        <Col className="text-end">
          <Button onClick={handleCreateClick} variant="primary">
            <i className="bi bi-plus-lg me-1"></i>
            Nuevo proveedor
          </Button>
        </Col>
      </Row>

      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <SupplierModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingSupplier}
      />
    </Container>
  );
};
