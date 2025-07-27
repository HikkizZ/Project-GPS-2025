import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (mecanicoId: number) => void;
  mecanicos: Trabajador[];
  currentMecanicoId?: number;
}

const AssignMecanicoModal: React.FC<Props> = ({ show, onHide, onSubmit, mecanicos, currentMecanicoId }) => {
  const [selectedId, setSelectedId] = useState<number>(currentMecanicoId || 0);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const selected = mecanicos.find(m => m.usuario?.id === selectedId);
    if (!selected || selected.usuario?.role !== 'Mecánico') {
      setError('Solo puedes asignar usuarios con el rol de "Mecánico".');
      return;
    }

    setError(null);
    onSubmit(selected.usuario.id);
  };

  const mecanicosFiltrados = mecanicos.filter(
    (trab) => trab.usuario?.role?.toLowerCase() === "mecánico"
  );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Asignar Mecánico</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group controlId="mecanicoSelect">
          <Form.Label>Seleccione un mecánico</Form.Label>
          <Form.Select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            <option value="">-- Seleccionar --</option>
            {mecanicosFiltrados.map((m) => (
              <option key={m.id} value={m.usuario?.id}>
                {m.nombres ?? "?"} {m.apellidoPaterno ?? ""} {m.apellidoMaterno ?? ""}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Asignar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignMecanicoModal;
