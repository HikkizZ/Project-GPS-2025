import React, { useState, useEffect } from 'react';
import { 
  Card, Badge, Button, Row, Col, Alert, Spinner, Table, Modal, 
  Form, ButtonGroup
} from 'react-bootstrap';
import { useLicenciasPermisos } from '@/hooks/recursosHumanos/useLicenciasPermisos';
import { 
  LicenciaPermiso, 
  TipoSolicitud, 
  EstadoSolicitud,
  UpdateLicenciaPermisoDTO 
} from '@/types/recursosHumanos/licenciaPermiso.types';
import { Toast, useToast } from '@/components/common/Toast';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import { useAuth } from '@/context';

// Configuración estable fuera del componente
const HOOK_OPTIONS_GESTION = { autoLoad: true, tipoVista: 'todas' as const };

export const ListaGestionSolicitudes: React.FC = () => {
  const { user } = useAuth();
  const {
    solicitudes,
    isLoading,
    error,
    cargarTodasLasSolicitudes,
    recargarSolicitudes,
    actualizarSolicitud,

    descargarArchivo,
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
  
  // Estado para mostrar/ocultar filtros
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para filtros locales
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoSolicitud | ''>('');
  const [filtroTrabajador, setFiltroTrabajador] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  // Estados para respuesta
  const [accionRespuesta, setAccionRespuesta] = useState<'aprobar' | 'rechazar' | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');

  // Estados para el modal del revisor
  const [showRevisorModal, setShowRevisorModal] = useState(false);
  const [revisorSeleccionado, setRevisorSeleccionado] = useState<LicenciaPermiso['revisadoPor'] | null>(null);

  // Estadísticas eliminadas - funcionalidad no requerida

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

  // Verificar si el usuario actual puede gestionar la solicitud (no es su propia solicitud)
  const puedeGestionarSolicitud = (solicitud: LicenciaPermiso) => {
    if (!user) return false;
    // El usuario no puede gestionar su propia solicitud
    return solicitud.trabajador.rut !== user.rut;
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
      const datosActualizacion: UpdateLicenciaPermisoDTO = {
        estadoSolicitud: accionRespuesta === 'aprobar' ? EstadoSolicitud.APROBADA : EstadoSolicitud.RECHAZADA,
        respuestaEncargado: respuestaTexto.trim() || ''
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

  // Mostrar información del revisor
  const mostrarInfoRevisor = (revisor: LicenciaPermiso['revisadoPor']) => {
    if (revisor) {
      setRevisorSeleccionado(revisor);
      setShowRevisorModal(true);
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
      {/* Encabezado simplificado con botón de filtros */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="bi bi-clipboard-check me-2"></i>
            Solicitudes del Sistema
          </h4>
          <p className="text-muted mb-0">Gestionar y revisar todas las solicitudes</p>
        </div>
        <div>
          <Button 
            variant={showFilters ? "outline-secondary" : "outline-primary"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <Card className="filter-card shadow-sm mb-4 fade-in-up">
          <FiltrosBusquedaHeader />
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
      )}

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
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 ms-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                mostrarInfoRevisor(solicitud.revisadoPor);
                              }}
                            >
                              <i className="bi bi-info-circle text-primary"></i>
                            </Button>
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
                          variant="outline-primary"
                          size="sm"
                          onClick={() => mostrarDetalles(solicitud)}
                          title="Ver detalles y gestionar solicitud"
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

      {/* Modal de detalles completo */}
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg" className="modal-enhanced">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <i className={`bi ${solicitudSeleccionada?.tipo === TipoSolicitud.LICENCIA ? 'bi-heart-pulse' : 'bi-calendar-event'} me-3 fs-4`}></i>
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
            <>
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
                          {solicitudSeleccionada.trabajador.nombres} {solicitudSeleccionada.trabajador.apellidoPaterno} {solicitudSeleccionada.trabajador.apellidoMaterno}
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-primary">RUT:</strong>
                        <div className="mt-1 font-monospace">{solicitudSeleccionada.trabajador.rut}</div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-primary">Email Corporativo:</strong>
                        <div className="mt-1">
                          <a href={`mailto:${solicitudSeleccionada.trabajador.usuario?.email || 'No disponible'}`} className="text-decoration-none">
                            <i className="bi bi-building me-1"></i>
                            {solicitudSeleccionada.trabajador.usuario?.email || 'No disponible'}
                          </a>
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-primary">Email Personal:</strong>
                        <div className="mt-1">
                          <a href={`mailto:${solicitudSeleccionada.trabajador.correoPersonal}`} className="text-decoration-none">
                            <i className="bi bi-envelope me-1"></i>
                            {solicitudSeleccionada.trabajador.correoPersonal}
                          </a>
                        </div>
                      </div>
                      <div>
                        <strong className="text-primary">Teléfono:</strong>
                        <div className="mt-1">
                          <a href={`tel:${solicitudSeleccionada.trabajador.telefono}`} className="text-decoration-none">
                            <i className="bi bi-telephone me-1"></i>
                            {solicitudSeleccionada.trabajador.telefono}
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
                          <Badge bg={getTipoColor(solicitudSeleccionada.tipo)} className="badge-enhanced">
                            <i className={`bi ${getTipoIcon(solicitudSeleccionada.tipo)} me-1`}></i>
                            {solicitudSeleccionada.tipo}
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-info">Duración:</strong>
                        <div className="mt-1 fs-5 fw-bold text-primary">
                          {calcularDias(solicitudSeleccionada.fechaInicio, solicitudSeleccionada.fechaFin)} día{calcularDias(solicitudSeleccionada.fechaInicio, solicitudSeleccionada.fechaFin) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong className="text-info">Fecha de Solicitud:</strong>
                        <div className="mt-1">{formatearFechaHora(solicitudSeleccionada.fechaSolicitud)}</div>
                      </div>
                      {solicitudSeleccionada.archivoAdjuntoURL && (
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
                          {formatearFecha(solicitudSeleccionada.fechaInicio)}
                        </div>
                        <small className="text-muted">
                          {new Date(solicitudSeleccionada.fechaInicio).toLocaleDateString('es-CL', { weekday: 'long' })}
                        </small>
                      </div>
                    </Col>
                    <Col md={6}>
                      <strong className="text-success d-block">Fecha de Fin</strong>
                      <div className="fs-4 fw-bold text-primary mt-2">
                        {formatearFecha(solicitudSeleccionada.fechaFin)}
                      </div>
                      <small className="text-muted">
                        {new Date(solicitudSeleccionada.fechaFin).toLocaleDateString('es-CL', { weekday: 'long' })}
                      </small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Motivo de solicitud */}
              <Card className="info-card border-warning mb-4">
                <Card.Header className="bg-warning text-dark">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Motivo de la Solicitud
                </Card.Header>
                <Card.Body>
                  <p className="mb-0">{solicitudSeleccionada.motivoSolicitud}</p>
                </Card.Body>
              </Card>

              {/* Respuesta del encargado (si existe) */}
              {solicitudSeleccionada.respuestaEncargado && (
                <Card className="info-card border-secondary mb-4">
                  <Card.Header className="bg-secondary text-white">
                    <i className="bi bi-chat-left-dots me-2"></i>
                    Respuesta de RRHH
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-2">{solicitudSeleccionada.respuestaEncargado}</p>
                    {solicitudSeleccionada.revisadoPor && (
                      <small className="text-muted">
                        <i className="bi bi-person me-1"></i>
                        Revisado por: {solicitudSeleccionada.revisadoPor.name}
                      </small>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div className="d-flex gap-2">
            {/* Botón de descarga */}
            {solicitudSeleccionada?.archivoAdjuntoURL && (
              <Button 
                variant="outline-info"
                onClick={() => {
                  if (solicitudSeleccionada) {
                    handleDescargarArchivo(solicitudSeleccionada);
                  }
                }}
                disabled={descargandoId === solicitudSeleccionada?.id}
              >
                <i className="bi bi-download me-2"></i>
                {descargandoId === solicitudSeleccionada?.id ? 'Descargando...' : 'Descargar Archivo'}
              </Button>
            )}
          </div>
          
          <div className="d-flex gap-2">
            {/* Botones de acción para solicitudes pendientes */}
            {solicitudSeleccionada?.estado === 'Pendiente' && puedeGestionarSolicitud(solicitudSeleccionada) && (
              <>
                <Button 
                  variant="success" 
                  onClick={() => {
                    if (solicitudSeleccionada) {
                      setShowDetalleModal(false);
                      iniciarRespuesta(solicitudSeleccionada, 'aprobar');
                    }
                  }}
                  disabled={procesandoId === solicitudSeleccionada?.id}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Aprobar
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    if (solicitudSeleccionada) {
                      setShowDetalleModal(false);
                      iniciarRespuesta(solicitudSeleccionada, 'rechazar');
                    }
                  }}
                  disabled={procesandoId === solicitudSeleccionada?.id}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Rechazar
                </Button>
              </>
            )}
            
            {/* Mensaje cuando es la propia solicitud */}
            {solicitudSeleccionada?.estado === 'Pendiente' && !puedeGestionarSolicitud(solicitudSeleccionada) && (
              <Alert variant="info" className="mb-0 py-2 px-3">
                <i className="bi bi-info-circle me-2"></i>
                <small>No puede gestionar su propia solicitud. Esta acción debe ser realizada por otro usuario con permisos adecuados.</small>
              </Alert>
            )}
            
            {/* Botón cerrar */}
            <Button variant="secondary" onClick={() => setShowDetalleModal(false)}>
              <i className="bi bi-x-circle me-2"></i>
              Cerrar
            </Button>
          </div>
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
                <div className="text-secondary mb-1">RUT</div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-vcard text-primary me-2"></i>
                  {revisorSeleccionado.rut}
                </div>
              </div>
              <div>
                <div className="text-secondary mb-1">Correo electrónico</div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope text-primary me-2"></i>
                  <a href={`mailto:${revisorSeleccionado.email}`} className="text-decoration-none text-primary">
                    {revisorSeleccionado.email}
                  </a>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <style jsx global>{`
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

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}; 