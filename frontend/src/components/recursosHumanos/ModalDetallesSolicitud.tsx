import React from 'react';
import { Modal, Card, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';
import { LicenciaPermiso, TipoSolicitud, EstadoSolicitud } from '@/types/recursosHumanos/licenciaPermiso.types';

interface ModalDetallesSolicitudProps {
  show: boolean;
  onHide: () => void;
  solicitud: LicenciaPermiso | null;
  onAprobar?: (solicitud: LicenciaPermiso) => void;
  onRechazar?: (solicitud: LicenciaPermiso) => void;
  onDescargarArchivo?: (solicitud: LicenciaPermiso) => void;
  descargandoId?: number | null;
  procesandoId?: number | null;
}

export const ModalDetallesSolicitud: React.FC<ModalDetallesSolicitudProps> = ({
  show,
  onHide,
  solicitud,
  onAprobar,
  onRechazar,
  onDescargarArchivo,
  descargandoId,
  procesandoId
}) => {
  if (!solicitud) return null;

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Formatear fecha y hora
  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular días
  const calcularDias = (fechaInicio: string, fechaFin: string) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  };

  // Obtener color del badge según estado
  const getEstadoColor = (estado: EstadoSolicitud) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Aprobada': return 'success';
      case 'Rechazada': return 'danger';
      default: return 'secondary';
    }
  };

  // Obtener color del tipo
  const getTipoColor = (tipo: TipoSolicitud) => {
    return tipo === TipoSolicitud.LICENCIA ? 'info' : 'secondary';
  };

  // Obtener icono según tipo
  const getTipoIcon = (tipo: TipoSolicitud) => {
    return tipo === TipoSolicitud.LICENCIA ? 'bi-heart-pulse' : 'bi-calendar-event';
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="modal-enhanced">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <i className={`bi ${getTipoIcon(solicitud.tipo)} me-3 fs-4`}></i>
          <div>
            <span>Detalles de Solicitud</span>
            <small className="d-block text-white-50 mt-1">
              {solicitud.tipo} • ID: {solicitud.id}
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Estado actual */}
        <div className="mb-4 text-center">
          <Badge 
            bg={getEstadoColor(solicitud.estado)} 
            className="badge-enhanced fs-6 px-4 py-2"
          >
            <i className={`bi ${solicitud.estado === 'Pendiente' ? 'bi-clock' : solicitud.estado === 'Aprobada' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
            {solicitud.estado}
          </Badge>
        </div>

        {/* Información del trabajador */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="info-card border-primary h-100">
              <Card.Header className="bg-primary text-white">
                <i className="bi bi-person-circle me-2"></i>
                Información del Trabajador
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong className="text-primary">Nombre Completo:</strong>
                  <div className="mt-1">
                    {solicitud.trabajador.nombres} {solicitud.trabajador.apellidoPaterno} {solicitud.trabajador.apellidoMaterno}
                  </div>
                </div>
                <div className="mb-3">
                  <strong className="text-primary">RUT:</strong>
                  <div className="mt-1 font-monospace">{solicitud.trabajador.rut}</div>
                </div>
                <div className="mb-3">
                  <strong className="text-primary">Correo Corporativo:</strong>
                  <div className="mt-1">
                    <a href={`mailto:${solicitud.trabajador.correo}`} className="text-decoration-none">
                      <i className="bi bi-envelope me-1"></i>
                      {solicitud.trabajador.correo}
                    </a>
                  </div>
                </div>
                <div>
                  <strong className="text-primary">Teléfono:</strong>
                  <div className="mt-1">
                    <a href={`tel:${solicitud.trabajador.telefono}`} className="text-decoration-none">
                      <i className="bi bi-telephone me-1"></i>
                      {solicitud.trabajador.telefono}
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="info-card border-info h-100">
              <Card.Header className="bg-info text-white">
                <i className="bi bi-calendar-range me-2"></i>
                Detalles de la Solicitud
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong className="text-info">Tipo de Solicitud:</strong>
                  <div className="mt-2">
                    <Badge bg={getTipoColor(solicitud.tipo)} className="badge-enhanced">
                      <i className={`bi ${getTipoIcon(solicitud.tipo)} me-1`}></i>
                      {solicitud.tipo}
                    </Badge>
                  </div>
                </div>
                <div className="mb-3">
                  <strong className="text-info">Duración:</strong>
                  <div className="mt-1 fs-5 fw-bold text-primary">
                    {calcularDias(solicitud.fechaInicio, solicitud.fechaFin)} día{calcularDias(solicitud.fechaInicio, solicitud.fechaFin) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="mb-3">
                  <strong className="text-info">Fecha de Solicitud:</strong>
                  <div className="mt-1">{formatearFechaHora(solicitud.fechaSolicitud)}</div>
                </div>
                {solicitud.archivoAdjuntoURL && (
                  <div>
                    <strong className="text-info">Archivo Adjunto:</strong>
                    <div className="mt-2">
                      <i className="bi bi-paperclip text-success me-1"></i>
                      <span className="text-success small">Disponible para descarga</span>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Período solicitado */}
        <Card className="info-card border-success mb-4">
          <Card.Header className="bg-success text-white">
            <i className="bi bi-calendar2-range me-2"></i>
            Período Solicitado
          </Card.Header>
          <Card.Body>
            <Row className="text-center">
              <Col md={6}>
                <div className="border-end">
                  <strong className="text-success d-block">Fecha de Inicio</strong>
                  <div className="fs-4 fw-bold text-primary mt-2">
                    {formatearFecha(solicitud.fechaInicio)}
                  </div>
                  <small className="text-muted">
                    {new Date(solicitud.fechaInicio).toLocaleDateString('es-CL', { weekday: 'long' })}
                  </small>
                </div>
              </Col>
              <Col md={6}>
                <strong className="text-success d-block">Fecha de Fin</strong>
                <div className="fs-4 fw-bold text-primary mt-2">
                  {formatearFecha(solicitud.fechaFin)}
                </div>
                <small className="text-muted">
                  {new Date(solicitud.fechaFin).toLocaleDateString('es-CL', { weekday: 'long' })}
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Motivo de la solicitud */}
        <Card className="info-card border-warning mb-4">
          <Card.Header className="bg-warning text-dark">
            <i className="bi bi-chat-text me-2"></i>
            Motivo de la Solicitud
          </Card.Header>
          <Card.Body>
            <div className="p-3 bg-light rounded">
              <p className="mb-0 fst-italic">"{solicitud.motivoSolicitud}"</p>
            </div>
          </Card.Body>
        </Card>

        {/* Respuesta del encargado */}
        {solicitud.respuestaEncargado && (
          <Card className={`info-card border-${getEstadoColor(solicitud.estado)} mb-4`}>
            <Card.Header className={`bg-${getEstadoColor(solicitud.estado)} text-white`}>
              <i className="bi bi-chat-square-text me-2"></i>
              Respuesta de Recursos Humanos
            </Card.Header>
            <Card.Body>
              <div className="p-3 bg-light rounded">
                <p className="mb-3 fst-italic">"{solicitud.respuestaEncargado}"</p>
                {solicitud.revisadoPor && (
                  <div className="text-end">
                    <small className="text-muted">
                      <i className="bi bi-person-check me-1"></i>
                      Revisado por: <strong>{solicitud.revisadoPor.name}</strong>
                    </small>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Archivo adjunto */}
        {solicitud.archivoAdjuntoURL && (
          <Card className="info-card border-secondary">
            <Card.Header className="bg-secondary text-white">
              <i className="bi bi-file-earmark-arrow-down me-2"></i>
              Documento Adjunto
            </Card.Header>
            <Card.Body className="text-center py-4">
              <i className="bi bi-file-earmark-pdf fs-1 text-danger mb-3 d-block"></i>
              <h6 className="mb-3">Documento de respaldo</h6>
              <Button
                variant="success"
                size="lg"
                className="btn-enhanced"
                onClick={() => onDescargarArchivo?.(solicitud)}
                disabled={descargandoId === solicitud.id}
              >
                {descargandoId === solicitud.id ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download me-2"></i>
                    Descargar Archivo
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <div>
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            ID de solicitud: {solicitud.id}
          </small>
        </div>
        <div className="d-flex gap-2">
          {solicitud.estado === 'Pendiente' && onAprobar && onRechazar && (
            <>
              <Button 
                variant="success" 
                className="btn-enhanced"
                onClick={() => onAprobar(solicitud)}
                disabled={procesandoId === solicitud.id}
              >
                <i className="bi bi-check-circle me-2"></i>
                Aprobar
              </Button>
              <Button 
                variant="danger"
                className="btn-enhanced"
                onClick={() => onRechazar(solicitud)}
                disabled={procesandoId === solicitud.id}
              >
                <i className="bi bi-x-circle me-2"></i>
                Rechazar
              </Button>
            </>
          )}
          <Button variant="secondary" className="btn-enhanced" onClick={onHide}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}; 