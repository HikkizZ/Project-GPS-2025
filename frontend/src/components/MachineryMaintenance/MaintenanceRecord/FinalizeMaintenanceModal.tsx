import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { UpdateMaintenanceRecordData } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { Toast, useToast } from "@/components/common/Toast"
interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: UpdateMaintenanceRecordData) => void;
  loading?: boolean;
  fechaEntrada: string;
  estadoActual: string;
}

const FinalizeMaintenanceModal: React.FC<Props> = ({ show, onHide, onSubmit, loading, estadoActual, fechaEntrada }) => {
  const [fechaSalida, setFechaSalida] = useState('');
  const [descripcionSalida, setDescripcionSalida] = useState('');
  const { showError, showSuccess } = useToast();

    const handleSubmit = () => {

      
      if (!fechaSalida || !descripcionSalida.trim()) {
        showError('Error',`Por favor completa todos los campos.`);
        return;
      }

      const entrada = new Date(fechaEntrada).toISOString().split('T')[0];
      const salida = new Date(fechaSalida).toISOString().split('T')[0];
      if ( salida < entrada) {
        showError('Error Fecha',`La fecha de salida no puede ser anterior a la fecha de entrada.`);
        return;
      }
    
    onSubmit({
      fechaSalida,
      descripcionSalida: descripcionSalida.trim(),
    }); 
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Finalizar Mantención</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Salida</Form.Label>
            <Form.Control
              type="date"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción Final</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descripcionSalida}
              onChange={(e) => setDescripcionSalida(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="success" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Finalizar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FinalizeMaintenanceModal;
