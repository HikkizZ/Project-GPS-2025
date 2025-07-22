import React from 'react';
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
                        <div>
                          <div className="fw-semibold">{item.registradoPor.name}</div>
                          <small className="text-muted">{item.registradoPor.role}</small>
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
    </Modal>
  );
}; 