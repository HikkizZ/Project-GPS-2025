import React from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { Supplier } from '@/types/stakeholders/supplier.types';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  isLoading?: boolean;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete, isLoading = false }) => {
  return (
    <div className="table-responsive">
      {isLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive className="align-middle">
          <thead className="table-primary">
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-3">
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.rut}</td>
                  <td>{supplier.address}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => onEdit(supplier)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(supplier)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default SupplierTable;
