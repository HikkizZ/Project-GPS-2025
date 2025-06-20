import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
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
    <div className="trabajadores-page">
      <div className="container py-4">


        {/* Header principal */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">
              <i className="bi bi-people-fill me-2"></i>
              Gestión de Trabajadores
            </h4>
            <p className="text-muted mb-0">Administrar información de trabajadores del sistema</p>
          </div>
          <div>
            <Button 
              variant={showFilters ? "outline-secondary" : "outline-primary"}
              className="me-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-person-plus-fill me-2"></i>
              Registrar Trabajador
            </Button>
          </div>
        </div>

        {/* Sección de filtros */}
        {showFilters && (
          <div className="card mb-4">
            <FiltrosBusquedaHeader />
            <div className="card-body">
              <div className="row g-3">
                {/* Primera fila */}
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>RUT</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.rut || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, rut: formatRUT(e.target.value) })}
                      placeholder="Ej: 12.345.678-9"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Nombres</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.nombres || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, nombres: e.target.value })}
                      placeholder="Nombres del trabajador"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Apellido Paterno</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.apellidoPaterno || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, apellidoPaterno: e.target.value })}
                      placeholder="Apellido paterno"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Apellido Materno</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.apellidoMaterno || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, apellidoMaterno: e.target.value })}
                      placeholder="Apellido materno"
                    />
                  </Form.Group>
                </div>
                {/* Segunda fila */}
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Correo personal</Form.Label>
                    <Form.Control
                      type="email"
                      value={searchParams.correoPersonal || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, correoPersonal: e.target.value })}
                      placeholder="correo@ejemplo.com"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.telefono || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, telefono: formatPhone(e.target.value) })}
                      placeholder="+56912345678"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Número de Emergencia</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.numeroEmergencia || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, numeroEmergencia: formatPhone(e.target.value) })}
                      placeholder="+56987654321"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchParams.direccion || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, direccion: e.target.value })}
                      placeholder="Dirección del trabajador"
                    />
                  </Form.Group>
                </div>
                {/* Tercera fila */}
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Fecha de Nacimiento</Form.Label>
                    <Form.Control
                      type="date"
                      value={searchParams.fechaNacimiento || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, fechaNacimiento: e.target.value })}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Fecha de Ingreso</Form.Label>
                    <Form.Control
                      type="date"
                      value={searchParams.fechaIngreso || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, fechaIngreso: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Button variant="primary" onClick={handleSearch}>
                    <i className="bi bi-search me-2"></i>
                    Buscar
                  </Button>
                  <Button variant="secondary" className="ms-2" onClick={clearFilters}>
                    <i className="bi bi-x-circle me-2"></i>
                    Limpiar
                  </Button>
                </div>
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
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error de formato de RUT */}
        {rutError && (
          <div className="alert alert-danger mt-3">{rutError}</div>
        )}

        {/* Mensajes de error o carga */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Tabla de trabajadores */}
        {!isLoading && !error && (
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Trabajadores Registrados ({trabajadores.length})
                  </h6>
                </div>
                <Table hover responsive className="align-middle">
                  <thead>
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
                          {`${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`}
                          {!trabajador.enSistema && (
                            <span className="badge bg-secondary bg-opacity-25 text-secondary ms-2" style={{ fontSize: '0.8em' }}>
                              <i className="bi bi-person-x me-1"></i>
                              Desvinculado
                            </span>
                          )}
                        </td>
                        <td>{new Date(trabajador.fechaNacimiento).toLocaleDateString()}</td>
                        <td>{trabajador.correoPersonal}</td>
                        <td>{trabajador.telefono}</td>
                        <td>{trabajador.numeroEmergencia || '-'}</td>
                        <td>{trabajador.direccion}</td>
                        <td>{new Date(trabajador.fechaIngreso).toLocaleDateString()}</td>
                        <td className="text-center">
                          {/* Ocultar acciones si es el admin principal */}
                          {(trabajador.correoPersonal !== 'admin.principal@gmail.com' && trabajador.rut !== '11.111.111-1') && (
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
            </div>
          </div>
        )}

        {/* Modal de registro */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-person-plus me-2"></i>
              Registrar Nuevo Trabajador
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="alert alert-info">
              <span className="me-2 align-middle">
                <i className="bi bi-info-circle"></i>
              </span>
              <strong className="align-middle me-2">Nota:</strong>
              Al registrar un trabajador se creará automáticamente una ficha de empresa con valores por defecto que podrás editar inmediatamente.
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
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>
              <i className="bi bi-person-x me-2"></i>
              Desvincular Trabajador
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {desvincularError && (
              <Alert variant="danger" className="mb-3">
                <i className="bi bi-exclamation-circle me-2"></i>
                {desvincularError}
              </Alert>
            )}
            <Alert variant="warning" className="mb-3">
              <div>
                <span className="me-2 align-middle">
                  <i className="bi bi-exclamation-triangle"></i>
                </span>
                <strong className="align-middle">Advertencia:</strong>
                <br />
                Esta acción:
                <ul className="mb-0 mt-2">
                  <li>Marcará al trabajador como desvinculado en el sistema</li>
                  <li>Cambiará el estado de su ficha a "Desvinculado"</li>
                  <li>Desactivará su cuenta de usuario</li>
                  <li>Registrará el motivo de desvinculación en el historial laboral</li>
                </ul>
              </div>
            </Alert>
            <p>¿Estás seguro que deseas desvincular al trabajador?</p>
            <p className="mb-3">
              <strong>Nombre:</strong> {trabajadorToDesvincular ? `${trabajadorToDesvincular.nombres} ${trabajadorToDesvincular.apellidoPaterno} ${trabajadorToDesvincular.apellidoMaterno}` : ''}
              <br />
              <strong>RUT:</strong> {trabajadorToDesvincular ? formatRUT(trabajadorToDesvincular.rut) : ''}
            </p>
            <Form.Group>
              <Form.Label>Motivo de Desvinculación</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={motivoDesvinculacion}
                onChange={(e) => setMotivoDesvinculacion(e.target.value)}
                placeholder="Ingrese el motivo de la desvinculación..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowDesvincularModal(false)}
              disabled={isDesvinculando}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDesvincularConfirm}
              disabled={isDesvinculando || !motivoDesvinculacion.trim()}
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
      </div>
    </div>
  );
}; 