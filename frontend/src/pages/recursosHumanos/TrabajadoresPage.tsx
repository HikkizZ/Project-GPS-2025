import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Spinner, Modal, Container, Row, Col, Card } from 'react-bootstrap';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { Trabajador, TrabajadorSearchQuery } from '@/types/recursosHumanos/trabajador.types';
import { useRut, usePhone } from '@/hooks/useRut';
import { useUI, useAuth } from '@/context';
import { RegisterTrabajadorForm, VerificarRUTModal, ReactivarTrabajadorModal } from '@/components/trabajador/RegisterTrabajadorForm';
import { EditarTrabajadorModal } from '@/components/trabajador/EditarTrabajadorModal';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import { useToast, Toast } from '@/components/common/Toast';
import '../../styles/pages/trabajadores.css';
import { TrabajadorDetalleModal } from '@/components/recursosHumanos/TrabajadorDetalleModal';

export const TrabajadoresPage: React.FC = () => {
  const { trabajadores, isLoading, error, loadTrabajadores, searchTrabajadores, desvincularTrabajador } = useTrabajadores();
  const { formatRUT } = useRut();
  const { formatPhone } = usePhone();
  const { setError: setUIError, setLoading } = useUI();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { user } = useAuth();
  
  // Estados para los modales y filtros
  const [showVerificarRUTModal, setShowVerificarRUTModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReactivarModal, setShowReactivarModal] = useState(false);
  const [trabajadorDesvinculado, setTrabajadorDesvinculado] = useState<Trabajador | null>(null);
  const [rutVerificado, setRutVerificado] = useState<string>('');
  const [showDesvincularModal, setShowDesvincularModal] = useState(false);
  const [trabajadorToEdit, setTrabajadorToEdit] = useState<Trabajador | null>(null);
  const [trabajadorToDesvincular, setTrabajadorToDesvincular] = useState<Trabajador | null>(null);
  const [motivoDesvinculacion, setMotivoDesvinculacion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<TrabajadorSearchQuery>({});
  const [desvincularError, setDesvincularError] = useState<string>('');
  const [motivoDesvinculacionError, setMotivoDesvinculacionError] = useState<string>('');
  const [isDesvinculando, setIsDesvinculando] = useState(false);

  // Función para manejar el cambio del motivo de desvinculación
  const handleMotivoDesvinculacionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMotivoDesvinculacion(value);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (motivoDesvinculacionError) {
      setMotivoDesvinculacionError('');
    }
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [rutError, setRutError] = useState<string | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [trabajadorDetalle, setTrabajadorDetalle] = useState<Trabajador | null>(null);

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    loadTrabajadores();
  }, []);

  // Función para manejar la búsqueda
  const handleSearch = () => {
    // Validar formato de RUT si está presente
    if (searchParams.rut) {
      const rutLimpio = searchParams.rut.trim();
      // Solo aceptar formato: xx.xxx.xxx-x
      const rutRegex = /^\d{2}\.\d{3}\.\d{3}-[\dkK]$/;
      if (!rutRegex.test(rutLimpio)) {
        setRutError('Debe ingresar el RUT en formato xx.xxx.xxx-x');
        return;
      }
    }
    setRutError(null);
    searchTrabajadores(searchParams);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchParams({});
    setRutError(null);
    loadTrabajadores();
  };

  // Función para editar trabajador
  const handleEditClick = (trabajador: Trabajador) => {
    setTrabajadorToEdit(trabajador);
    setShowEditModal(true);
  };

  // Función para manejar la desvinculación
  const handleDesvincularClick = (trabajador: Trabajador) => {
    // Validación: no permitir si está en licencia médica o permiso administrativo
    if (
      trabajador.fichaEmpresa &&
      (trabajador.fichaEmpresa.estado === 'Licencia médica' || trabajador.fichaEmpresa.estado === 'Permiso administrativo')
    ) {
      showError(
        'No permitido',
        'No se puede desvincular a un trabajador mientras esté con licencia médica o permiso administrativo.'
      );
      return;
    }
    setTrabajadorToDesvincular(trabajador);
    setShowDesvincularModal(true);
    setDesvincularError('');
    setMotivoDesvinculacionError('');
    setMotivoDesvinculacion('');
  };

  // Función para ejecutar la desvinculación
  const handleDesvincularConfirm = async () => {
    if (!trabajadorToDesvincular) return;

    // Validar motivo de desvinculación
    if (!motivoDesvinculacion.trim()) {
      setMotivoDesvinculacionError('El motivo de desvinculación es requerido');
      return;
    } else if (motivoDesvinculacion.trim().length < 3) {
      setMotivoDesvinculacionError('El motivo de desvinculación debe tener al menos 3 caracteres');
      return;
    }

    // Validación: no permitir si falta la fecha de inicio de contrato
    if (!trabajadorToDesvincular.fichaEmpresa || !trabajadorToDesvincular.fichaEmpresa.fechaInicioContrato) {
      setDesvincularError('Debes ingresar la fecha de inicio de contrato (en la ficha de empresa) antes de desvincular al trabajador.');
      return;
    }

    try {
      setIsDesvinculando(true);
      setDesvincularError('');
      setMotivoDesvinculacionError('');
      const result = await desvincularTrabajador(trabajadorToDesvincular.id, motivoDesvinculacion);
      if (result.success) {
        setShowDesvincularModal(false);
        loadTrabajadores(); // Recargar la lista
        showSuccess('¡Trabajador desvinculado!', 'El trabajador se ha desvinculado exitosamente del sistema', 4000);
      } else {
        setDesvincularError(result.error || 'Error al desvincular trabajador');
      }
    } catch (error) {
      setDesvincularError('Error al desvincular trabajador');
    } finally {
      setIsDesvinculando(false);
    }
  };

  // Función para verificar si el trabajador es el usuario actual
  const esTrabajadorActual = (trabajador: Trabajador) => {
    return user && trabajador.rut && user.rut && trabajador.rut.replace(/\.|-/g, '') === user.rut.replace(/\.|-/g, '');
  };

  // Nuevas funciones para el flujo inteligente
  const handleRegistrarClick = () => {
    setRutVerificado(''); // Limpiar RUT anterior
    setShowVerificarRUTModal(true);
  };

  const handleRegistroNormal = (rutFromVerification: string) => {
    setRutVerificado(rutFromVerification);
    setShowCreateModal(true);
  };

  const handleReactivacion = (trabajador: Trabajador) => {
    setTrabajadorDesvinculado(trabajador);
    setShowReactivarModal(true);
  };

  const handleRegistroSuccess = () => {
    setShowCreateModal(false);
    setRutVerificado(''); // Limpiar RUT después del registro exitoso
    loadTrabajadores();
    showSuccess('¡Trabajador registrado!', 'El trabajador se ha registrado exitosamente y se ha creado su ficha de empresa', 4000);
  };

  const handleReactivacionSuccess = () => {
    setShowReactivarModal(false);
    setTrabajadorDesvinculado(null);
    loadTrabajadores();
  };

  // Función para ver detalles
  const handleVerDetalle = (trabajador: Trabajador) => {
    setTrabajadorDetalle(trabajador);
    setShowDetalleModal(true);
  };

  return (
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-people-fill fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Gestión de Trabajadores</h3>
                    <p className="mb-0 opacity-75">
                      Administrar información de trabajadores del sistema
                    </p>
                  </div>
                </div>
                <div>
                  <Button 
                    variant={showFilters ? "outline-light" : "light"}
                    className="me-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                    {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                  </Button>
                  <Button 
                    variant="light"
                    onClick={handleRegistrarClick}
                  >
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Registrar o Reactivar Trabajador
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="shadow-sm mb-3">
              <FiltrosBusquedaHeader />
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>RUT</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.rut || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, rut: formatRUT(e.target.value) })}
                        placeholder="Ej: 12.345.678-9"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombres</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.nombres || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, nombres: e.target.value })}
                        placeholder="Nombres del trabajador"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido Paterno</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.apellidoPaterno || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, apellidoPaterno: e.target.value })}
                        placeholder="Apellido paterno"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido Materno</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.apellidoMaterno || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, apellidoMaterno: e.target.value })}
                        placeholder="Apellido materno"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo Personal</Form.Label>
                      <Form.Control
                        type="email"
                        name="correoPersonal"
                        value={searchParams.correoPersonal || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, correoPersonal: e.target.value })}
                        placeholder="correo@gmail.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.telefono || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, telefono: formatPhone(e.target.value) })}
                        placeholder="+56912345678"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Emergencia</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.numeroEmergencia || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, numeroEmergencia: formatPhone(e.target.value) })}
                        placeholder="+56987654321"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchParams.direccion || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, direccion: e.target.value })}
                        placeholder="Dirección del trabajador"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        value={searchParams.fechaNacimiento || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, fechaNacimiento: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Ingreso</Form.Label>
                      <Form.Control
                        type="date"
                        value={searchParams.fechaIngreso || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, fechaIngreso: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="d-flex align-items-end">
                    <div className="d-flex gap-2 mb-3">
                      <Button variant="primary" onClick={handleSearch}>
                        <i className="bi bi-search me-2"></i>
                        Buscar
                      </Button>
                      <Button variant="outline-secondary" onClick={clearFilters}>
                        <i className="bi bi-x-circle me-2"></i>
                        Limpiar
                      </Button>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="checkbox"
                        label="Incluir trabajadores desvinculados"
                        checked={searchParams.todos || false}
                        onChange={(e) => {
                          setSearchParams({
                            ...searchParams,
                            todos: e.target.checked,
                            enSistema: undefined // Si se marca 'todos', no filtrar por enSistema
                          });
                        }}
                        id="includeInactive"
                        disabled={searchParams.enSistema === false}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Sólo mostrar trabajadores desvinculados"
                        checked={searchParams.enSistema === false}
                        onChange={(e) => {
                          setSearchParams({
                            ...searchParams,
                            enSistema: e.target.checked ? false : undefined,
                            todos: false
                          });
                        }}
                        id="onlyInactive"
                        disabled={searchParams.todos}
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Mensaje de error de formato de RUT */}
          {rutError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {rutError}
            </Alert>
          )}

          {/* Mensajes de error o carga */}
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando trabajadores...</p>
            </div>
          )}

          {/* Tabla de trabajadores */}
          {!isLoading && !error && (
            <Card className="shadow-sm">
              <Card.Body>
                {trabajadores.length === 0 ? (
                  Object.values(searchParams).some(v => v) ? (
                    <div className="text-center py-5">
                      <i className="bi bi-person-x fs-1 text-muted mb-3 d-block"></i>
                      <h5 className="text-muted">No hay resultados que coincidan con tu búsqueda</h5>
                      <p className="text-muted">Intenta ajustar los filtros para obtener más resultados</p>
                      <Button variant="outline-primary" onClick={clearFilters}>
                        <i className="bi bi-arrow-clockwise me-2"></i> Mostrar Todos
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
                      <h5 className="text-muted">No hay trabajadores registrados</h5>
                      <p className="text-muted">Los trabajadores aparecerán aquí cuando sean registrados</p>
                      <Button variant="primary" onClick={handleRegistrarClick}>
                        <i className="bi bi-person-plus me-2"></i>
                        Registrar Primer Trabajador
                      </Button>
                    </div>
                  )
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">
                        <i className="bi bi-list-ul me-2"></i>
                        Trabajadores Registrados ({trabajadores.length})
                        <small className="text-muted ms-2">
                          (Activos: {trabajadores.filter(t => t.enSistema).length} • 
                          Desvinculados: {trabajadores.filter(t => !t.enSistema).length})
                        </small>
                      </h6>
                    </div>
                    <div className="table-responsive">
                      <Table hover>
                      <thead className="table-light">
                        <tr>
                          <th>RUT</th>
                          <th>Nombre Completo</th>
                          <th>Fecha Nacimiento</th>
                          <th>Correo Personal</th>
                          <th>Teléfono</th>
                          <th>N° Emergencia</th>
                          <th>Dirección</th>
                          <th>Fecha Ingreso</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trabajadores.map((trabajador) => (
                          <tr key={trabajador.id} className={!trabajador.enSistema ? 'table-light' : ''}>
                            <td>{formatRUT(trabajador.rut)}</td>
                            <td>
                              <div>
                                <div className="fw-bold">
                                  {`${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`}
                                </div>
                                {!trabajador.enSistema && (
                                  <span className="badge bg-secondary bg-opacity-25 text-secondary" style={{ fontSize: '0.75em' }}>
                                    <i className="bi bi-person-x me-1"></i>
                                    Desvinculado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{new Date(trabajador.fechaNacimiento).toLocaleDateString()}</td>
                            <td>{trabajador.correoPersonal}</td>
                            <td>{trabajador.telefono}</td>
                            <td>{trabajador.numeroEmergencia || '-'}</td>
                            <td>{trabajador.direccion}</td>
                            <td>{new Date(trabajador.fechaIngreso).toLocaleDateString()}</td>
                            <td className="text-center">
                              {/* Ocultar acciones si es el admin principal */}
                              {trabajador.correoPersonal !== 'admin.principal@gmail.com' && (
                                <div className="btn-group">
                                  {/* Si es el usuario actual y tiene rol adecuado, solo mostrar el ojo */}
                                  {esTrabajadorActual(trabajador) && (user?.role === 'RecursosHumanos' || user?.role === 'Administrador') ? (
                                    <Button
                                      variant="outline-secondary"
                                      onClick={() => handleVerDetalle(trabajador)}
                                      title="Ver detalles"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </Button>
                                  ) :
                                  // Si NO es el usuario actual, mostrar todas las acciones
                                  (!esTrabajadorActual(trabajador)) && (
                                    <>
                                      <Button 
                                        variant="outline-primary" 
                                        className="me-2"
                                        onClick={() => handleEditClick(trabajador)}
                                        title="Editar trabajador"
                                        disabled={!trabajador.enSistema}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        onClick={() => handleDesvincularClick(trabajador)}
                                        title="Desvincular trabajador"
                                        disabled={!trabajador.enSistema}
                                      >
                                        <i className="bi bi-person-x"></i>
                                      </Button>
                                      {/* Botón de reactivar solo si está desvinculado */}
                                      {!trabajador.enSistema && (
                                        <Button
                                          variant="outline-success"
                                          onClick={() => handleReactivacion(trabajador)}
                                          title="Reactivar trabajador"
                                        >
                                          <i className="bi bi-person-check"></i>
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline-secondary"
                                        onClick={() => handleVerDetalle(trabajador)}
                                        title="Ver detalles"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de verificación de RUT */}
      <VerificarRUTModal
        show={showVerificarRUTModal}
        onHide={() => setShowVerificarRUTModal(false)}
        onRegistroNormal={handleRegistroNormal}
        onReactivacion={handleReactivacion}
      />

      {/* Modal de registro normal */}
      <Modal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
        centered
      >
        <Modal.Header 
          closeButton 
          style={{
            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
            border: 'none'
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-person-plus me-2"></i>
            Registrar Nuevo Trabajador
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          <div className="alert alert-info border-0 mb-3" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-start">
              <i className="bi bi-info-circle me-3 mt-1"></i>
              <div>
                <strong>Nota Importante:</strong>
                <p className="mb-0 mt-1">Al registrar un trabajador se creará automáticamente una ficha de empresa con valores por defecto que podrás editar inmediatamente.</p>
              </div>
            </div>
          </div>
          <RegisterTrabajadorForm
            onSuccess={handleRegistroSuccess}
            onCancel={() => setShowCreateModal(false)}
            rutPrellenado={rutVerificado}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de reactivación */}
      {trabajadorDesvinculado && (
        <ReactivarTrabajadorModal
          show={showReactivarModal}
          onHide={() => {
            setShowReactivarModal(false);
            setTrabajadorDesvinculado(null);
          }}
          trabajador={trabajadorDesvinculado}
          onSuccess={handleReactivacionSuccess}
        />
      )}

      {/* Modal de desvinculación */}
      <Modal
        show={showDesvincularModal}
        onHide={() => setShowDesvincularModal(false)}
        centered
      >
        <Modal.Header 
          closeButton 
          style={{
            background: 'linear-gradient(135deg, #dc3545 0%, #a71e2a 100%)',
            border: 'none'
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-person-x me-2"></i>
            Desvincular Trabajador
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          <Alert variant="warning" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-start">
              <i className="bi bi-exclamation-triangle me-3 mt-1 text-warning"></i>
              <div>
                <strong>Advertencia:</strong>
                <p className="mb-2 mt-1">Esta acción:</p>
                <ul className="mb-0">
                  <li>Marcará al trabajador como desvinculado en el sistema</li>
                  <li>Cambiará el estado de su ficha a "Desvinculado"</li>
                  <li>Desactivará su cuenta de usuario</li>
                  <li>Registrará el motivo de desvinculación en el historial laboral</li>
                </ul>
              </div>
            </div>
          </Alert>
          
          <div className="mb-3 p-3 bg-light rounded-3">
            <p className="mb-2 fw-semibold">¿Estás seguro que deseas desvincular al trabajador?</p>
            <div className="d-flex flex-column gap-1">
              <div>
                <span className="fw-semibold text-muted">Nombre:</span> 
                <span className="ms-2">{trabajadorToDesvincular ? `${trabajadorToDesvincular.nombres} ${trabajadorToDesvincular.apellidoPaterno} ${trabajadorToDesvincular.apellidoMaterno}` : ''}</span>
              </div>
              <div>
                <span className="fw-semibold text-muted">RUT:</span> 
                <span className="ms-2">{trabajadorToDesvincular ? formatRUT(trabajadorToDesvincular.rut) : ''}</span>
              </div>
            </div>
          </div>
          
          <Form.Group>
            <Form.Label className="fw-semibold">Motivo de Desvinculación <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={motivoDesvinculacion}
              onChange={handleMotivoDesvinculacionChange}
              isInvalid={!!motivoDesvinculacionError}
              placeholder="Ingrese el motivo de la desvinculación..."
              required
              style={{ borderRadius: '8px' }}
            />
            <Form.Control.Feedback type="invalid">
              {motivoDesvinculacionError}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Es importante documentar el motivo de la desvinculación para auditoría y seguimiento.
            </Form.Text>
          </Form.Group>
          {desvincularError && (
            <Alert variant="danger" className="border-0 mt-3 mb-0" style={{ borderRadius: '12px' }}>
              <i className="bi bi-exclamation-circle me-2"></i>
              {desvincularError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dee2e6' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDesvincularModal(false)}
            disabled={isDesvinculando}
            style={{ borderRadius: '20px', fontWeight: '500' }}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDesvincularConfirm}
            disabled={isDesvinculando || !motivoDesvinculacion.trim() || !!motivoDesvinculacionError}
            style={{ borderRadius: '20px', fontWeight: '500' }}
          >
            {isDesvinculando ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Desvinculando...
              </>
            ) : (
              <>
                <i className="bi bi-person-x me-2"></i>
                Desvincular
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de edición */}
      {trabajadorToEdit && (
        <EditarTrabajadorModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setTrabajadorToEdit(null);
          }}
          trabajador={trabajadorToEdit}
          onSuccess={() => {
            loadTrabajadores();
            showSuccess('¡Trabajador actualizado!', 'Los datos del trabajador se han actualizado exitosamente', 4000);
          }}
        />
      )}
      
      {/* Modal de detalles de trabajador */}
      <TrabajadorDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        trabajador={trabajadorDetalle}
      />

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </Container>
  );
}; 