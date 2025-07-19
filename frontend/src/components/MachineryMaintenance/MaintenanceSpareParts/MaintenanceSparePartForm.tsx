import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { getSpareParts } from '@/services/machinaryMaintenance/sparePart.service';
import { createMaintenanceSparePart } from '@/services/machinaryMaintenance/maintenanceSparePart.service';
import type { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  mantencionId: number;
}

const MaintenanceSparePartForm: React.FC<Props> = ({ mantencionId }) => {
  const [repuestos, setRepuestos] = useState<SparePart[]>([]);
  const [repuestoId, setRepuestoId] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const fetchRepuestos = async () => {
      const res = await getSpareParts();
      if (res.success && res.data) {
        setRepuestos(res.data);
        setRepuestoId(res.data[0]?.id || 0); // por defecto el primero
      }
    };
    fetchRepuestos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const res = await createMaintenanceSparePart({ repuestoId, cantidad, maintenanceRecordId: mantencionId });

    if (res.success) {
      setMensaje({ tipo: 'success', texto: res.message });
      setCantidad(1);
    } else {
      setMensaje({ tipo: 'error', texto: res.message });
    }

    setLoading(false);
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-3 border p-3 rounded bg-light">
      <Form.Group className="mb-2">
        <Form.Label>Repuesto a utilizar</Form.Label>
        <Form.Select value={repuestoId} onChange={(e) => setRepuestoId(Number(e.target.value))} required>
          {repuestos.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.stock} disponibles
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Cantidad utilizada</Form.Label>
        <Form.Control
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          required
        />
      </Form.Group>

      {mensaje && (
        <Alert variant={mensaje.tipo === 'success' ? 'success' : 'danger'}>{mensaje.texto}</Alert>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" animation="border" /> : 'Registrar Repuesto'}
      </Button>
    </Form>
  );
};

export default MaintenanceSparePartForm;
