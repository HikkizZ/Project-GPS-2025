import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { CreateMaintenanceRecordData, RazonMantencion } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { userService } from '@/services/user.service';
import { maquinariaService } from '@/services/maquinaria/maquinaria.service';
import { Maquinaria } from '@/types/maquinaria.types';

interface Props {
  initialData?: Partial<CreateMaintenanceRecordData>;
  onSubmit: (data: CreateMaintenanceRecordData) => void;
  loading?: boolean;
   existingRecords?: any[];
}

const MaintenanceRecordForm: React.FC<Props> = ({ initialData = {}, onSubmit, loading }) => {
  const [form, setForm] = useState<CreateMaintenanceRecordData>({
    maquinariaId: 0,
    razonMantencion: RazonMantencion.RUTINA,
    descripcionEntrada: '',
    repuestosUtilizados: [],
    ...initialData,
  });

  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [patenteSeleccionada, setPatenteSeleccionada] = useState('');
  const [numeroChasisSelecionado, setnumeroChasisSelecionado] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [maquinariasRes, mecanicosRes] = await Promise.all([
          maquinariaService.obtenerTodasLasMaquinarias(),
          userService.getUsers({ role: 'Mecánico' }),
        ]);

        const maquinarias = maquinariasRes.data || [];
        const mecanicos = mecanicosRes.data || [];

        setMaquinarias(maquinarias);

        if (initialData) {
          setForm((prev) => ({
            ...prev,
            maquinariaId: (initialData as any).maquinaria?.id ?? initialData.maquinariaId ?? 0,
            razonMantencion: initialData.razonMantencion ?? RazonMantencion.RUTINA,
            descripcionEntrada: initialData.descripcionEntrada ?? '',
            repuestosUtilizados: initialData.repuestosUtilizados ?? [],
          }));
        }

        setGrupoSeleccionado((initialData as any).maquinaria?.grupo ?? '');
        setPatenteSeleccionada((initialData as any).maquinaria?.patente ?? '');
        setnumeroChasisSelecionado((initialData as any).maquinaria?.numeroChasis ?? '');

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    }

    cargarDatos();
  }, []);

  useEffect(() => {
    const numeroChasis = maquinarias.filter(
      (m) => m.numeroChasis === numeroChasisSelecionado && m.patente === patenteSeleccionada
    );
    if (numeroChasis.length === 1) {
      setnumeroChasisSelecionado(numeroChasis[0].numeroChasis);
    }
  }, [numeroChasisSelecionado, patenteSeleccionada, maquinarias]);

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

    const maquinariaEncontrada = maquinarias.find(
      (m) =>
        m.grupo === grupoSeleccionado &&
        m.patente === patenteSeleccionada &&
        m.numeroChasis === numeroChasisSelecionado
    );

    if (!maquinariaEncontrada) {
      alert("Debe seleccionar una combinación válida de maquinaria.");
      return;
    }

    const formToSend: CreateMaintenanceRecordData = {
      maquinariaId: maquinariaEncontrada.id,
      razonMantencion: form.razonMantencion,
      descripcionEntrada: form.descripcionEntrada,
      repuestosUtilizados: form.repuestosUtilizados,
    };

    onSubmit(formToSend);
  };

  function formatGrupoNombre(grupo: string): string {
    return grupo
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="container mt-4">
        <div className="mb-3">
          <label htmlFor="selectGrupo" className="form-label">Grupo de maquinaria</label>
          <select
            id="selectGrupo"
            className="form-select form-select-lg"
            value={grupoSeleccionado}
            onChange={(e) => setGrupoSeleccionado(e.target.value)}
          >
            <option value="">Seleccione grupo</option>
            {[...new Set(maquinarias.map(m => m.grupo))].map(grupo => (
              <option key={grupo} value={grupo}>{formatGrupoNombre(grupo)}</option>
            ))}
          </select>
        </div>

        <div className="d-flex gap-3">
          <div className="flex-fill">
            <label htmlFor="selectPatente" className="form-label">Patente</label>
            <select
              id="selectPatente"
              className="form-select"
              value={patenteSeleccionada}
              onChange={(e) => setPatenteSeleccionada(e.target.value)}
            >
              <option value="">Seleccione patente</option>
              {maquinarias
                .filter(m => m.grupo === grupoSeleccionado)
                .map(m => (
                  <option key={m.id} value={m.patente}>{m.patente}</option>
                ))}
            </select>
          </div>

          <div className="flex-fill">
            <label htmlFor="selectModelo" className="form-label">Número de Chasis</label>
            <select
              id="selectModelo"
              className="form-select"
              value={numeroChasisSelecionado}
              onChange={(e) => setnumeroChasisSelecionado(e.target.value)}
            >
              <option value="">Seleccione un número de chasis</option>
              {maquinarias
                .filter(m => m.grupo === grupoSeleccionado && m.patente === patenteSeleccionada)
                .map(m => (
                  <option key={m.id} value={m.numeroChasis}>{m.numeroChasis}</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <br />



      <br />

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

      <br />

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
