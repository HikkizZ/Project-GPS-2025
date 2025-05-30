import React from 'react';
import { Trabajador } from '@/types/trabajador.types';

interface TrabajadorCardProps {
  trabajador: Trabajador;
  onEdit?: (trabajador: Trabajador) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (trabajador: Trabajador) => void;
}

export const TrabajadorCard: React.FC<TrabajadorCardProps> = ({
  trabajador,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const nombreCompleto = `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`;
  
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const formatearSueldo = (sueldo: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(sueldo);
  };

  return (
    <div className="trabajador-card">
      <div className="card-header">
        <h3 className="trabajador-nombre">{nombreCompleto}</h3>
        <div className={`status-badge ${trabajador.enSistema ? 'active' : 'inactive'}`}>
          {trabajador.enSistema ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      <div className="card-body">
        <div className="info-group">
          <span className="label">RUT:</span>
          <span className="value">{trabajador.rut}</span>
        </div>

        <div className="info-group">
          <span className="label">Email:</span>
          <span className="value">{trabajador.correo}</span>
        </div>

        <div className="info-group">
          <span className="label">Teléfono:</span>
          <span className="value">{trabajador.telefono}</span>
        </div>

        <div className="info-group">
          <span className="label">Fecha de Ingreso:</span>
          <span className="value">{formatearFecha(trabajador.fechaIngreso)}</span>
        </div>

        {trabajador.fichaEmpresa && (
          <>
            <div className="info-group">
              <span className="label">Cargo:</span>
              <span className="value">{trabajador.fichaEmpresa.cargo}</span>
            </div>

            <div className="info-group">
              <span className="label">Área:</span>
              <span className="value">{trabajador.fichaEmpresa.area}</span>
            </div>

            <div className="info-group">
              <span className="label">Sueldo Base:</span>
              <span className="value">{formatearSueldo(trabajador.fichaEmpresa.sueldoBase)}</span>
            </div>

            <div className="info-group">
              <span className="label">Estado Laboral:</span>
              <span className={`value status-${trabajador.fichaEmpresa.estado.toLowerCase()}`}>
                {trabajador.fichaEmpresa.estado}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="card-actions">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(trabajador)}
            className="btn btn-info"
          >
            Ver Detalles
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(trabajador)}
            className="btn btn-warning"
          >
            Editar
          </button>
        )}

        {onDelete && trabajador.enSistema && (
          <button
            onClick={() => onDelete(trabajador.id)}
            className="btn btn-danger"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}; 