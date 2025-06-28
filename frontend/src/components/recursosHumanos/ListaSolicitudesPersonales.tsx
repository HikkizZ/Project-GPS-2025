import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import { useLicenciasPermisos } from '@/hooks/recursosHumanos/useLicenciasPermisos';
import { licenciaPermisoService } from '@/services/recursosHumanos/licenciaPermiso.service';
import { 
  LicenciaPermiso, 
  TipoSolicitud, 
  EstadoSolicitud 
} from '@/types/recursosHumanos/licenciaPermiso.types';
import { Toast, useToast } from '@/components/common/Toast';
import { ModalDetallesSolicitud } from './ModalDetallesSolicitud';

// Configuración estable fuera del componente
const HOOK_OPTIONS_PERSONAL = { autoLoad: true, tipoVista: 'mis-solicitudes' as const };

interface ListaSolicitudesPersonalesProps {
  onNuevaSolicitud?: () => void;
}

export const ListaSolicitudesPersonales: React.FC<ListaSolicitudesPersonalesProps> = ({
  onNuevaSolicitud
}) => {
  const {
    solicitudes,
    isLoading,
    error,
    cargarMisSolicitudes,
    recargarSolicitudes,
    descargarArchivo,
    limpiarErrores
  } = useLicenciasPermisos(HOOK_OPTIONS_PERSONAL);

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<LicenciaPermiso | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // Estadísticas eliminadas - funcionalidad no requerida

  // Cargar datos al montar el componente - Sin dependencias problemáticas
  useEffect(() => {
    recargarSolicitudes();
  }, []);

  // Formatear fecha para mostrar
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

  // Manejar descarga de archivo
  const handleDescargarArchivo = async (solicitud: LicenciaPermiso) => {
    if (!solicitud.archivoAdjuntoURL) {
      return;
    }

    setDescargandoId(solicitud.id);
    try {
      const result = await descargarArchivo(solicitud.id);
      if (!result.success) {
        showError('Error de descarga', result.error || 'Error al descargar archivo');
      } else {
        showSuccess('Descarga exitosa', 'El archivo se ha descargado correctamente');
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      showError('Error inesperado', 'Error inesperado al descargar archivo');
    } finally {
      setDescargandoId(null);
    }
  };

  // Mostrar detalles de solicitud
  const mostrarDetalles = (solicitud: LicenciaPermiso) => {
    setSolicitudSeleccionada(solicitud);
    setShowDetalleModal(true);
  };

  // Obtener icono según tipo
  const getTipoIcon = (tipo: TipoSolicitud) => {
    return tipo === TipoSolicitud.LICENCIA ? 'bi-heart-pulse' : 'bi-calendar-event';
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0 text-muted">Cargando tus solicitudes...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm">
        <Alert.Heading>
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar solicitudes
        </Alert.Heading>
        <p>{error}</p>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={limpiarErrores}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </Button>
          <Button variant="danger" onClick={cargarMisSolicitudes}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {/* Encabezado simplificado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="bi bi-calendar-check me-2"></i>
            Mis Solicitudes
          </h4>
          <p className="text-muted mb-0">Historial de licencias y permisos solicitados</p>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <Card className="shadow-sm">
        <Card.Body>
          {solicitudes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No tienes solicitudes registradas</h5>
              <p className="text-muted">Crea tu primera solicitud de licencia o permiso</p>
              {onNuevaSolicitud && (
                <Button variant="primary" onClick={onNuevaSolicitud}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Crear Primera Solicitud
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th>
                    <th>Fechas</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Solicitado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id}>
                      {/* Tipo */}
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`bi ${getTipoIcon(solicitud.tipo)} me-2 text-${getTipoColor(solicitud.tipo)}`}></i>
                          <div>
                            <Badge bg={getTipoColor(solicitud.tipo)} className="mb-1">
                              {solicitud.tipo}
                            </Badge>
                            {solicitud.archivoAdjuntoURL && (
                              <div>
                                <i className="bi bi-paperclip text-muted small"></i>
                                <small className="text-muted ms-1">Archivo adjunto</small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Fechas */}
                      <td>
                        <div className="small">
                          <div><strong>Inicio:</strong> {formatearFecha(solicitud.fechaInicio)}</div>
                          <div><strong>Fin:</strong> {formatearFecha(solicitud.fechaFin)}</div>
                        </div>
                      </td>

                      {/* Duración */}
                      <td>
                        <Badge bg="light" text="dark">
                          {calcularDias(solicitud.fechaInicio, solicitud.fechaFin)} día{calcularDias(solicitud.fechaInicio, solicitud.fechaFin) !== 1 ? 's' : ''}
                        </Badge>
                      </td>

                      {/* Estado */}
                      <td>
                        <Badge bg={getEstadoColor(solicitud.estado)}>
                          {solicitud.estado}
                        </Badge>
                        {solicitud.revisadoPor && (
                          <div className="small text-muted mt-1">
                            Revisado por: {solicitud.revisadoPor.name}
                          </div>
                        )}
                      </td>

                      {/* Fecha de solicitud */}
                      <td>
                        <small className="text-muted">
                          {formatearFechaHora(solicitud.fechaSolicitud)}
                        </small>
                      </td>

                      {/* Acciones */}
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => mostrarDetalles(solicitud)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de detalles */}
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg" className="modal-enhanced">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <i className={`bi ${getTipoIcon(solicitudSeleccionada?.tipo || TipoSolicitud.PERMISO)} me-3 fs-4`}></i>
            <div>
              <span>Detalles de Solicitud</span>
              <small className="d-block text-white-50 mt-1">
                {solicitudSeleccionada?.tipo}
              </small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {solicitudSeleccionada && (
            <div>
              {/* Estado actual */}
              <div className="mb-4 text-center">
                <Badge 
                  bg={getEstadoColor(solicitudSeleccionada.estado)} 
                  className="badge-enhanced fs-6 px-4 py-2"
                >
                  <i className={`bi ${solicitudSeleccionada.estado === 'Pendiente' ? 'bi-clock' : solicitudSeleccionada.estado === 'Aprobada' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                  {solicitudSeleccionada.estado}
                </Badge>
              </div>

              {/* Información principal */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="info-card border-primary h-100">
                    <Card.Header className="bg-primary text-white">
                      Información General
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Tipo:</strong>
                        <Badge bg={getTipoColor(solicitudSeleccionada.tipo)} className="ms-2">
                          {solicitudSeleccionada.tipo}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <strong>Estado:</strong>
                        <Badge bg={getEstadoColor(solicitudSeleccionada.estado)} className="ms-2">
                          {solicitudSeleccionada.estado}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <strong>Duración:</strong> {calcularDias(solicitudSeleccionada.fechaInicio, solicitudSeleccionada.fechaFin)} días
                      </div>
                      <div>
                        <strong>Solicitado:</strong> {formatearFechaHora(solicitudSeleccionada.fechaSolicitud)}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="info-card border-info h-100">
                    <Card.Header className="bg-info text-white">
                      Fechas
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Fecha de Inicio:</strong><br/>
                        <span className="text-primary">{formatearFecha(solicitudSeleccionada.fechaInicio)}</span>
                      </div>
                      <div>
                        <strong>Fecha de Fin:</strong><br/>
                        <span className="text-primary">{formatearFecha(solicitudSeleccionada.fechaFin)}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Motivo de la solicitud */}
              <Card className="info-card border-warning mb-4">
                <Card.Header className="bg-warning text-dark">
                  Motivo de la Solicitud
                </Card.Header>
                <Card.Body>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0 fst-italic">"{solicitudSeleccionada.motivoSolicitud}"</p>
                  </div>
                </Card.Body>
              </Card>

              {/* Respuesta del encargado */}
              {solicitudSeleccionada.respuestaEncargado && (
                <Card className={`info-card border-${getEstadoColor(solicitudSeleccionada.estado)} mb-4`}>
                  <Card.Header className={`bg-${getEstadoColor(solicitudSeleccionada.estado)} text-white`}>
                    <i className="bi bi-chat-square-text me-2"></i>
                    Respuesta de Recursos Humanos
                  </Card.Header>
                  <Card.Body>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-3 fst-italic">"{solicitudSeleccionada.respuestaEncargado}"</p>
                      {solicitudSeleccionada.revisadoPor && (
                        <div className="text-end">
                          <small className="text-muted">
                            <i className="bi bi-person-check me-1"></i>
                            Revisado por: <strong>{solicitudSeleccionada.revisadoPor.name}</strong>
                          </small>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Archivo adjunto */}
              {solicitudSeleccionada.archivoAdjuntoURL && (
                <Card className="info-card border-secondary">
                  <Card.Header className="bg-secondary text-white">
                    <i className="bi bi-file-earmark-arrow-down me-2"></i>
                    Archivo Adjunto
                  </Card.Header>
                  <Card.Body className="text-center py-4">
                    <i className="bi bi-file-earmark-pdf fs-1 text-danger mb-3 d-block"></i>
                    <h6 className="mb-3">Documento de respaldo</h6>
                    <Button
                      variant="success"
                      size="lg"
                      className="btn-enhanced"
                      onClick={() => handleDescargarArchivo(solicitudSeleccionada)}
                      disabled={descargandoId === solicitudSeleccionada.id}
                    >
                      {descargandoId === solicitudSeleccionada.id ? (
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button variant="secondary" className="btn-enhanced" onClick={() => setShowDetalleModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}; 