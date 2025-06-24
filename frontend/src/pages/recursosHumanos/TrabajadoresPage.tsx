import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Spinner, Modal, Container, Row, Col, Card } from 'react-bootstrap';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { Trabajador, TrabajadorSearchQuery } from '@/types/recursosHumanos/trabajador.types';
import { useRut, usePhone } from '@/hooks/useRut';
import { useUI } from '@/context';
import { RegisterTrabajadorForm } from '@/components/trabajador/RegisterTrabajadorForm';
import { EditarTrabajadorModal } from '@/components/trabajador/EditarTrabajadorModal';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import '../../styles/trabajadores.css';

export const TrabajadoresPage: React.FC = () => {
  const { trabajadores, isLoading, error, loadTrabajadores, searchTrabajadores, desvincularTrabajador } = useTrabajadores();
  const { formatRUT } = useRut();
  const { formatPhone } = usePhone();
  const { setSuccess, setError: setUIError } = useUI();
  
  // Estados para los modales y filtros
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDesvincularModal, setShowDesvincularModal] = useState(false);
  const [trabajadorToEdit, setTrabajadorToEdit] = useState<Trabajador | null>(null);
  const [trabajadorToDesvincular, setTrabajadorToDesvincular] = useState<Trabajador | null>(null);
  const [motivoDesvinculacion, setMotivoDesvinculacion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<TrabajadorSearchQuery>({});
  const [desvincularError, setDesvincularError] = useState<string>('');
  const [isDesvinculando, setIsDesvinculando] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rutError, setRutError] = useState<string | null>(null);

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
    setTrabajadorToDesvincular(trabajador);
    setShowDesvincularModal(true);
    setDesvincularError('');
    setMotivoDesvinculacion('');
  };

  // Función para ejecutar la desvinculación
  const handleDesvincularConfirm = async () => {
    if (!trabajadorToDesvincular || !motivoDesvinculacion.trim()) return;

    try {
      setIsDesvinculando(true);
      setDesvincularError('');
      const result = await desvincularTrabajador(trabajadorToDesvincular.id, motivoDesvinculacion);
      if (result.success) {
        setShowDesvincularModal(false);
        loadTrabajadores(); // Recargar la lista
        setSuccess('Trabajador desvinculado exitosamente');
      } else {
        setDesvincularError(result.error || 'Error al desvincular trabajador');
      }
    } catch (error) {
      setDesvincularError('Error al desvincular trabajador');
    } finally {
      setIsDesvinculando(false);
    }
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
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Registrar Trabajador
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
                      <Form.Label>Correo personal</Form.Label>
                      <Form.Control
                        type="email"
                        value={searchParams.correoPersonal || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, correoPersonal: e.target.value })}
                        placeholder="correo@ejemplo.com"
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
                            soloEliminados: false
                          });
                        }}
                        id="includeInactive"
                        disabled={searchParams.soloEliminados}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Sólo mostrar trabajadores desvinculados"
                        checked={searchParams.soloEliminados || false}
                        onChange={(e) => {
                          setSearchParams({
                            ...searchParams,
                            soloEliminados: e.target.checked,
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
                  <div className="text-center py-5">
                    <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">No hay trabajadores registrados</h5>
                    <p className="text-muted">Los trabajadores aparecerán aquí cuando sean registrados</p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                      <i className="bi bi-person-plus me-2"></i>
                      Registrar Primer Trabajador
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead className="table-light">
                        <tr>
                          <th>RUT</th>
                          <th>Nombre Completo</th>
                          <th>Fecha Nacimiento</th>
                          <th>Correo personal</th>
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
                              {(trabajador.correoPersonal !== 'admin.principal@gmail.com') && (
                                <div className="btn-group">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => handleEditClick(trabajador)}
                                    title="Editar trabajador"
                                    disabled={!trabajador.enSistema}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDesvincularClick(trabajador)}
                                    title="Desvincular trabajador"
                                    disabled={!trabajador.enSistema}
                                  >
                                    <i className="bi bi-person-x"></i>
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de registro */}
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
            onSuccess={() => {
              setShowCreateModal(false);
              loadTrabajadores();
                          setSuccess('Trabajador registrado exitosamente');
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal.Body>
      </Modal>

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
          {desvincularError && (
            <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
              <i className="bi bi-exclamation-circle me-2"></i>
              {desvincularError}
            </Alert>
          )}
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
              onChange={(e) => setMotivoDesvinculacion(e.target.value)}
              placeholder="Ingrese el motivo de la desvinculación..."
              required
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>
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
            disabled={isDesvinculando || !motivoDesvinculacion.trim()}
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
                          setSuccess('Trabajador actualizado exitosamente');
          }}
        />
      )}
    </Container>
  );
}; 