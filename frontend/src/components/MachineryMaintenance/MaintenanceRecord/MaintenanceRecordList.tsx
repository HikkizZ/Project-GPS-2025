import React, { useState } from 'react';
import { Table, Button, Card, Modal } from 'react-bootstrap';
import { EstadoMantencion, MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { useUpdateMaintenanceRecord } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useUpdateMaintenanceRecord';

interface Props {
  records: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: number) => void;
  onFinish: (record: MaintenanceRecord) => void;
  onSpareParts: (record: MaintenanceRecord) => void;
  onReload: () => void;
  onAssignMecanico: (record: MaintenanceRecord) => void;
}


const MaintenanceRecordList: React.FC<Props> = ({
  records,
  onEdit,
  onDelete,
  onSpareParts,
  onFinish,
  onReload,
  onAssignMecanico,
}) => {
  

  const [detalle, setDetalle] = useState<MaintenanceRecord | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  const handleVerDetalle = (record: MaintenanceRecord) => {
    setDetalle(record);
    setShowDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setShowDetalle(false);
    setDetalle(null);
  };

  function formatEnumValue(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'en_proceso':
        return 'bg-primary';
      case 'completada':
        return 'bg-success';
      case 'irrecuperable':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  function getRazonBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'kilometraje':
        return 'bg-success';
      case 'rutina':
        return 'bg-info text-dark';
      case 'falla':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {records.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-tools fs-1 text-muted mb-3 d-block"></i>
            <h5 className="text-muted">No hay mantenciones registradas</h5>
            <p className="text-muted">Cuando se agreguen aparecerán aquí</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <i className="bi bi-wrench-adjustable-circle me-2"></i>
                Mantenciones Activas ({records.length})
              </h6>
            </div>
            <div className="table-responsive">
              <Table hover responsive className="table-sm text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Grupo</th>
                    <th>N° Chasis</th>
                    <th>Patente</th>
                    <th>Mecánico</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Entrada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((m) => (
                    <tr key={m.id}>
                      <td>{formatEnumValue(m.maquinaria.grupo)}</td>
                      <td>{m.maquinaria.numeroChasis}</td>
                      <td>{m.maquinaria.patente}</td>
                      <td>
                        {m.mecanicoAsignado?.trabajador
                          ? `${m.mecanicoAsignado.trabajador.nombres ?? ''} ${m.mecanicoAsignado.trabajador.apellidoPaterno ?? ''} ${m.mecanicoAsignado.trabajador.apellidoMaterno ?? ''}`.trim()
                          : m.mecanicoAsignado?.rut ?? 'No Asignado'}
                      </td>
                      <td><span className={`badge rounded-pill ${getRazonBadgeClass(m.razonMantencion)}`}>
                        {formatEnumValue(m.razonMantencion)}
                      </span></td>
                      <td
                        onClick={() => handleVerDetalle(m)}
                        style={{
                          maxWidth: '250px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                        title="Haz clic para ver detalle"
                      >
                        {m.descripcionEntrada}
                      </td>
                      <td>{new Date(m.fechaEntrada).toLocaleDateString()}</td>
                      <td><span className={`badge rounded-pill ${getEstadoBadgeClass(m.estado)}`}>
                        {formatEnumValue(m.estado)}
                      </span></td>
                      <td>
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <Button variant="warning" size="sm" onClick={() => onEdit(m)}>
                            Editar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => onDelete(m.id)}>
                            Eliminar
                          </Button>
                          <Button variant="info" size="sm" onClick={() => onSpareParts(m)}>
                            Repuestos
                          </Button>
                          <Button variant="success" size="sm" onClick={() => onFinish(m)}>
                            Finalizar
                          </Button>
                          <Button variant="info" size="sm" onClick={() => onAssignMecanico(m)}>
                             {m.mecanicoAsignado?.id ? "Reasignar" : "Asignar"}
                          </Button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        
        )}
        
      </Card.Body>
        
        {detalle && (
          <Modal show={showDetalle} onHide={handleCerrarDetalle} centered>
            <Modal.Header closeButton>
              <Modal.Title className='fw-bold'>Descripción</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: 'center' }}>
              <p><strong></strong> {detalle.descripcionEntrada}</p>
            </Modal.Body>
          </Modal>
        )}


    </Card>
    
  );
};

export default MaintenanceRecordList;
