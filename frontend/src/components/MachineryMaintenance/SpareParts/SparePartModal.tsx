import React from 'react';
import { Modal } from 'react-bootstrap';
import SparePartForm from './SparePartForm';
import { CreateSparePartData } from '@/types/machinaryMaintenance/sparePart.types';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: CreateSparePartData) => void;
  initialData?: Partial<CreateSparePartData>;
  loading?: boolean;
  allParts: SparePart[];
}

const SparePartModal: React.FC<Props> = ({ show, onHide, onSubmit, initialData, loading, allParts }) => {

  const handleSubmit = (formData: CreateSparePartData) => {
    const dataToSend = {
      ...formData,
      modo: 'editar',
    };

    onSubmit(dataToSend);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Editar Repuesto' : 'Registrar Repuesto'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SparePartForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
          allParts={allParts}
        />
      </Modal.Body>
    </Modal>
  );
};

export default SparePartModal;