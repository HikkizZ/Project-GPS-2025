  import React from 'react';
  import { Card, Table, Button } from 'react-bootstrap';
  import type { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';

  interface Props {
    records: MaintenanceRecord[];
    isLoading: boolean;
    hasActiveLocalFilters?: boolean;
    onLocalFilterReset?: () => void;
    onVerDetalle?: (record: MaintenanceRecord) => void;
    
  }

  const ListCompleteMaintenance: React.FC<Props> = ({
    records,
    isLoading,
    hasActiveLocalFilters = false,
    onLocalFilterReset,
    onVerDetalle,
  }) => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando mantenciones completadas...</p>
        </div>
      );
    }

    function getEstadoBadgeClass(estado: string): string {
      switch (estado) {
        case "completada":
          return "bg-success";
        case "irrecuperable":
          return "bg-danger";
        default:
          return "bg-secondary";
      }
    }
    return (
      <Card className="shadow-sm">
        <Card.Body>
          {records.length === 0 ? (
            hasActiveLocalFilters ? (
              <div className="text-center py-5">
                <i className="bi bi-box-x fs-1 text-muted mb-3 d-block"></i>
                <h5 className="text-muted">No hay resultados que coincidan con tu búsqueda</h5>
                <p className="text-muted">Intenta ajustar los filtros para obtener más resultados</p>
                {onLocalFilterReset && (
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-secondary" onClick={onLocalFilterReset}>
                      <i className="bi bi-arrow-clockwise me-2"></i> Limpiar Filtros Locales
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-tools fs-1 text-muted mb-3 d-block"></i>
                <h5 className="text-muted">No hay mantenciones completadas</h5>
                <p className="text-muted">Aquí aparecerán las mantenciones una vez que se completen</p>
              </div>
            )
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  <i className="bi bi-check2-circle me-2"></i>
                  Mantenciones Completadas ({records.length})
                </h6>
                {hasActiveLocalFilters && (
                  <div className="d-flex align-items-center text-muted">
                    <i className="bi bi-funnel-fill me-1"></i>
                    <small>Filtros locales activos</small>
                  </div>
                )}
              </div>
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light text-center">
                    <tr>
                      <th className="text-center">Patente</th>
                      <th className="text-center">Modelo</th>
                      <th className="text-center">Grupo</th>
                      <th className="text-center">Chasis</th>
                      <th className="text-center">Mecánico</th>
                      <th className="text-center">Entrada</th>
                      <th className="text-center">Salida</th>
                      <th className="text-center">Estado</th>
                      <th className="text-center">Ver Más</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="text-center">{record.maquinaria.patente}</td>
                        <td className="text-center">{record.maquinaria.modelo}</td>
                        <td className="text-center">{record.maquinaria.grupo.replace(/_/g, ' ')}</td>
                        <td className="text-center">{record.maquinaria.numeroChasis}</td>
                        <td className="text-center">
                          {record.mecanicoAsignado.trabajador
                            ? `${record.mecanicoAsignado.trabajador.nombres} ${record.mecanicoAsignado.trabajador.apellidoPaterno}`
                            : record.mecanicoAsignado.rut}
                        </td>
                        <td className="text-center">{new Date(record.fechaEntrada).toLocaleDateString()}</td>
                        <td className="text-center">{record.fechaSalida ? new Date(record.fechaSalida).toLocaleDateString() : '-'}</td>
                        <td className="text-center">
                          <span className={`badge ${getEstadoBadgeClass(record.estado)} text-uppercase`}>
                            {record.estado}
                          </span>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onVerDetalle && onVerDetalle(record)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  export default ListCompleteMaintenance;
