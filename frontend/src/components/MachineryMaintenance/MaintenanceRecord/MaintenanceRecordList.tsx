import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';

interface Props {
  records: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: number) => void;
}

const MaintenanceRecordList: React.FC<Props> = ({ records, onEdit, onDelete }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Modelo</th>
          <th>Patente Máquina</th>
          <th>Mecánico</th>
          <th>Tipo</th>
          <th>Fecha Entrada</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
      {records.map((m) => (
        <tr key={m.id}>
          <td>{m.maquinaria?.modelo}</td>
          <td>{m.maquinaria?.patente}</td>
          <td>
            {m.mecanicoAsignado?.trabajador
              ? `${m.mecanicoAsignado.trabajador.nombres} ${m.mecanicoAsignado.trabajador.apellidoPaterno} ${m.mecanicoAsignado.trabajador.apellidoMaterno}`
              : "Sin datos"}
          </td>
          <td>{m.razonMantencion}</td>
          <td>{new Date(m.fechaEntrada).toLocaleDateString()}</td>
          <td>{m.estado}</td>
          <td>
            <Button variant="warning" size="sm" onClick={() => onEdit(m)}>Editar</Button>{' '}
            <Button variant="danger" size="sm" onClick={() => onDelete(m.id)}>Eliminar</Button>
          </td>
        </tr>
      ))}
</tbody>

    </Table>
  );
};

export default MaintenanceRecordList;
