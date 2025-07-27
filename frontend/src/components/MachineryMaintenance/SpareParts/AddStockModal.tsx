import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  show: boolean;
  onHide: () => void;
  repuesto: SparePart | null;
  onConfirm: (id: number, cantidad: number) => void;
}

const AddStockModal: React.FC<Props> = ({ show, onHide, repuesto, onConfirm }) => {
  const [cantidad, setCantidad] = useState(0);

  const handleSubmit = () => {
    if (repuesto && cantidad > 0) {
      onConfirm(repuesto.id, cantidad);
      setCantidad(0);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Repuesto: {repuesto?.name}</Form.Label>
          <Form.Control
            type="number"
             value={cantidad === 0 ? '' : cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            placeholder="Cantidad a agregar"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>Agregar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddStockModal;
