import React, { useState } from 'react';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { TrabajadorCard } from './TrabajadorCard';
import { Trabajador, TrabajadorSearchQuery } from '@/types/recursosHumanos/trabajador.types';

export const TrabajadorList: React.FC = () => {
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

  return (
    <div className="trabajador-list-container">
      <div className="page-header">
        <h1>Gestión de Trabajadores</h1>
        <button className="btn btn-primary">
          + Nuevo Trabajador
        </button>
      </div>

      {/* Formulario de búsqueda */}
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

          <div className="form-group">
            <label>
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

      {/* Resultados */}
      <div className="results-section">
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={clearError} className="error-close">✕</button>
          </div>
        )}

        {isLoading ? (
          <div className="loading">
            Cargando trabajadores...
          </div>
        ) : (
          <>
            <div className="results-header">
              <h3>Trabajadores ({trabajadores.length})</h3>
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
                No hay resultados que coincidan con tu búsqueda
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 