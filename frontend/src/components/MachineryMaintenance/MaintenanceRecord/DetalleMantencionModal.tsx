import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';

interface Props {
  show: boolean;
  onHide: () => void;
  record: MaintenanceRecord | null;
}

const DetalleMantencionModal: React.FC<Props> = ({ show, onHide, record }) => {
  if (!record) return null;

  const repuestos = (record.repuestosUtilizados as any[]).map((r, idx) => {
    const nombre = 'repuesto' in r ? r.repuesto.name : r.nombre;
    const cantidad = 'cantidadUtilizada' in r ? r.cantidadUtilizada : r.cantidad;
    return <li key={idx}>{nombre} ({cantidad})</li>;
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Mantención</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered size="sm">
          <tbody>
            <tr><th>ID</th><td>{record.id}</td></tr>
            <tr><th>Maquinaria</th><td>{record.maquinaria.grupo} - {record.maquinaria.modelo} ({record.maquinaria.patente})</td></tr>
            <tr><th>Chasis</th><td>{record.maquinaria.numeroChasis}</td></tr>
            <tr><th>Mecánico</th><td>
              {record.mecanicoAsignado?.trabajador
                ? `${record.mecanicoAsignado.trabajador.nombres} ${record.mecanicoAsignado.trabajador.apellidoPaterno} ${record.mecanicoAsignado.trabajador.apellidoMaterno}`
                : record.mecanicoAsignado?.rut ?? 'N/A'}
            </td></tr>
            <tr><th>Tipo</th><td>{record.razonMantencion}</td></tr>
            <tr><th>Fecha Entrada</th><td>{new Date(record.fechaEntrada).toLocaleDateString()}</td></tr>
            <tr><th>Fecha Salida</th><td>{record.fechaSalida ? new Date(record.fechaSalida).toLocaleDateString() : '-'}</td></tr>
            <tr><th>Descripción Entrada</th><td>{record.descripcionEntrada}</td></tr>
            <tr><th>Descripción Salida</th><td>{record.descripcionSalida || '-'}</td></tr>
            <tr><th>Repuestos Usados</th><td><ul>{repuestos}</ul></td></tr>
            <tr><th>Estado</th><td><span className="badge bg-success text-uppercase">{record.estado}</span></td></tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleMantencionModal;
