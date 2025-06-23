import React, { useState, useEffect } from 'react';
import { 
  Card, Badge, Button, Row, Col, Alert, Spinner, Table, Modal, 
  Form, ButtonGroup, Dropdown
} from 'react-bootstrap';
import { useLicenciasPermisos } from '@/hooks/recursosHumanos/useLicenciasPermisos';
import { 
  LicenciaPermiso, 
  TipoSolicitud, 
  EstadoSolicitud,
  ActualizarSolicitudDTO 
} from '@/types/recursosHumanos/licenciaPermiso.types';
import { Toast, useToast } from '@/components/common/Toast';

// Configuración estable fuera del componente
const HOOK_OPTIONS_GESTION = { autoLoad: true, tipoVista: 'todas' as const };

export const ListaGestionSolicitudes: React.FC = () => {
  const {
    solicitudes,
    isLoading,
    error,
    cargarTodasLasSolicitudes,
    recargarSolicitudes,
    actualizarSolicitud,
    eliminarSolicitud,
    descargarArchivo,
    obtenerEstadisticas,
    limpiarErrores
  } = useLicenciasPermisos(HOOK_OPTIONS_GESTION);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showInfo, showWarning } = useToast();

  // Estados locales
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<LicenciaPermiso | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showRespuestaModal, setShowRespuestaModal] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  
  // Estados para filtros locales
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoSolicitud | ''>('');
  const [filtroTrabajador, setFiltroTrabajador] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  // Estados para respuesta
  const [accionRespuesta, setAccionRespuesta] = useState<'aprobar' | 'rechazar' | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');

  // Estadísticas
  const estadisticas = obtenerEstadisticas();

  // Cargar datos al montar el componente - Sin dependencias problemáticas  
  useEffect(() => {
    recargarSolicitudes();
  }, []);

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

  // Filtrar solicitudes localmente
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const matchEstado = !filtroEstado || solicitud.estado === filtroEstado;
    const matchTipo = !filtroTipo || solicitud.tipo === filtroTipo;
    const matchTrabajador = !filtroTrabajador || 
      `${solicitud.trabajador.nombres} ${solicitud.trabajador.apellidoPaterno} ${solicitud.trabajador.apellidoMaterno}`
        .toLowerCase().includes(filtroTrabajador.toLowerCase()) ||
      solicitud.trabajador.rut.includes(filtroTrabajador);
    
    // Filtros de fecha
    const fechaSolicitud = new Date(solicitud.fechaSolicitud);
    const matchFechaDesde = !filtroFechaDesde || fechaSolicitud >= new Date(filtroFechaDesde);
    const matchFechaHasta = !filtroFechaHasta || fechaSolicitud <= new Date(filtroFechaHasta + 'T23:59:59');
    
    return matchEstado && matchTipo && matchTrabajador && matchFechaDesde && matchFechaHasta;
  });

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroTipo('');
    setFiltroTrabajador('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
  };

  // Manejar descarga de archivo
  const handleDescargarArchivo = async (solicitud: LicenciaPermiso) => {
    if (!solicitud.archivoAdjuntoURL) return;

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

  // Mostrar detalles
  const mostrarDetalles = (solicitud: LicenciaPermiso) => {
    setSolicitudSeleccionada(solicitud);
    setShowDetalleModal(true);
  };

  // Iniciar proceso de respuesta
  const iniciarRespuesta = (solicitud: LicenciaPermiso, accion: 'aprobar' | 'rechazar') => {
    setSolicitudSeleccionada(solicitud);
    setAccionRespuesta(accion);
    setRespuestaTexto('');
    setShowRespuestaModal(true);
  };

  // Procesar respuesta (aprobar/rechazar)
  const procesarRespuesta = async () => {
    if (!solicitudSeleccionada || !accionRespuesta) return;

    if (accionRespuesta === 'rechazar' && !respuestaTexto.trim()) {
      showWarning('Motivo requerido', 'Debe proporcionar un motivo para rechazar la solicitud');
      return;
    }

    setProcesandoId(solicitudSeleccionada.id);
    
    try {
      const datosActualizacion: ActualizarSolicitudDTO = {
        estado: accionRespuesta === 'aprobar' ? EstadoSolicitud.APROBADA : EstadoSolicitud.RECHAZADA,
        respuestaEncargado: respuestaTexto.trim() || undefined
      };

      const result = await actualizarSolicitud(solicitudSeleccionada.id, datosActualizacion);
      
      if (result.success) {
        setShowRespuestaModal(false);
        setSolicitudSeleccionada(null);
        setAccionRespuesta(null);
        setRespuestaTexto('');
        showSuccess(
          `Solicitud ${accionRespuesta === 'aprobar' ? 'aprobada' : 'rechazada'}`,
          `La solicitud ha sido ${accionRespuesta === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`
        );
      } else {
        showError('Error al procesar', result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al procesar respuesta:', error);
      showError('Error inesperado', 'Error inesperado al procesar la solicitud');
    } finally {
      setProcesandoId(null);
    }
  };

  // Eliminar solicitud
  const handleEliminarSolicitud = async (solicitud: LicenciaPermiso) => {
    if (!confirm(`¿Está seguro de eliminar la solicitud de ${solicitud.trabajador.nombres} ${solicitud.trabajador.apellidoPaterno}?`)) {
      return;
    }

    setProcesandoId(solicitud.id);
    try {
      const result = await eliminarSolicitud(solicitud.id);
      if (!result.success) {
        showError('Error al eliminar', result.error || 'Error al eliminar solicitud');
      } else {
        showSuccess('Solicitud eliminada', 'La solicitud ha sido eliminada exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showError('Error inesperado', 'Error inesperado al eliminar solicitud');
    } finally {
      setProcesandoId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0 text-muted">Cargando solicitudes del sistema...</p>
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
          <Button variant="danger" onClick={cargarTodasLasSolicitudes}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {/* Encabezado con estadísticas */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-gradient-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-clipboard-check me-2"></i>
              Gestión de Licencias y Permisos
            </h5>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Estadísticas */}
          <Row className="text-center">
            <Col md={2}>
              <div className="stat-item">
                <h3 className="text-primary">{estadisticas.total}</h3>
                <small className="text-muted">Total</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-item">
                <h3 className="text-warning">{estadisticas.pendientes}</h3>
                <small className="text-muted">Pendientes</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-item">
                <h3 className="text-success">{estadisticas.aprobadas}</h3>
                <small className="text-muted">Aprobadas</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-item">
                <h3 className="text-danger">{estadisticas.rechazadas}</h3>
                <small className="text-muted">Rechazadas</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-item">
                <h3 className="text-info">{estadisticas.licencias}</h3>
                <small className="text-muted">Licencias</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-item">
                <h3 className="text-secondary">{estadisticas.permisos}</h3>
                <small className="text-muted">Permisos</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Panel de filtros */}
      <Card className="filter-card shadow-sm mb-4 fade-in-up">
        <Card.Header>
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros de Búsqueda
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select 
                  value={filtroEstado} 
                  onChange={(e) => setFiltroEstado(e.target.value as EstadoSolicitud | '')}
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select 
                  value={filtroTipo} 
                  onChange={(e) => setFiltroTipo(e.target.value as TipoSolicitud | '')}
                >
                  <option value="">Todos los tipos</option>
                  <option value="Licencia">Licencia</option>
                  <option value="Permiso">Permiso</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Trabajador</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={filtroTrabajador}
                  onChange={(e) => setFiltroTrabajador(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={1} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={handleLimpiarFiltros} className="mb-3 btn-enhanced">
                <i className="bi bi-x-circle me-1"></i>
                Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de solicitudes */}
      <Card className="shadow-sm">
        <Card.Body>
          {solicitudesFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">
                {solicitudes.length === 0 ? 'No hay solicitudes en el sistema' : 'No hay solicitudes que coincidan con los filtros'}
              </h5>
              <p className="text-muted">
                {solicitudes.length === 0 ? 'Las solicitudes aparecerán aquí cuando sean creadas' : 'Intente ajustar los criterios de búsqueda'}
              </p>
              {solicitudes.length > 0 && (
                <Button variant="outline-primary" onClick={handleLimpiarFiltros}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Mostrar Todas
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="table-enhanced">
                <thead className="table-light">
                  <tr>
                    <th>Trabajador</th>
                    <th>Tipo</th>
                    <th>Fechas</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Solicitado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.id}>
                      {/* Trabajador */}
                      <td>
                        <div>
                          <div className="fw-bold">
                            {solicitud.trabajador.nombres} {solicitud.trabajador.apellidoPaterno}
                          </div>
                          <small className="text-muted">{solicitud.trabajador.rut}</small>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`bi ${getTipoIcon(solicitud.tipo)} me-2 text-${getTipoColor(solicitud.tipo)}`}></i>
                          <div>
                                                    <Badge bg={getTipoColor(solicitud.tipo)} className="badge-enhanced mb-1">
                          {solicitud.tipo}
                        </Badge>
                            {solicitud.archivoAdjuntoURL && (
                              <div>
                                <i className="bi bi-paperclip text-muted small"></i>
                                <small className="text-muted ms-1">Archivo</small>
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
                        <Badge bg={getEstadoColor(solicitud.estado)} className="badge-enhanced">
                          {solicitud.estado}
                        </Badge>
                        {solicitud.revisadoPor && (
                          <div className="small text-muted mt-1">
                            Por: {solicitud.revisadoPor.name}
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
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => mostrarDetalles(solicitud)}>
                              <i className="bi bi-eye me-2"></i>
                              Ver Detalles
                            </Dropdown.Item>
                            
                            {solicitud.archivoAdjuntoURL && (
                              <Dropdown.Item 
                                onClick={() => handleDescargarArchivo(solicitud)}
                                disabled={descargandoId === solicitud.id}
                              >
                                <i className="bi bi-download me-2"></i>
                                {descargandoId === solicitud.id ? 'Descargando...' : 'Descargar Archivo'}
                              </Dropdown.Item>
                            )}
                            
                            <Dropdown.Divider />
                            
                            {solicitud.estado === 'Pendiente' && (
                              <>
                                <Dropdown.Item 
                                  onClick={() => iniciarRespuesta(solicitud, 'aprobar')}
                                  disabled={procesandoId === solicitud.id}
                                  className="text-success"
                                >
                                  <i className="bi bi-check-circle me-2"></i>
                                  Aprobar
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => iniciarRespuesta(solicitud, 'rechazar')}
                                  disabled={procesandoId === solicitud.id}
                                  className="text-danger"
                                >
                                  <i className="bi bi-x-circle me-2"></i>
                                  Rechazar
                                </Dropdown.Item>
                                <Dropdown.Divider />
                              </>
                            )}
                            
                            <Dropdown.Item 
                              onClick={() => handleEliminarSolicitud(solicitud)}
                              disabled={procesandoId === solicitud.id}
                              className="text-danger"
                            >
                              <i className="bi bi-trash me-2"></i>
                              {procesandoId === solicitud.id ? 'Eliminando...' : 'Eliminar'}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de detalles - versión simplificada para este paso */}
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
              <p><strong>Trabajador:</strong> {solicitudSeleccionada.trabajador.nombres} {solicitudSeleccionada.trabajador.apellidoPaterno}</p>
              <p><strong>Tipo:</strong> {solicitudSeleccionada.tipo}</p>
              <p><strong>Estado:</strong> {solicitudSeleccionada.estado}</p>
              <p><strong>Período:</strong> {formatearFecha(solicitudSeleccionada.fechaInicio)} - {formatearFecha(solicitudSeleccionada.fechaFin)}</p>
              <p><strong>Motivo:</strong> {solicitudSeleccionada.motivoSolicitud}</p>
              {solicitudSeleccionada.respuestaEncargado && (
                <p><strong>Respuesta RRHH:</strong> {solicitudSeleccionada.respuestaEncargado}</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {solicitudSeleccionada?.estado === 'Pendiente' && (
            <>
              <Button 
                variant="success" 
                onClick={() => iniciarRespuesta(solicitudSeleccionada, 'aprobar')}
              >
                <i className="bi bi-check-circle me-2"></i>
                Aprobar
              </Button>
              <Button 
                variant="danger" 
                onClick={() => iniciarRespuesta(solicitudSeleccionada, 'rechazar')}
              >
                <i className="bi bi-x-circle me-2"></i>
                Rechazar
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetalleModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de respuesta (aprobar/rechazar) */}
      <Modal show={showRespuestaModal} onHide={() => setShowRespuestaModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`bi ${accionRespuesta === 'aprobar' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
            {accionRespuesta === 'aprobar' ? 'Aprobar' : 'Rechazar'} Solicitud
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {solicitudSeleccionada && (
            <div>
              <div className="mb-3">
                <strong>Trabajador:</strong> {solicitudSeleccionada.trabajador.nombres} {solicitudSeleccionada.trabajador.apellidoPaterno}
              </div>
              <div className="mb-3">
                <strong>Tipo:</strong> {solicitudSeleccionada.tipo} | 
                <strong className="ms-2">Período:</strong> {formatearFecha(solicitudSeleccionada.fechaInicio)} - {formatearFecha(solicitudSeleccionada.fechaFin)}
              </div>
              
              <Form.Group>
                <Form.Label>
                  {accionRespuesta === 'aprobar' ? 'Comentarios adicionales' : 'Motivo del rechazo *'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder={accionRespuesta === 'aprobar' 
                    ? 'Comentarios opcionales sobre la aprobación...' 
                    : 'Explique el motivo del rechazo...'
                  }
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {respuestaTexto.length}/500 caracteres
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRespuestaModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button 
            variant={accionRespuesta === 'aprobar' ? 'success' : 'danger'}
            onClick={procesarRespuesta}
            disabled={procesandoId === solicitudSeleccionada?.id || (accionRespuesta === 'rechazar' && !respuestaTexto.trim())}
          >
            {procesandoId === solicitudSeleccionada?.id ? (
              <>
                <Spinner size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                <i className={`bi ${accionRespuesta === 'aprobar' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                {accionRespuesta === 'aprobar' ? 'Aprobar' : 'Rechazar'} Solicitud
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}; 