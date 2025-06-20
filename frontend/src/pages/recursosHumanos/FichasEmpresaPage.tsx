import React, { useState, useEffect } from 'react';
import { useFichaEmpresa } from '@/hooks/recursosHumanos/useFichaEmpresa';
import { useAuth } from '@/context/AuthContext';
import { useRut } from '@/hooks/useRut';
import { 
  FichaEmpresa, 
  FichaEmpresaSearchParams,
  EstadoLaboral
} from '@/types/recursosHumanos/fichaEmpresa.types';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';
import { EditarFichaEmpresaModal } from '@/components/recursosHumanos/EditarFichaEmpresaModal';
import '../../styles/fichasEmpresa.css';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';

interface FichasEmpresaPageProps {
  trabajadorRecienRegistrado?: Trabajador | null;
  onTrabajadorModalClosed?: () => void;
}

// Utilidad para formatear con puntos de miles
function formatMiles(value: string | number): string {
  const num = typeof value === 'number' ? value : value.replace(/\D/g, '');
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const FichasEmpresaPage: React.FC<FichasEmpresaPageProps> = ({ 
  trabajadorRecienRegistrado, 
  onTrabajadorModalClosed 
}) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { formatRUT } = useRut();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    fichas,
    currentFicha: miFicha,
    isLoading,
    loadFichas: searchFichas,
    loadFichaById: loadMiFicha,
    formatSalario: formatSueldo,
    formatFecha,
    searchByRUT,
    clearError,
    downloadContrato
  } = useFichaEmpresa();

  const [searchQuery, setSearchQuery] = useState<FichaEmpresaSearchParams>({
    estado: EstadoLaboral.ACTIVO
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaEmpresa | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para los checkboxes de filtrado
  const [incluirDesvinculados, setIncluirDesvinculados] = useState(false);
  const [incluirLicencias, setIncluirLicencias] = useState(false);
  const [incluirPermisos, setIncluirPermisos] = useState(false);
  const [incluirSinFechaFin, setIncluirSinFechaFin] = useState(false);

  // Función para filtrar las fichas según los estados seleccionados
  // Ya no necesitamos filtrar aquí porque todo se maneja en el backend
  const fichasFiltradas = fichas;

  // Cargar datos iniciales
  useEffect(() => {
    // No ejecutar si aún está cargando la autenticación
    if (isAuthLoading) {
      return;
    }

    // No ejecutar si no hay usuario autenticado
    if (!user) {
      return;
    }

    if (user.role === 'Usuario') {
      loadMiFicha();
    } else {
      setIncluirDesvinculados(false);
      setIncluirLicencias(false);
      setIncluirPermisos(false);
      setIncluirSinFechaFin(false);
      setSearchQuery({ estado: EstadoLaboral.ACTIVO });
      searchFichas({ estado: EstadoLaboral.ACTIVO });
    }
  }, [user, isAuthLoading, loadMiFicha]);

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
    // Crear un objeto de búsqueda que incluya todos los filtros
    const searchParams = { ...searchQuery };
    
    // Armar el array de estados combinando select y checkboxes
    const estadosIncluidos = [];
    if (searchQuery.estado) estadosIncluidos.push(searchQuery.estado);
    if (incluirDesvinculados) estadosIncluidos.push(EstadoLaboral.DESVINCULADO);
    if (incluirLicencias) estadosIncluidos.push(EstadoLaboral.LICENCIA);
    if (incluirPermisos) estadosIncluidos.push(EstadoLaboral.PERMISO);

    // Lógica: si solo hay un estado, usar 'estado'; si hay más de uno, usar 'estados' (array)
    if (estadosIncluidos.length === 1) {
      searchParams.estado = estadosIncluidos[0];
      delete searchParams.estados;
    } else if (estadosIncluidos.length > 1) {
      searchParams.estados = Array.from(new Set(estadosIncluidos)); // Evitar duplicados
      delete searchParams.estado;
    } else {
      delete searchParams.estados;
      delete searchParams.estado;
    }

    // Agregar flag para incluir fichas sin fecha fin
    if (incluirSinFechaFin) {
      searchParams.incluirSinFechaFin = true;
    }

    // Siempre usar searchFichas, sin importar si hay RUT o no
    await searchFichas(searchParams);
  };

  const handleReset = () => {
    setSearchQuery({ estado: EstadoLaboral.ACTIVO });
    setIncluirDesvinculados(false);
    setIncluirLicencias(false);
    setIncluirPermisos(false);
    setIncluirSinFechaFin(false);
    if (user?.role !== 'Usuario') {
      searchFichas({ estado: EstadoLaboral.ACTIVO });
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

  // Función helper para campos "Por Definir"
  const getFieldClass = (value: string) => {
    return value === 'Por Definir' ? 'por-definir' : '';
  };

  const getTipoContratoColor = (tipo: string) => {
    if (tipo === 'Por Definir') {
      return 'por-definir';
    }
    
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

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRut = formatRUT(e.target.value);
    setSearchQuery({ ...searchQuery, rut: formattedRut });
  };

  // Si es usuario normal, mostrar solo su ficha
  if (user?.role === 'Usuario') {
    return (
      <div className="fichas-empresa-page">
        <div className="container py-4">
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
                            <p className={`mb-0 ${getFieldClass(miFicha.cargo)}`}>{miFicha.cargo}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Área:</label>
                            <p className={`mb-0 ${getFieldClass(miFicha.area)}`}>{miFicha.area}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Empresa:</label>
                            <p className={`mb-0 ${getFieldClass(miFicha.empresa)}`}>{miFicha.empresa}</p>
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
                            <p className={`mb-0 ${getFieldClass(miFicha.jornadaLaboral)}`}>{miFicha.jornadaLaboral}</p>
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
                            <p className="mb-0">{formatRUT(miFicha.trabajador.rut)}</p>
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
      </div>
    );
  }

  // Vista para RRHH/Admin
  return (
    <div className="fichas-empresa-page">
      <div className="container py-4">
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
                <h2 className="mb-1 mt-0 d-flex align-items-center">
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
                <FiltrosBusquedaHeader />
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
                      <label className="form-label">RUT:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: 12.345.678-9"
                        value={searchQuery.rut || ''}
                        onChange={handleRutChange}
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
                        placeholder="Cargo"
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
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        placeholder="Monto mínimo"
                        value={searchQuery.sueldoBaseDesde !== undefined && searchQuery.sueldoBaseDesde !== null ? formatMiles(searchQuery.sueldoBaseDesde) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          if (raw === '') {
                            setSearchQuery({ ...searchQuery, sueldoBaseDesde: undefined });
                          } else {
                            setSearchQuery({ ...searchQuery, sueldoBaseDesde: Number(raw) });
                          }
                        }}
                        maxLength={12}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Sueldo hasta:</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        placeholder="Monto máximo"
                        value={searchQuery.sueldoBaseHasta !== undefined && searchQuery.sueldoBaseHasta !== null ? formatMiles(searchQuery.sueldoBaseHasta) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          if (raw === '') {
                            setSearchQuery({ ...searchQuery, sueldoBaseHasta: undefined });
                          } else {
                            setSearchQuery({ ...searchQuery, sueldoBaseHasta: Number(raw) });
                          }
                        }}
                        maxLength={12}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Fecha Inicio Desde:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={searchQuery.fechaInicioDesde || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaInicioDesde: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Fecha Inicio Hasta:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={searchQuery.fechaInicioHasta || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaInicioHasta: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Fecha Fin Desde:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={searchQuery.fechaFinDesde || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaFinDesde: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Fecha Fin Hasta:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={searchQuery.fechaFinHasta || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaFinHasta: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  {/* Checkbox para incluir fichas sin fecha fin */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="incluirSinFechaFin"
                          checked={incluirSinFechaFin}
                          onChange={(e) => setIncluirSinFechaFin(e.target.checked)}
                          disabled={!searchQuery.fechaFinDesde && !searchQuery.fechaFinHasta}
                        />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor="incluirSinFechaFin">
                          Incluir " Fecha Fin: - "
                          <span
                            tabIndex={0}
                            data-bs-toggle="tooltip"
                            data-bs-placement="right"
                            title="Se activa cuando se utiliza el filtro de fecha fin desde y/o fecha fin hasta"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="bi bi-info-circle" style={{ fontSize: '1rem' }}></i>
                          </span>
                        </label>
                      </div>
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
                    <h5 className="mt-3">No hay resultados que coincidan con tu búsqueda</h5>
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
                                <small className="text-muted">{formatRUT(ficha.trabajador.rut)}</small>
                              </div>
                            </td>
                            <td>
                              <span className={getFieldClass(ficha.cargo || '-')}>
                                {ficha.cargo || '-'}
                              </span>
                            </td>
                            <td>
                              <span className={getFieldClass(ficha.area || '-')}>
                                {ficha.area || '-'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getEstadoBadgeClass(ficha.estado)}`}>
                                {ficha.estado}
                              </span>
                            </td>
                            <td>
                              <span className={getTipoContratoColor(ficha.tipoContrato)}>
                                {ficha.tipoContrato}
                              </span>
                            </td>
                            <td>
                              <span className={getFieldClass(ficha.jornadaLaboral || '-')}>
                                {ficha.jornadaLaboral || '-'}
                              </span>
                            </td>
                            <td>{formatFecha(ficha.fechaInicioContrato)}</td>
                            <td>{ficha.fechaFinContrato ? formatFecha(ficha.fechaFinContrato) : '-'}</td>
                            <td>
                              <span className="fw-bold text-success">
                                {formatSueldo(ficha.sueldoBase)}
                              </span>
                            </td>
                            <td>
                              {/* Ocultar acciones si es el admin principal */}
                              {(ficha.trabajador.rut !== '11.111.111-1') && (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className={`btn ${ficha.contratoURL ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                                    onClick={() => handleDownloadContrato(ficha.id)}
                                    title={ficha.contratoURL ? "Descargar contrato" : "No hay contrato disponible"}
                                    disabled={!ficha.contratoURL || ficha.estado === EstadoLaboral.DESVINCULADO}
                                  >
                                    <i className="bi bi-file-earmark-pdf"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-warning"
                                    onClick={() => handleEditFicha(ficha)}
                                    title="Editar"
                                    disabled={ficha.estado === EstadoLaboral.DESVINCULADO}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
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
    </div>
  );
}; 