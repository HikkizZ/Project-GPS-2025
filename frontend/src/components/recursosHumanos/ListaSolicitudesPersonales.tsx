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
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => mostrarDetalles(solicitud)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          
                          {solicitud.archivoAdjuntoURL && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleDescargarArchivo(solicitud)}
                              disabled={descargandoId === solicitud.id}
                            >
                              {descargandoId === solicitud.id ? (
                                <Spinner size="sm" />
                              ) : (
                                <i className="bi bi-download"></i>
                              )}
                            </Button>
                          )}
                        </div>
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
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-info-circle me-2"></i>
            Detalles de Solicitud
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {solicitudSeleccionada && (
            <div>
              {/* Información principal */}
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="h-100 border-primary">
                    <Card.Header className="bg-primary text-white">
                      <h6 className="mb-0">Información General</h6>
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
                  <Card className="h-100 border-info">
                    <Card.Header className="bg-info text-white">
                      <h6 className="mb-0">Fechas</h6>
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

              {/* Motivo */}
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Motivo de la Solicitud</h6>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0">{solicitudSeleccionada.motivoSolicitud}</p>
                </Card.Body>
              </Card>

              {/* Respuesta del encargado */}
              {solicitudSeleccionada.respuestaEncargado && (
                <Card className="mb-3">
                  <Card.Header className={`bg-${getEstadoColor(solicitudSeleccionada.estado)} text-white`}>
                    <h6 className="mb-0">Respuesta de Recursos Humanos</h6>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-2">{solicitudSeleccionada.respuestaEncargado}</p>
                    {solicitudSeleccionada.revisadoPor && (
                      <small className="text-muted">
                        Revisado por: <strong>{solicitudSeleccionada.revisadoPor.name}</strong>
                      </small>
                    )}
                  </Card.Body>
                </Card>
              )}

              {/* Archivo adjunto */}
              {solicitudSeleccionada.archivoAdjuntoURL && (
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-paperclip me-2"></i>
                      Archivo Adjunto
                    </h6>
                  </Card.Header>
                  <Card.Body className="text-center">
                    <i className="bi bi-file-earmark-pdf fs-1 text-danger mb-2 d-block"></i>
                    <Button
                      variant="success"
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetalleModal(false)}>
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