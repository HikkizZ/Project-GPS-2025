import React, { useEffect, useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { MaintenanceRecord, CreateMaintenanceRecordData } from '../../../types/machinaryMaintenance/maintenanceRecord.types';
import { GrupoMaquinaria } from '../../../types/maquinaria/grupoMaquinaria.types';
import { useSpareParts } from '../../../hooks/MachinaryMaintenance/SparePart/useSpareParts';
import { useTrabajadores } from '../../../hooks/recursosHumanos/useTrabajadores';
import { useMaquinarias } from '@/hooks/mantencionMaquinaria/useMaquinarias';
import { createMaintenance } from '../../../services/machinaryMaintenance/maintenanceRecord.service';

interface Props {
  initialData?: Partial<CreateMaintenanceRecordData>;
  onSuccess?: () => void;
}

const MaintenanceRecordForm: React.FC<Props> = ({ initialData = {}, onSuccess }) => {
  const [formData, setFormData] = useState<CreateMaintenanceRecordData>({
    maquinariaId: initialData.maquinariaId || 0,
    mecanicoId: initialData.mecanicoId || 0,
    razonMantencion: initialData.razonMantencion || '',
    descripcionEntrada: initialData.descripcionEntrada || '',
    repuestosUtilizados: initialData.repuestosUtilizados || [],
  });

  const { trabajadores, loading: loadingTrabajadores } = useTrabajadores({ roles: ['Mecánico'] });
  const { maquinarias, loading: loadingMaquinarias } = useMaquinarias();
  const { spareParts } = useSpareParts();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maquinariaId' || name === 'mecanicoId' ? Number(value) : value,
    }));
  };

  const handleAddRepuesto = () => {
    setFormData(prev => ({
      ...prev,
      repuestosUtilizados: [...prev.repuestosUtilizados, { repuestoId: 0, cantidad: 1 }],
    }));
  };

  const handleRepuestoChange = (index: number, field: 'repuestoId' | 'cantidad', value: number) => {
    const repuestos = [...formData.repuestosUtilizados];
    repuestos[index][field] = value;
    setFormData(prev => ({ ...prev, repuestosUtilizados: repuestos }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { success, message } = await createMaintenance(formData);

    if (success) {
      setSuccess(true);
      onSuccess?.();
    } else {
      setError(message);
    }

    setSaving(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Mantención registrada correctamente</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Maquinaria</Form.Label>
        <Form.Select name="maquinariaId" value={formData.maquinariaId} onChange={handleChange} required>
          <option value="">Seleccionar maquinaria</option>
          {maquinarias.map(m => (
            <option key={m.id} value={m.id}>{`${m.patente} - ${m.modelo}`}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Mecánico Asignado</Form.Label>
        <Form.Select name="mecanicoId" value={formData.mecanicoId} onChange={handleChange} required>
          <option value="">Seleccionar mecánico</option>
          {trabajadores.map(t => (
            <option key={t.id} value={t.id}>{t.nombre} ({t.rut})</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Razón de Mantención</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="razonMantencion"
          value={formData.razonMantencion}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Descripción Entrada</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="descripcionEntrada"
          value={formData.descripcionEntrada}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <h5>Repuestos Utilizados</h5>
      {formData.repuestosUtilizados.map((rep, idx) => (
        <div className="d-flex gap-2 mb-2" key={idx}>
          <Form.Select
            value={rep.repuestoId}
            onChange={e => handleRepuestoChange(idx, 'repuestoId', Number(e.target.value))}
            required
          >
            <option value="">Seleccionar repuesto</option>
            {spareParts.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Form.Select>
          <Form.Control
            type="number"
            min={1}
            value={rep.cantidad}
            onChange={e => handleRepuestoChange(idx, 'cantidad', Number(e.target.value))}
            required
          />
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={handleAddRepuesto}>
        + Agregar Repuesto
      </Button>

      <div className="mt-4">
        <Button type="submit" disabled={saving}>
          {saving ? <Spinner animation="border" size="sm" /> : 'Guardar'}
        </Button>
      </div>
    </Form>
  );
};

export default MaintenanceRecordForm;
