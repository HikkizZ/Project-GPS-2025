import React from 'react';
import { Table, Card, Button, Badge } from 'react-bootstrap';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  data: SparePart[];
  onEdit: (repuesto: SparePart) => void;
  onDelete: (id: number) => void;
  onReload: () => void;
}

const ListSparePart: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  const getStockColor = (stock: number) => {
    if (stock > 20) return 'success';
    if (stock >= 5) return 'warning';
    if (stock === 0) return 'secondary';
    return 'danger';
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {sortedData.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
            <h5 className="text-muted">No hay repuestos registrados</h5>
            <p className="text-muted">Cuando registres repuestos, aparecerán aquí</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between  mb-3">
              <h6 className="mb-0">
                <i className="bi bi-tools me-2"></i>
                Repuestos Registrados ({sortedData.length})
              </h6>
            </div>
            <div className="table-responsive">
              <Table hover className="align-middle table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Año</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((repuesto) => (
                    <tr key={repuesto.id}>
                      <td>{repuesto.name}</td>
                      <td>{repuesto.marca}</td>
                      <td>{repuesto.modelo}</td>
                      <td>{repuesto.anio}</td>
                      <td>
                        <Badge bg={getStockColor(repuesto.stock)} className="px-3">
                          {repuesto.stock}
                        </Badge>
                      </td>
                      <td>
                        <div className="align-middle table-sm">
                          <Button variant="warning" size="sm" className="px-1" onClick={() => onEdit(repuesto)}>
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="danger" size="sm" className="px-1" onClick={() => onDelete(repuesto.id)}>
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
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

export default ListSparePart;
