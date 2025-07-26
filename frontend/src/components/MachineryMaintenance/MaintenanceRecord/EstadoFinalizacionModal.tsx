import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onSelectEstado: (estado: 'completada' | 'irrecuperable') => void;
}

const EstadoFinalizacionModal: React.FC<Props> = ({ show, onHide, onSelectEstado }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>¿Cómo deseas finalizar la mantención?</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>Selecciona el estado final de la mantención</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button variant="success" onClick={() => onSelectEstado('completada')}>
            Completada
          </Button>
          <Button variant="danger" onClick={() => onSelectEstado('irrecuperable')}>
            Irrecuperable
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EstadoFinalizacionModal;
