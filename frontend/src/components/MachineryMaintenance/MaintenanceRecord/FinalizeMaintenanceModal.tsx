import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { UpdateMaintenanceRecordData, EstadoMantencion } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { Toast, useToast } from "@/components/common/Toast";

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: UpdateMaintenanceRecordData) => void;
  loading?: boolean;
  fechaEntrada: string;
  estadoActual: string;
  estadoSeleccionado: EstadoMantencion | "";
}

const FinalizeMaintenanceModal: React.FC<Props> = ({
  show,
  onHide,
  onSubmit,
  loading,
  estadoActual,
  fechaEntrada,
  estadoSeleccionado
}) => {
  const [fechaSalida, setFechaSalida] = useState('');
  const [descripcionSalida, setDescripcionSalida] = useState('');
  const { showError, showSuccess } = useToast();

  const handleSubmit = () => {
    if (!fechaSalida || !descripcionSalida.trim()) {
      showError('Error', 'Por favor completa todos los campos.');
      return;
    }

    const [entradaYear, entradaMonth, entradaDay] = fechaEntrada.split('-').map(Number);
    const [salidaYear, salidaMonth, salidaDay] = fechaSalida.split('-').map(Number);

    const fechaEntradaObj = new Date(entradaYear, entradaMonth - 1, entradaDay, 0, 0, 0);
    const fechaSalidaFija = new Date(salidaYear, salidaMonth - 1, salidaDay, 12, 0, 0);

    if (fechaSalidaFija <= fechaEntradaObj) {
      showError('Error Fecha', 'La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    onSubmit({
      fechaSalida: fechaSalidaFija.toISOString(), // ← Enviamos fecha con hora incluida
      descripcionSalida: descripcionSalida.trim(),
      estado: estadoSeleccionado as EstadoMantencion,
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
              min={fechaEntrada}
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
