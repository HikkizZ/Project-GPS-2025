import React, { useState } from 'react';
import { useTrabajadores } from '@/hooks/useTrabajadores';
import { TrabajadorCard } from '@/components/recursosHumanos/TrabajadorCard';
import { Trabajador, TrabajadorSearchQuery } from '@/types/trabajador.types';

export const TrabajadoresPage: React.FC = () => {
  const {
    trabajadores,
    isLoading,
    error,
    searchTrabajadores,
    loadTrabajadores,
    deleteTrabajador,
    clearError
  } = useTrabajadores();

  const [searchQuery, setSearchQuery] = useState<TrabajadorSearchQuery>({});

  const handleSearch = async () => {
    await searchTrabajadores(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery({});
    loadTrabajadores();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este trabajador?')) {
      return;
    }
    await deleteTrabajador(id);
  };

  const handleEdit = (trabajador: Trabajador) => {
    // TODO: Implementar modal de edición
    console.log('Editar trabajador:', trabajador);
  };

  const handleViewDetails = (trabajador: Trabajador) => {
    // TODO: Implementar modal de detalles
    console.log('Ver detalles:', trabajador);
  };

  const handleCreateNew = () => {
    // TODO: Implementar modal de creación
    console.log('Crear nuevo trabajador');
  };

  return (
    <div className="trabajadores-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Gestión de Trabajadores</h1>
          <p>Administra la información del personal de la empresa</p>
        </div>
        <button onClick={handleCreateNew} className="btn btn-primary">
          + Nuevo Trabajador
        </button>
      </div>

      {/* Formulario de búsqueda */}
      <div className="search-section">
        <div className="search-form">
          <h3>Buscar Trabajadores</h3>
          <div className="search-fields">
            <div className="form-group">
              <label>RUT:</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={searchQuery.rut || ''}
                onChange={(e) => setSearchQuery({ ...searchQuery, rut: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Nombres:</label>
              <input
                type="text"
                placeholder="Nombres"
                value={searchQuery.nombres || ''}
                onChange={(e) => setSearchQuery({ ...searchQuery, nombres: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Apellido Paterno:</label>
              <input
                type="text"
                placeholder="Apellido Paterno"
                value={searchQuery.apellidoPaterno || ''}
                onChange={(e) => setSearchQuery({ ...searchQuery, apellidoPaterno: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Apellido Materno:</label>
              <input
                type="text"
                placeholder="Apellido Materno"
                value={searchQuery.apellidoMaterno || ''}
                onChange={(e) => setSearchQuery({ ...searchQuery, apellidoMaterno: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="correo@empresa.com"
                value={searchQuery.correo || ''}
                onChange={(e) => setSearchQuery({ ...searchQuery, correo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                placeholder="+56912345678"
                value={searchQuery.telefono || ''}
                onChange={(e) => setSearchQuery({ ...searchQuery, telefono: e.target.value })}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={searchQuery.todos || false}
                  onChange={(e) => setSearchQuery({ ...searchQuery, todos: e.target.checked })}
                />
                Incluir trabajadores inactivos
              </label>
            </div>
          </div>

          <div className="search-actions">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="results-section">
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={clearError} className="error-close">✕</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando trabajadores...</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <h3>
                Trabajadores encontrados: <span className="count">{trabajadores.length}</span>
              </h3>
              {trabajadores.length > 0 && (
                <div className="results-summary">
                  <span>
                    Activos: {trabajadores.filter(t => t.enSistema).length} • 
                    Inactivos: {trabajadores.filter(t => !t.enSistema).length}
                  </span>
                </div>
              )}
            </div>
            
            <div className="trabajadores-grid">
              {trabajadores.map((trabajador) => (
                <TrabajadorCard
                  key={trabajador.id}
                  trabajador={trabajador}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {trabajadores.length === 0 && !error && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No se encontraron trabajadores</h3>
                <p>Intenta ajustar los criterios de búsqueda o crear un nuevo trabajador.</p>
                <button onClick={handleCreateNew} className="btn btn-primary">
                  + Crear Nuevo Trabajador
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 