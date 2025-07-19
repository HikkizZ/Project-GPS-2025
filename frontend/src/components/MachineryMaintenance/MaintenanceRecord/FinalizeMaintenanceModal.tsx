import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { UpdateMaintenanceRecordData } from '@/types/machinaryMaintenance/maintenanceRecord.types';

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: UpdateMaintenanceRecordData) => void;
  initialData?: any;
}

const FinalizeMaintenanceModal: React.FC<Props> = ({ show, onHide, onSubmit, initialData }) => {
  const [descripcionSalida, setDescripcionSalida] = React.useState('');
  const [fechaSalida, setFechaSalida] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      setDescripcionSalida(initialData.descripcionSalida || '');
      setFechaSalida(initialData.fechaSalida ? initialData.fechaSalida.slice(0, 10) : '');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit({
      descripcionSalida,
      fechaSalida: fechaSalida || new Date().toISOString().slice(0, 10),
      estado: 'completada',
    });
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Finalizar Mantención</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="fechaSalida">
            <Form.Label>Fecha de Salida</Form.Label>
            <Form.Control
              type="date"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="descripcionSalida" className="mt-3">
            <Form.Label>Descripción de Salida</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descripcionSalida}
              onChange={(e) => setDescripcionSalida(e.target.value)}
              placeholder="Describe el estado final de la maquinaria..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Finalizar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FinalizeMaintenanceModal;
