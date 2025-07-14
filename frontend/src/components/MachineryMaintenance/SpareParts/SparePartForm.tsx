import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import {
  createSparePart,
  updateSparePart,
} from '../../../services/machinaryMaintenance/sparePart.service';
import type { SparePart } from '../../../types/machinaryMaintenance/sparePart.types';
import type { GrupoMaquinaria } from '../../../types/maquinaria/grupoMaquinaria.types'

interface Props {
  show: boolean;
  onHide: () => void;
  initialData?: SparePart; // Si existe, modo edición
  onSuccess?: () => void;
}

const grupoOptions: GrupoMaquinaria[] = [
  'camion_tolva',
  'batea',
  'cama_baja',
  'pluma',
  'escavadora',
  'retroexcavadora',
  'cargador_frontal',
];

const SparePartForm = ({ show, onHide, initialData, onSuccess }: Props) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    grupo: 'camion_tolva' as GrupoMaquinaria,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        stock: initialData.stock,
        marca: initialData.marca,
        modelo: initialData.modelo,
        anio: initialData.anio,
        grupo: initialData.grupo,
      });
    } else {
      setFormData({
        name: '',
        stock: 0,
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        grupo: 'camion_tolva',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'stock' || name === 'anio' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = isEdit
      ? await updateSparePart(initialData!.id, formData)
      : await createSparePart(formData);

    if (!response.success) {
      setError(response.message);
    } else {
      onSuccess?.();
      onHide();
    }

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Editar Repuesto' : 'Nuevo Repuesto'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min={0}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              name="anio"
              value={formData.anio}
              onChange={handleChange}
              required
              min={2000}
              max={new Date().getFullYear()}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Grupo Maquinaria</Form.Label>
            <Form.Select name="grupo" value={formData.grupo} onChange={handleChange} required>
              {grupoOptions.map((g) => (
                <option key={g} value={g}>
                  {g.replace('_', ' ')}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SparePartForm;
