import React from 'react';
import { Modal } from 'react-bootstrap';
import SupplierForm from './SupplierForm';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/types/stakeholders/supplier.types';

interface SupplierModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierData | UpdateSupplierData) => void;
  isSubmitting?: boolean;
  initialData?: Supplier;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  show,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData
}) => {
  const isEditMode = Boolean(initialData);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Editar proveedor' : 'Nuevo proveedor'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SupplierForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </Modal.Body>
    </Modal>
  );
};

export default SupplierModal;
