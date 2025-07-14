import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';
import {GrupoMaquinaria} from '../../../types/maquinaria/grupoMaquinaria.types'
import { updateSparePart } from '@/services/machinaryMaintenance/sparePart.service';

interface EditarSparePartModalProps {
  show: boolean;
  onHide: () => void;
  sparePart: SparePart | null;
  onUpdated: () => void;
}

export default function EditarSparePartModal({ show, onHide, sparePart, onUpdated }: EditarSparePartModalProps) {
  const [formData, setFormData] = useState<Partial<SparePart>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sparePart) {
      setFormData({ ...sparePart });
      setError(null);
    }
  }, [sparePart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'anio' || name === 'stock' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.id) return;

    setSaving(true);
    const { success, message } = await updateSparePart(formData.id, formData);
    setSaving(false);

    if (success) {
      onUpdated();
      onHide();
    } else {
      setError(message || 'Error al actualizar repuesto');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Repuesto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control name="name" value={formData.name || ''} onChange={handleChange} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Marca</Form.Label>
            <Form.Control name="marca" value={formData.marca || ''} onChange={handleChange} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Modelo</Form.Label>
            <Form.Control name="modelo" value={formData.modelo || ''} onChange={handleChange} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Año</Form.Label>
            <Form.Control type="number" name="anio" value={formData.anio || ''} onChange={handleChange} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Grupo</Form.Label>
            <Form.Select name="grupo" value={formData.grupo || ''} onChange={handleChange}>
              {Object.values(GrupoMaquinaria).map((grupo) => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Stock</Form.Label>
            <Form.Control type="number" name="stock" value={formData.stock || ''} onChange={handleChange} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
