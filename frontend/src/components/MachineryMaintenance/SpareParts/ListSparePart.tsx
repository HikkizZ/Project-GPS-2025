import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  data: SparePart[];
  onEdit: (repuesto: SparePart) => void;
  onDelete: (id: number) => void;
  onReload: () => void;
}

const ListSparePart: React.FC<Props> = ({ data, onEdit, onDelete }) => {
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  return (

    
    <Table striped bordered hover responsive>
      
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Stock</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>Grupo</th>
          <th style={{ minWidth: '150px' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((repuesto) => (
          <tr key={repuesto.id}>
            <td>{repuesto.name}</td>
            <td>{repuesto.stock}</td>
            <td>{repuesto.marca}</td>
            <td>{repuesto.modelo}</td>
            <td>{repuesto.anio}</td>
            <td>{repuesto.grupo}</td>
            <td>
              <Button variant="warning" size="sm" onClick={() => onEdit(repuesto)}>Editar</Button>{' '}
              <Button variant="danger" size="sm" onClick={() => onDelete(repuesto.id)}>Eliminar</Button>
                        </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ListSparePart;
