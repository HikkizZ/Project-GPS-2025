import React, { useState, useEffect } from 'react';
import { useFichaEmpresa } from '@/hooks/useFichaEmpresa';
import { useAuth } from '@/context/AuthContext';
import { 
  FichaEmpresa, 
  FichaEmpresaSearchParams,
  EstadoLaboral
} from '@/types/fichaEmpresa.types';
import { Trabajador } from '@/types/trabajador.types';
import { EditarFichaEmpresaModal } from '@/components/recursosHumanos/EditarFichaEmpresaModal';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface FichasEmpresaPageProps {
  trabajadorRecienRegistrado?: Trabajador | null;
  onTrabajadorModalClosed?: () => void;
}

export const FichasEmpresaPage: React.FC<FichasEmpresaPageProps> = ({ 
  trabajadorRecienRegistrado, 
  onTrabajadorModalClosed 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    fichas,
    currentFicha: miFicha,
    isLoading,
    loadFichas: searchFichas,
    loadFichaById: loadMiFicha,
    updateFicha,
    formatSalario: formatSueldo,
    formatFecha,
    searchByRUT,
    clearError,
    downloadContrato
  } = useFichaEmpresa();

  const [searchQuery, setSearchQuery] = useState<FichaEmpresaSearchParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaEmpresa | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para los checkboxes de filtrado
  const [incluirDesvinculados, setIncluirDesvinculados] = useState(false);
  const [incluirLicencias, setIncluirLicencias] = useState(false);
  const [incluirPermisos, setIncluirPermisos] = useState(false);

  // Función para filtrar las fichas según los estados seleccionados
  const fichasFiltradas = fichas.filter(ficha => {
    if (ficha.estado === EstadoLaboral.ACTIVO) return true;
    if (ficha.estado === EstadoLaboral.DESVINCULADO) return incluirDesvinculados;
    if (ficha.estado === EstadoLaboral.LICENCIA) return incluirLicencias;
    if (ficha.estado === EstadoLaboral.PERMISO) return incluirPermisos;
    return false;
  });

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!token || !userData) {
        console.error('Usuario no autenticado');
        // Redirigir al login
        window.location.href = '/login';
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (!user.role) {
          console.error('Rol de usuario no encontrado');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error al procesar datos del usuario:', error);
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

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
            // Abrir modal de edición
            setSelectedFicha(ficha);
            setShowEditModal(true);
          } else {
            console.error('No se pudo encontrar la ficha del trabajador recién registrado');
            setError('No se pudo encontrar la ficha del trabajador. Por favor, intente más tarde.');
          }
        } catch (error) {
          console.error('Error al buscar la ficha:', error);
          setError('Error al buscar la ficha del trabajador. Por favor, intente más tarde.');
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

  const handleEditFicha = (ficha: FichaEmpresa) => {
    setSelectedFicha(ficha);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFicha(null);
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

  const handleDownloadContrato = async (fichaId: number) => {
    try {
      await downloadContrato(fichaId);
    } catch (error) {
      setError('Error al descargar el contrato. Por favor, intente nuevamente.');
      setTimeout(() => setError(null), 3000);
    }
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
                {/* Checkboxes de estado */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="mb-3">Estados a mostrar:</h6>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="incluirDesvinculados"
                        checked={incluirDesvinculados}
                        onChange={(e) => setIncluirDesvinculados(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="incluirDesvinculados">
                        Desvinculados
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="incluirLicencias"
                        checked={incluirLicencias}
                        onChange={(e) => setIncluirLicencias(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="incluirLicencias">
                        Licencias
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="incluirPermisos"
                        checked={incluirPermisos}
                        onChange={(e) => setIncluirPermisos(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="incluirPermisos">
                        Permisos Administrativos
                      </label>
                    </div>
                  </div>
                </div>

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
                Fichas Encontradas ({fichasFiltradas.length})
              </h6>
            </div>
            <div className="card-body">
              {fichasFiltradas.length > 0 && (
                <small className="text-muted mb-3 d-block">
                  Activos: {fichasFiltradas.filter(f => f.estado === EstadoLaboral.ACTIVO).length} • 
                  Licencias: {fichasFiltradas.filter(f => f.estado === EstadoLaboral.LICENCIA).length} • 
                  Permisos: {fichasFiltradas.filter(f => f.estado === EstadoLaboral.PERMISO).length} • 
                  Desvinculados: {fichasFiltradas.filter(f => f.estado === EstadoLaboral.DESVINCULADO).length}
                </small>
              )}

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando fichas...</p>
                </div>
              ) : fichasFiltradas.length === 0 ? (
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
                        <th>Empresa</th>
                        <th>Estado</th>
                        <th>Tipo Contrato</th>
                        <th>Jornada</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Sueldo Base</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichasFiltradas.map((ficha) => (
                        <tr key={ficha.id}>
                          <td>
                            <div>
                              <strong>{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}</strong>
                              <br />
                              <small className="text-muted">{ficha.trabajador.rut}</small>
                            </div>
                          </td>
                          <td>{ficha.cargo || '-'}</td>
                          <td>{ficha.area || '-'}</td>
                          <td>{ficha.empresa || '-'}</td>
                          <td>
                            <span className={`badge ${getEstadoBadgeClass(ficha.estado)}`}>
                              {ficha.estado}
                            </span>
                            {ficha.estado === EstadoLaboral.DESVINCULADO && ficha.motivoDesvinculacion && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>{ficha.motivoDesvinculacion}</Tooltip>}
                              >
                                <i className="bi bi-info-circle ms-2 text-muted"></i>
                              </OverlayTrigger>
                            )}
                          </td>
                          <td>
                            <span className={getTipoContratoColor(ficha.tipoContrato)}>
                              {ficha.tipoContrato}
                            </span>
                          </td>
                          <td>{ficha.jornadaLaboral || '-'}</td>
                          <td>{formatFecha(ficha.fechaInicioContrato)}</td>
                          <td>{ficha.fechaFinContrato ? formatFecha(ficha.fechaFinContrato) : '-'}</td>
                          <td>
                            <span className="fw-bold text-success">
                              {formatSueldo(ficha.sueldoBase)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className={`btn ${ficha.contratoURL ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                                onClick={() => handleDownloadContrato(ficha.id)}
                                title={ficha.contratoURL ? "Descargar contrato" : "No hay contrato disponible"}
                                disabled={!ficha.contratoURL}
                              >
                                <i className="bi bi-file-earmark-pdf"></i>
                              </button>
                              {ficha.trabajador.rut !== '11.111.111-1' && (
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => handleEditFicha(ficha)}
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
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
      {showEditModal && selectedFicha && (
        <EditarFichaEmpresaModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          ficha={selectedFicha}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </div>
  );
}; 