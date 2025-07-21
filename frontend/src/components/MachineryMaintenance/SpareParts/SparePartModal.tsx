import React from 'react';
import { Modal } from 'react-bootstrap';
import SparePartForm from './SparePartForm';
import { CreateSparePartData } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: CreateSparePartData) => void;
  initialData?: Partial<CreateSparePartData>;
  loading?: boolean;
}

const SparePartModal: React.FC<Props> = ({ show, onHide, onSubmit, initialData, loading }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Editar Repuesto' : 'Registrar Repuesto'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SparePartForm
          initialData={initialData}
          onSubmit={onSubmit}
          loading={loading}
        />
      </Modal.Body>
    </Modal>
  );
};

export default SparePartModal;
