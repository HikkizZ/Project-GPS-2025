// src/components/MachineryMaintenance/MaintenanceRecord/CompletedMaintenanceList.tsx

import React from 'react';
import { Table } from 'react-bootstrap';
import type { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import type { MaintenanceSparePart } from '@/types/machinaryMaintenance/maintenanceSparePart.types';


interface Props {
  records: MaintenanceRecord[];
}

const ListCompleteMaintenance: React.FC<Props> = ({ records }) => {
    console.log("Repuestos utilizados de todos los records:", records.map(r => r.repuestosUtilizados));
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Patente</th>
          <th>Modelo</th>
          <th>Grupo</th>
          <th>Chasis</th>
          <th>Mecánico</th>
          <th>Fecha Entrada</th>
          <th>Fecha Salida</th>
          <th>Descripción Entrada</th>
          <th>Descripción Salida</th>
          <th>Repuestos</th>
          <th>Cantidad Utilizada</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {records.length === 0 ? (
          <tr>
            <td colSpan={9} style={{ textAlign: 'center' }}>
              No hay mantenciones completadas.
            </td>
          </tr>
        ) : (
          records.map((record, index) => (
            <tr key={record.id}>
              <td>{record.maquinaria.patente}</td>
              <td>{record.maquinaria.modelo}</td>
              <td>{record.maquinaria.grupo}</td>
              <td>{record.maquinaria.numeroChasis}</td>
              <td>{
                record.mecanicoAsignado.trabajador
                  ? `${record.mecanicoAsignado.trabajador.nombres} ${record.mecanicoAsignado.trabajador.apellidoPaterno}`
                  : record.mecanicoAsignado.rut
              }</td>
              <td>{new Date(record.fechaEntrada).toLocaleDateString()}</td>
              <td>{record.fechaSalida ? new Date(record.fechaSalida).toLocaleDateString() : '-'}</td>
              <td>{record.descripcionEntrada}</td>
              <td>{record.descripcionSalida}</td>
                <td>
                    <ul>
                        {(record.repuestosUtilizados as any[]).map((item) => (
                        <li key={item.id}>
                            {'repuesto' in item ? item.repuesto.name : item.nombre}
                        </li>
                        ))}
                    </ul>
                </td>
                <td>
                    <ul>
                        {(record.repuestosUtilizados as any[]).map((item) => (
                        <li key={item.id}>
                            {'cantidadUtilizada' in item ? item.cantidadUtilizada : item.cantidad}
                        </li>
                        ))}
                    </ul>
                </td>

              <td>{record.estado}</td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default ListCompleteMaintenance;
