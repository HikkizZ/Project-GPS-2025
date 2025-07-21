import React from 'react';
import { Modal } from 'react-bootstrap';
import CustomerForm from './CustomerForm';
import { Customer, CreateCustomerData, UpdateCustomerData } from '@/types/stakeholders/customer.types';

interface CustomerModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData | UpdateCustomerData) => void;
  isSubmitting?: boolean;
  initialData?: Customer;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
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
        <Modal.Title>{isEditMode ? 'Editar cliente' : 'Nuevo cliente'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CustomerForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </Modal.Body>
    </Modal>
  );
};

export default CustomerModal;
