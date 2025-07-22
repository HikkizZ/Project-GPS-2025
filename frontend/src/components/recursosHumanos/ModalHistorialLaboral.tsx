import React, { useState } from 'react';
import { Modal, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { HistorialLaboral } from '@/types/recursosHumanos/historialLaboral.types';

interface ModalHistorialLaboralProps {
  show: boolean;
  onHide: () => void;
  historial: HistorialLaboral[];
  loading: boolean;
  error: string | null;
  trabajadorNombre: string;
  onDescargarContrato: (historialId: number) => void;
  descargandoId?: number | null;
}

function formatFecha(fecha?: string | null) {
  if (!fecha) return '-';
  // Usar formato local para evitar problemas de zona horaria
  const [year, month, day] = fecha.split('T')[0].split('-');
  return `${day}-${month}-${year}`;
}

function formatSueldo(sueldo: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(sueldo);
}

function getEstadoBadge(estado?: string | null) {
  if (!estado) return <Badge bg="secondary">-</Badge>;
  const color =
    estado.toLowerCase().includes('activo') ? 'success' :
    estado.toLowerCase().includes('licencia') ? 'warning' :
    estado.toLowerCase().includes('permiso') ? 'info' :
    estado.toLowerCase().includes('desvinculado') ? 'danger' :
    'secondary';
  return <Badge bg={color}>{estado}</Badge>;
}

function formatSeguroCesantia(seguro?: boolean | null) {
  if (seguro === null || seguro === undefined) return '-';
  return seguro ? <Badge bg="success">Sí</Badge> : <Badge bg="danger">No</Badge>;
}

export const ModalHistorialLaboral: React.FC<ModalHistorialLaboralProps> = ({
  show,
  onHide,
  historial,
  loading,
  error,
  trabajadorNombre,
  onDescargarContrato,
  descargandoId
}) => {
  // Estado para el modal de información del revisor
  const [showRevisorModal, setShowRevisorModal] = useState(false);
  const [revisorSeleccionado, setRevisorSeleccionado] = useState<any>(null);

  const mostrarInfoRevisor = (revisor: any) => {
    if (revisor) {
      setRevisorSeleccionado(revisor);
      setShowRevisorModal(true);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="modal-enhanced">
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <i className="bi bi-clock-history me-2"></i>
          Historial Laboral de <span className="text-primary">{trabajadorNombre}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando historial laboral...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        ) : historial.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-archive display-1 text-muted"></i>
            <h5 className="mt-3">No hay historial laboral registrado</h5>
            <p className="text-muted">Este trabajador no tiene registros históricos.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Cargo</th>
                  <th>Área</th>
                  <th>Tipo Contrato</th>
                  <th>Jornada</th>
                  <th>Sueldo Base</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>AFP</th>
                  <th>Previsión Salud</th>
                  <th>Seguro Cesantía</th>
                  <th>Fecha Inicio Solicitud</th>
                  <th>Fecha Fin Solicitud</th>
                  <th>Motivo Solicitud</th>
                  <th>Motivo Desvinculación</th>
                  <th>Observaciones</th>
                  <th>Registrado Por</th>
                  <th>Contrato</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(item => (
                  <tr key={item.id}>
                    <td>{item.cargo}</td>
                    <td>{item.area}</td>
                    <td>{item.tipoContrato}</td>
                    <td>{item.jornadaLaboral}</td>
                    <td>{formatSueldo(item.sueldoBase)}</td>
                    <td>{formatFecha(item.fechaInicio)}</td>
                    <td>{formatFecha(item.fechaFin)}</td>
                    <td>{getEstadoBadge(item.estado)}</td>
                    <td>{item.afp || '-'}</td>
                    <td>{item.previsionSalud || '-'}</td>
                    <td>{formatSeguroCesantia(item.seguroCesantia)}</td>
                    <td>{formatFecha(item.fechaInicioLicencia)}</td>
                    <td>{formatFecha(item.fechaFinLicencia)}</td>
                    <td>{item.motivoLicencia || '-'}</td>
                    <td>{item.motivoDesvinculacion || '-'}</td>
                    <td>{item.observaciones || '-'}</td>
                    <td>
                      {item.registradoPor ? (
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold">{item.registradoPor.name}</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-1"
                            onClick={e => {
                              e.stopPropagation();
                              mostrarInfoRevisor(item.registradoPor);
                            }}
                            title="Ver información del usuario"
                          >
                            <i className="bi bi-info-circle text-primary"></i>
                          </Button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {item.contratoURL ? (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => onDescargarContrato(item.id)}
                          disabled={descargandoId === item.id}
                        >
                          {descargandoId === item.id ? (
                            <>
                              <Spinner size="sm" className="me-1" />
                              Descargando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-download me-1"></i>
                              Descargar
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <i className="bi bi-x-circle me-2"></i>
          Cerrar
        </Button>
      </Modal.Footer>
      {/* Modal de información del revisor */}
      <Modal
        show={showRevisorModal}
        onHide={() => setShowRevisorModal(false)}
        centered
        dialogClassName="modal-revisor"
      >
        <Modal.Header closeButton className="bg-gradient-primary text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-person-badge me-2"></i>
            Información del Revisor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {revisorSeleccionado && (
            <div>
              <div className="mb-3">
                <div className="text-secondary mb-1">Nombre completo</div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-circle text-primary me-2"></i>
                  {revisorSeleccionado.name}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-secondary mb-1">Rol</div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-badge text-primary me-2"></i>
                  {revisorSeleccionado.role === 'SuperAdministrador' ? 'Super Administrador Sistema' : revisorSeleccionado.role}
                </div>
              </div>
              {revisorSeleccionado.rut && (
                <div className="mb-3">
                  <div className="text-secondary mb-1">RUT</div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-vcard text-primary me-2"></i>
                    {revisorSeleccionado.rut}
                  </div>
                </div>
              )}
              <div className="mb-3">
                <div className="text-secondary mb-1">Correo Corporativo</div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope text-primary me-2"></i>
                  <a href={`mailto:${revisorSeleccionado.corporateEmail}`} className="text-decoration-none text-primary">
                    {revisorSeleccionado.corporateEmail}
                  </a>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
      <style>{`
        .modal-revisor {
          max-width: 400px;
        }
        .modal-revisor .modal-content {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .bg-gradient-primary {
          background: linear-gradient(45deg, #0d6efd, #0a58ca);
        }
        .modal-revisor .modal-header .btn-close {
          color: white;
          opacity: 1;
        }
      `}</style>
    </Modal>
  );
}; 