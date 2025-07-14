import React, { useEffect, useState } from 'react';
import { getMantenciones } from '../../services/mantencion.service';
import { Table } from 'react-bootstrap';

const MantencionPage: React.FC = () => {
  const [mantenciones, setMantenciones] = useState([]);

  useEffect(() => {
    getMantenciones().then(setMantenciones);
  }, []);

  return (
    <div className="container mt-4">
      <h2>Mantenciones Registradas</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Máquina</th>
            <th>Mecánico</th>
            <th>Tipo</th>
            <th>Fecha Entrada</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {mantenciones.map((m: any) => (
            <tr key={m.id}>
              <td>{m.maquinaria?.patente}</td>
              <td>{m.mecanicoAsignado?.name}</td>
              <td>{m.tipoMantencion}</td>
              <td>{new Date(m.fechaEntrada).toLocaleDateString()}</td>
              <td>{m.estado}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MantencionPage;
