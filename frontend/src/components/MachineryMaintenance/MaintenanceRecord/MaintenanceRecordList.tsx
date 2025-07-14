import React, { useEffect } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { useMaintenanceRecords } from '../../../hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords';
import { format } from 'date-fns';

const MaintenanceRecordList: React.FC = () => {
  const { maintenanceRecords, loading, error, reload } = useMaintenanceRecords();

  useEffect(() => {
    reload();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!maintenanceRecords.length) return <Alert variant="info">No hay mantenciones registradas</Alert>;

  return (
    <div>
      <h4>Lista de Mantenciones</h4>
      <Button variant="outline-primary" onClick={reload} className="mb-3">
        Recargar
      </Button>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Maquinaria</th>
            <th>Mecánico</th>
            <th>Tipo</th>
            <th>Fecha Entrada</th>
            <th>Fecha Salida</th>
            <th>Estado</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceRecords.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{`${m.maquinaria.patente} - ${m.maquinaria.modelo}`}</td>
              <td>{m.mecanicoAsignado?.name || '—'}</td>
              <td>{m.tipoMantencion}</td>
              <td>{m.fechaEntrada ? format(new Date(m.fechaEntrada), 'dd/MM/yyyy') : '—'}</td>
              <td>{m.fechaSalida ? format(new Date(m.fechaSalida), 'dd/MM/yyyy') : '—'}</td>
              <td>{m.estado}</td>
              <td>{m.descripcionEntrada}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MaintenanceRecordList;
