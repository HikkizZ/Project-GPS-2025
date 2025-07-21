import React from 'react';
import { Modal } from 'react-bootstrap';
import MaintenanceRecordForm from './MaintenanceRecordForm';
import { CreateMaintenanceRecordData } from '@/types/machinaryMaintenance/maintenanceRecord.types';

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: CreateMaintenanceRecordData) => void;
  initialData?: Partial<CreateMaintenanceRecordData>;
  loading?: boolean;
}

const MaintenanceRecordModal: React.FC<Props> = ({ show, onHide, onSubmit, initialData, loading }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Editar Mantención' : 'Registrar Mantención'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MaintenanceRecordForm initialData={initialData} onSubmit={onSubmit} loading={loading} />
      </Modal.Body>
    </Modal>
  );
};

export default MaintenanceRecordModal;
