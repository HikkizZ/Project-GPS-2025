import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { CreateMaintenanceRecordData, RazonMantencion } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { userService } from '@/services/user.service';
import { maquinariaService } from '@/services/maquinaria/maquinaria.service'; // Asegúrate de tener este servicio
import { SafeUser } from '@/types';
import { Maquinaria } from '@/types/maquinaria.types'; // Define este tipo si no existe

interface Props {
  initialData?: Partial<CreateMaintenanceRecordData>;
  onSubmit: (data: CreateMaintenanceRecordData) => void;
  loading?: boolean;
}

const MaintenanceRecordForm: React.FC<Props> = ({ initialData = {}, onSubmit, loading }) => {
  const [form, setForm] = useState<CreateMaintenanceRecordData>({
    maquinariaId: 0,
    mecanicoId: 0,
    razonMantencion: RazonMantencion.RUTINA,
    descripcionEntrada: '',
    repuestosUtilizados: [],
    ...initialData,
  });

  const [mecanicos, setMecanicos] = useState<SafeUser[]>([]);
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);

  useEffect(() => {
    userService.getUsers({ role: 'Mecánico' }).then((res) => {
      setMecanicos(res.data);
    });

    maquinariaService.obtenerTodasLasMaquinarias().then((res) => {
      setMaquinarias(res.data);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'maquinariaId' || name === 'mecanicoId' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.descripcionEntrada.trim().length < 5) {
      alert('La descripción debe tener al menos 5 caracteres.');
      return;
    }
    onSubmit(form);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="maquinariaId">
        <Form.Label>Maquinaria</Form.Label>
        <Form.Select
          name="maquinariaId"
          value={form.maquinariaId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione una maquinaria</option>
          {maquinarias.map((maq) => (
            <option key={maq.id} value={maq.id}>
              {maq.patente} - {maq.marca} {maq.modelo}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
          <br></br>
      <Form.Group controlId="mecanicoId">
        <Form.Label>Mecánico</Form.Label>
        <Form.Select
          name="mecanicoId"
          value={form.mecanicoId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un mecánico</option>
          {mecanicos.map((mecanico) => (
            <option key={mecanico.id} value={mecanico.id}>
              {mecanico.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
          <br></br>
      <Form.Group controlId="razonMantencion">
        <Form.Label>Razón de Mantención</Form.Label>
        <Form.Select
          name="razonMantencion"
          value={form.razonMantencion}
          onChange={handleChange}
        >
          {Object.entries(RazonMantencion).map(([key, value]) => (
            <option key={key} value={value}>
              {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
          <br></br>
      <Form.Group controlId="descripcionEntrada">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="descripcionEntrada"
          value={form.descripcionEntrada}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={loading} className="mt-3">
        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar'}
      </Button>
    </Form>
  );
};

export default MaintenanceRecordForm;
