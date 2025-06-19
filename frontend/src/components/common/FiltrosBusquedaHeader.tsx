import React from 'react';

interface FiltrosBusquedaHeaderProps {
  titulo?: string;
}

export const FiltrosBusquedaHeader: React.FC<FiltrosBusquedaHeaderProps> = ({ titulo = 'Filtros de Búsqueda' }) => (
  <div className="card-header">
    <h6 className="card-title mb-0">
      <i className="bi bi-search me-2"></i>
      {titulo}
    </h6>
  </div>
);

export default FiltrosBusquedaHeader; 