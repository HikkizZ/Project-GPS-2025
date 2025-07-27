import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
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

  const handleSave = () => {
    if (selectedId) onSubmit(selectedId);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Asignar Mecánico</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="mecanicoSelect">
          <Form.Label>Seleccione un mecánico</Form.Label>
          <Form.Select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {mecanicos.length === 0 ? (
              <option disabled value="">No hay mecánicos disponibles</option>
            ) : (
              <>
                <option value="">-- Seleccionar --</option>
                {mecanicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres ?? "?"} {m.apellidoPaterno ?? ""} {m.apellidoMaterno ?? ""}
                  </option>
                ))}
              </>
            )}
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
