import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useTrabajadores } from '@/hooks/useTrabajadores';
import { Trabajador, TrabajadorSearchQuery } from '@/types/trabajador.types';
import { useRut } from '@/hooks/useRut';
import { RegisterTrabajadorForm } from '@/components/trabajador/RegisterTrabajadorForm';

export const TrabajadoresPage: React.FC = () => {
  const { trabajadores, isLoading, error, loadTrabajadores, searchTrabajadores, deleteTrabajador } = useTrabajadores();
  const { formatRUT } = useRut();
  
  // Estados para los modales y filtros
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trabajadorToDelete, setTrabajadorToDelete] = useState<Trabajador | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<TrabajadorSearchQuery>({});
  const [deleteError, setDeleteError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    loadTrabajadores();
  }, []);

  // Función para manejar la búsqueda
  const handleSearch = () => {
    searchTrabajadores(searchParams);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchParams({});
    loadTrabajadores();
  };

  // Función para confirmar eliminación
  const handleDeleteClick = (trabajador: Trabajador) => {
    setTrabajadorToDelete(trabajador);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  // Función para ejecutar la eliminación
  const handleDeleteConfirm = async () => {
    if (!trabajadorToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError('');
      const result = await deleteTrabajador(trabajadorToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        loadTrabajadores(); // Recargar la lista
      } else {
        setDeleteError(result.error || 'Error al eliminar trabajador');
      }
    } catch (error) {
      setDeleteError('Error al eliminar trabajador');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
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
              <div className="col-md-4">
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
              <div className="col-md-4">
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
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Form.Check
                type="checkbox"
                label="Incluir trabajadores inactivos"
                checked={searchParams.todos || false}
                onChange={(e) => setSearchParams({ ...searchParams, todos: e.target.checked })}
                id="includeInactive"
              />
              <div>
                <Button variant="secondary" className="me-2" onClick={clearFilters}>
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar
                </Button>
                <Button variant="primary" onClick={handleSearch}>
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de error o carga */}
      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Tabla de trabajadores */}
      {!isLoading && !error && (
        <div className="card shadow">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>RUT</th>
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Cargo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trabajadores.map((trabajador) => (
                  <tr key={trabajador.id}>
                    <td>{formatRUT(trabajador.rut)}</td>
                    <td>{`${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`}</td>
                    <td>{trabajador.correo}</td>
                    <td>{trabajador.telefono}</td>
                    <td>{trabajador.fichaEmpresa?.cargo || '-'}</td>
                    <td>
                      <span className={`badge bg-${trabajador.enSistema ? 'success' : 'danger'}`}>
                        {trabajador.enSistema ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => {/* TODO: Implementar edición */}}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(trabajador)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
            <i className="bi bi-info-circle me-2"></i>
            <strong>Nota:</strong> Al registrar un trabajador se creará automáticamente una ficha de empresa 
            con valores por defecto que podrás editar inmediatamente.
          </div>
          <RegisterTrabajadorForm
            onSuccess={() => {
              setShowCreateModal(false);
              loadTrabajadores();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-circle me-2"></i>
              {deleteError}
            </Alert>
          )}
          <p>¿Estás seguro que deseas eliminar al trabajador?</p>
          <p className="mb-0">
            <strong>Nombre:</strong> {trabajadorToDelete ? `${trabajadorToDelete.nombres} ${trabajadorToDelete.apellidoPaterno} ${trabajadorToDelete.apellidoMaterno}` : ''}
            <br />
            <strong>RUT:</strong> {trabajadorToDelete ? formatRUT(trabajadorToDelete.rut) : ''}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}; 