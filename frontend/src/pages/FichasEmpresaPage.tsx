import React, { useState, useEffect } from 'react';
import { useFichaEmpresa } from '@/hooks/useFichaEmpresa';
import { useAuth } from '@/context/AuthContext';
import { 
  FichaEmpresa, 
  FichaEmpresaSearchParams,
  EstadoLaboral
} from '@/types/fichaEmpresa.types';
import { Trabajador } from '@/types/trabajador.types';
import EditWorkerModal from '@/components/EditWorkerModal';

interface FichasEmpresaPageProps {
  trabajadorRecienRegistrado?: Trabajador | null;
  onTrabajadorModalClosed?: () => void;
}

export const FichasEmpresaPage: React.FC<FichasEmpresaPageProps> = ({ 
  trabajadorRecienRegistrado, 
  onTrabajadorModalClosed 
}) => {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    fichas,
    currentFicha: miFicha,
    isLoading,
    error,
    loadFichas: searchFichas,
    loadFichaById: loadMiFicha,
    updateFicha,
    updateEstadoLaboral: actualizarEstado,
    formatSalario: formatSueldo,
    formatFecha,
    searchByRUT,
    clearError
  } = useFichaEmpresa();

  const [searchQuery, setSearchQuery] = useState<FichaEmpresaSearchParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaEmpresa | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'estado'>('view');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role === 'Usuario') {
      loadMiFicha();
    } else {
      handleSearch();
    }
  }, [user]);

  // Detectar trabajador recién registrado y abrir modal automáticamente
  useEffect(() => {
    if (trabajadorRecienRegistrado) {
      // Si no tiene ficha, intentar buscarla
      const buscarYAbrirModal = async () => {
        try {
          // Esperar un momento para asegurar que la ficha esté creada en la base de datos
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Usar búsqueda específica por RUT
          const ficha = await searchByRUT(trabajadorRecienRegistrado.rut);
          
          if (ficha) {
            // Abrir modal de edición automáticamente usando EditWorkerModal
            setSelectedWorkerId(ficha.id);
            setShowEditModal(true);
          } else {
            console.error('No se pudo encontrar la ficha del trabajador recién registrado');
          }
        } catch (error) {
          console.error('Error al buscar la ficha:', error);
        } finally {
          // Limpiar el trabajador recién registrado
          if (onTrabajadorModalClosed) {
            onTrabajadorModalClosed();
          }
        }
      };
      
      buscarYAbrirModal();
    }
  }, [trabajadorRecienRegistrado, searchByRUT, onTrabajadorModalClosed]);

  const handleSearch = async () => {
    await searchFichas(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery({});
    if (user?.role !== 'Usuario') {
      searchFichas({});
    }
  };

  const handleViewFicha = (ficha: FichaEmpresa) => {
    setSelectedFicha(ficha);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditFicha = (ficha: FichaEmpresa) => {
    // Usar el nuevo EditWorkerModal en lugar del modal interno
    setSelectedWorkerId(ficha.id);
    setShowEditModal(true);
  };

  const handleChangeEstado = (ficha: FichaEmpresa) => {
    setSelectedFicha(ficha);
    setModalType('estado');
    setShowModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedWorkerId(null);
  };

  const handleUpdateSuccess = () => {
    // Recargar las fichas
    handleSearch();
    // Mostrar mensaje de éxito
    setSuccessMessage('Ficha actualizada exitosamente');
    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const getEstadoBadgeClass = (estado: EstadoLaboral) => {
    switch (estado) {
      case EstadoLaboral.ACTIVO:
        return 'bg-success';
      case EstadoLaboral.LICENCIA:
        return 'bg-warning';
      case EstadoLaboral.PERMISO:
        return 'bg-info';
      case EstadoLaboral.DESVINCULADO:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getTipoContratoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'indefinido':
        return 'text-success';
      case 'plazo fijo':
        return 'text-warning';
      case 'por obra':
        return 'text-info';
      case 'part-time':
        return 'text-secondary';
      default:
        return 'text-muted';
    }
  };

  // Si es usuario normal, mostrar solo su ficha
  if (user?.role === 'Usuario') {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-person-badge me-2"></i>
                  Mi Ficha de Empresa
                </h5>
              </div>
              <div className="card-body">
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando mi ficha...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                ) : miFicha ? (
                  <div className="row">
                    <div className="col-lg-8">
                      <h6 className="text-muted mb-3">Información Laboral</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Cargo:</label>
                          <p className="mb-0">{miFicha.cargo}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Área:</label>
                          <p className="mb-0">{miFicha.area}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Empresa:</label>
                          <p className="mb-0">{miFicha.empresa}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Estado:</label>
                          <span className={`badge ${getEstadoBadgeClass(miFicha.estado)}`}>
                            {miFicha.estado}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Tipo de Contrato:</label>
                          <p className={`mb-0 ${getTipoContratoColor(miFicha.tipoContrato)}`}>
                            {miFicha.tipoContrato}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Jornada:</label>
                          <p className="mb-0">{miFicha.jornadaLaboral}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Fecha Inicio:</label>
                          <p className="mb-0">{formatFecha(miFicha.fechaInicioContrato)}</p>
                        </div>
                        {miFicha.fechaFinContrato && (
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Fecha Fin:</label>
                            <p className="mb-0">{formatFecha(miFicha.fechaFinContrato)}</p>
                          </div>
                        )}
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Sueldo Base:</label>
                          <p className="mb-0 text-success fw-bold">{formatSueldo(miFicha.sueldoBase)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <h6 className="card-title">Información del Trabajador</h6>
                          <p className="mb-1"><strong>Nombre:</strong></p>
                          <p className="mb-2">{miFicha.trabajador.nombres} {miFicha.trabajador.apellidoPaterno} {miFicha.trabajador.apellidoMaterno}</p>
                          <p className="mb-1"><strong>RUT:</strong></p>
                          <p className="mb-0">{miFicha.trabajador.rut}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-person-x display-1 text-muted"></i>
                    <h5 className="mt-3">No tienes ficha asignada</h5>
                    <p className="text-muted">Contacta con Recursos Humanos para más información.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista para RRHH/Admin
  return (
    <div className="container-fluid py-4">
      {/* Mostrar mensaje de éxito si existe */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage(null)}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-clipboard-data me-2"></i>
                Fichas de Empresa
              </h2>
              <p className="text-muted mb-0">Gestión de información laboral y contratos</p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="bi bi-funnel me-2"></i>
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      {showFilters && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="bi bi-search me-2"></i>
                  Filtros de Búsqueda
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">RUT del Trabajador:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="12.345.678-9"
                      value={searchQuery.rut || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, rut: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Estado:</label>
                    <select
                      className="form-select"
                      value={searchQuery.estado || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, estado: e.target.value as EstadoLaboral })}
                    >
                      <option value="">Todos los estados</option>
                      {Object.values(EstadoLaboral).map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Cargo:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cargo o posición"
                      value={searchQuery.cargo || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, cargo: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Área:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Departamento o área"
                      value={searchQuery.area || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, area: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Empresa:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre de empresa"
                      value={searchQuery.empresa || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, empresa: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tipo de Contrato:</label>
                    <select
                      className="form-select"
                      value={searchQuery.tipoContrato || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, tipoContrato: e.target.value })}
                    >
                      <option value="">Todos los tipos</option>
                      <option value="Indefinido">Indefinido</option>
                      <option value="Plazo Fijo">Plazo Fijo</option>
                      <option value="Por Obra">Por Obra</option>
                      <option value="Part-Time">Part-Time</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sueldo desde:</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Monto mínimo"
                      value={searchQuery.sueldoBaseDesde || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, sueldoBaseDesde: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sueldo hasta:</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Monto máximo"
                      value={searchQuery.sueldoBaseHasta || ''}
                      onChange={(e) => setSearchQuery({ ...searchQuery, sueldoBaseHasta: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="btn btn-primary me-2"
                    >
                      <i className="bi bi-search me-2"></i>
                      {isLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={isLoading}
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {error && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={clearError}></button>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-table me-2"></i>
                Fichas Encontradas ({fichas.filter(f => f.estado !== EstadoLaboral.DESVINCULADO).length})
              </h6>
            </div>
            <div className="card-body">
              {fichas.length > 0 && (
                <small className="text-muted mb-3 d-block">
                  Activos: {fichas.filter(f => f.estado === EstadoLaboral.ACTIVO).length} • 
                  Inactivos: {fichas.filter(f => (f.estado === EstadoLaboral.LICENCIA || f.estado === EstadoLaboral.PERMISO)).length}
                </small>
              )}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando fichas...</p>
                </div>
              ) : fichas.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-x display-1 text-muted"></i>
                  <h5 className="mt-3">No se encontraron fichas</h5>
                  <p className="text-muted">Intenta ajustar los criterios de búsqueda.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Trabajador</th>
                        <th>Cargo</th>
                        <th>Área</th>
                        <th>Estado</th>
                        <th>Contrato</th>
                        <th>Sueldo</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichas.map((ficha) => (
                        <tr key={ficha.id}>
                          <td>
                            <div>
                              <strong>{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno}</strong>
                              <br />
                              <small className="text-muted">{ficha.trabajador.rut}</small>
                            </div>
                          </td>
                          <td>
                            <span className="fw-medium">{ficha.cargo}</span>
                          </td>
                          <td>{ficha.area}</td>
                          <td>
                            <span className={`badge ${getEstadoBadgeClass(ficha.estado)}`}>
                              {ficha.estado}
                            </span>
                          </td>
                          <td>
                            <span className={getTipoContratoColor(ficha.tipoContrato)}>
                              {ficha.tipoContrato}
                            </span>
                            <br />
                            <small className="text-muted">{ficha.jornadaLaboral}</small>
                          </td>
                          <td>
                            <span className="fw-bold text-success">
                              {formatSueldo(ficha.sueldoBase)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleViewFicha(ficha)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleEditFicha(ficha)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {console.log('Role:', user?.role) /* Temporal para debug */}
                              {user?.role && ['RecursosHumanos', 'Administrador'].includes(user.role) && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleChangeEstado(ficha)}
                                  title="Cambiar estado"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && selectedWorkerId && (
        <EditWorkerModal
          show={showEditModal}
          handleClose={handleCloseEditModal}
          workerId={selectedWorkerId}
          onUpdate={handleUpdateSuccess}
        />
      )}

      {/* Modal de Cambio de Estado */}
      {showModal && selectedFicha && modalType === 'estado' && (
        <EstadoModal
          ficha={selectedFicha}
          onSave={async (estado, motivo) => {
            try {
              await actualizarEstado(selectedFicha.id, estado, motivo);
              setShowModal(false);
              setSelectedFicha(null);
              // Recargar fichas
              if (user?.role === 'Usuario') {
                loadMiFicha();
              } else {
                handleSearch();
              }
              // Mostrar mensaje de éxito
              setSuccessMessage('Estado actualizado exitosamente');
            } catch (error) {
              console.error('Error al actualizar estado:', error);
              // El error se manejará a través del estado global
            }
          }}
          onClose={() => {
            setShowModal(false);
            setSelectedFicha(null);
          }}
        />
      )}
    </div>
  );
};

// Componente Modal de Cambio de Estado
const EstadoModal: React.FC<{
  ficha: FichaEmpresa;
  onSave: (estado: EstadoLaboral, motivo: string) => void;
  onClose: () => void;
}> = ({ ficha, onSave, onClose }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('Debe especificar el motivo de la desvinculación');
      return;
    }
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError('Debe especificar el motivo de la desvinculación');
      return;
    }
    onSave(EstadoLaboral.DESVINCULADO, motivo.trim());
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <i className="bi bi-person-x me-2"></i>
              Desvincular de la Empresa
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Trabajador:</strong> {ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno}
                <br />
                <strong>Estado Actual:</strong> <span className="badge bg-primary">{ficha.estado}</span>
              </div>

              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Atención:</strong> Al desvincular al trabajador:
                <ul className="mb-0 mt-2">
                  <li>Se establecerá automáticamente la fecha de fin de contrato</li>
                  <li>El trabajador ya no aparecerá en los conteos de Activos/Inactivos</li>
                  <li>Esta acción no se puede deshacer</li>
                </ul>
              </div>

              <div className="mb-3">
                <label className="form-label required">
                  Motivo de la Desvinculación
                </label>
                <textarea
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder="Especifique el motivo de la desvinculación..."
                  required
                />
                {error && <div className="invalid-feedback">{error}</div>}
              </div>

              {showConfirmation && (
                <div className="alert alert-danger">
                  <i className="bi bi-question-circle me-2"></i>
                  <strong>¿Está seguro de desvincular a este trabajador?</strong>
                  <p className="mb-0 mt-2">Esta acción es permanente y no se puede deshacer.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              {!showConfirmation ? (
                <button type="submit" className="btn btn-danger">
                  <i className="bi bi-check-circle me-2"></i>
                  Aceptar
                </button>
              ) : (
                <button type="button" className="btn btn-danger" onClick={handleConfirm}>
                  <i className="bi bi-exclamation-circle me-2"></i>
                  Sí, Desvincular
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 