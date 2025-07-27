import React, { useState } from 'react';
import { Table, Button, Card, Modal } from 'react-bootstrap';
import { EstadoMantencion, MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { useUpdateMaintenanceRecord } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useUpdateMaintenanceRecord';
import { useAuth } from "@/context/useAuth";
import ConfirmModal from "@/components/common/ConfirmModal";


interface Props {
  records: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: number) => void;
  onFinish: (record: MaintenanceRecord) => void;
  onSpareParts: (record: MaintenanceRecord) => void;
  onReload: () => void;
  onAssignMecanico: (record: MaintenanceRecord) => void;
  onAccept: (record: MaintenanceRecord) => void;
}


const MaintenanceRecordList: React.FC<Props> = ({
  records,
  onEdit,
  onDelete,
  onSpareParts,
  onFinish,
  onReload,
  onAssignMecanico,
  onAccept,
}) => {
  

  const [detalle, setDetalle] = useState<MaintenanceRecord | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const { user } = useAuth();
  const { update, loading: updating } = useUpdateMaintenanceRecord();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);

  const handleShowConfirmDelete = (record: MaintenanceRecord) => {
    setRecordToDelete(record);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete.id);
      setShowConfirmModal(false);
      setRecordToDelete(null);
    }
  };



  

  const handleAcceptMaintenance = async (record: MaintenanceRecord) => {
    if (!user?.id) return;
      console.log("Usuario logueado:", user);

    try {
      await update(record.id, {
        mecanicoId: user.id,
      });
      onReload();
    } catch (error) {
      console.error("Error al asignar mecánico:", error);
    }
  };


  

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
                          {user?.role === "SuperAdministrador" && (
                            <>
                              <Button variant="warning" size="sm" onClick={() => onEdit(m)}>
                               <i className="bi bi-pencil"></i>
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleShowConfirmDelete(m)}>
                                <i className="bi bi-trash"></i>
                              </Button>
                            </>
                          )}

                          {(user?.role === "Mecánico") && m.estado == "en_proceso" && (
                            <Button variant="info" size="sm" onClick={() => onSpareParts(m)}>
                              <i className="bi bi-tools me-1"></i>
                            </Button>
                          )}

                          {(user?.role === "Mecánico" || user?.role === "Mantenciones de Maquinaria") &&
                            m.estado !== "completada" &&
                            m.estado !== "irrecuperable" &&
                            m.mecanicoAsignado?.id &&
                            m.repuestosUtilizados?.length > 0 && (
                              <Button variant="success" size="sm" onClick={() => onFinish(m)}>
                                 <i className="bi bi-check-circle me-1"></i>
                              </Button>
                          )}

                         {(user?.role === "Mecánico") &&
                            !m.mecanicoAsignado && m.estado === "pendiente" && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onAccept(m)}
                              >
                                <i className="bi bi-person-check"></i> Aceptar Mantención
                              </Button>
                          )}

                          {(user?.role === "Mantenciones de Maquinaria") && (
                            <Button variant="info" size="sm" onClick={() => onAssignMecanico(m)}>
                               <i className="bi bi-box-arrow-in-right me-1"></i>
                              {m.mecanicoAsignado?.id ? "Reasignar" : "Asignar"}
                            </Button>
                          )}
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

      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar mantención?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        headerVariant="danger"
        headerIcon="bi-exclamation-triangle-fill"
        confirmIcon="bi-trash"
        cancelIcon="bi-x-circle"
        warningContent={
          <>
            <p className="mb-2 mt-1">Esta acción:</p>
            <ul className="mb-0">
              <li>Eliminará la mantención del sistema permanentemente.</li>
              <li>No podrás recuperarla una vez eliminada.</li>
            </ul>
          </>
        }
      >
        <div className="mb-3 p-3 bg-light rounded-3">
          <p className="mb-2 fw-semibold">
            ¿Estás seguro de que deseas eliminar la mantención?
          </p>
          <div className="d-flex flex-column gap-1">
            <div>
              <span className="fw-semibold text-muted">Grupo de maquinaria:</span>{" "}
              <span className="ms-2">{recordToDelete?.maquinaria?.grupo ?? "N/A"}</span>
            </div>
            <div>
              <span className="fw-semibold text-muted">Patente:</span>{" "}
              <span className="ms-2">{recordToDelete?.maquinaria?.patente ?? "N/A"}</span>
            </div>
          </div>
        </div>
      </ConfirmModal>




    </Card>
    
  );
};

export default MaintenanceRecordList;
