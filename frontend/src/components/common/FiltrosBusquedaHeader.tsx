import React from 'react';

interface FiltrosBusquedaHeaderProps {
  titulo?: string;
}

export const FiltrosBusquedaHeader: React.FC<FiltrosBusquedaHeaderProps> = ({ titulo = 'Filtros de Búsqueda' }) => (
  <div style={{
    background: '#f8f9fa',
    padding: '0.35rem 0.75rem',
    borderTopLeftRadius: '0.6rem',
    borderTopRightRadius: '0.6rem',
    borderBottom: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    minHeight: '38px'
  }}>
    <i className="bi bi-search me-2" style={{ fontSize: '1.05rem', color: '#444' }}></i>
    <span style={{ color: '#222' }}>{titulo}</span>
  </div>
);

export default FiltrosBusquedaHeader; 