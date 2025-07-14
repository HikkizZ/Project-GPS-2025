import React from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { useMaintenanceSpareParts } from '../../../hooks/MachinaryMaintenance/MaintenanceSparePart/useMaintenanceSpareParts';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

const MaintenanceSparePartList: React.FC = () => {
  const { maintenanceSpareParts, loading, error, reload } = useMaintenanceSpareParts();

  const handleEdit = (id: number) => {
    console.log('Editar repuesto en mantención ID:', id);
    // Aquí puedes abrir un modal de edición con el ID
  };

  const handleDelete = (id: number) => {
    console.log('Eliminar repuesto en mantención ID:', id);
    // Aquí puedes invocar un modal de confirmación antes de eliminar
  };

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="mt-4">
      <h4>Repuestos Utilizados en Mantenciones</h4>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Repuesto</th>
            <th>Cantidad Utilizada</th>
            <th>Mantención ID</th>
            <th>Maquinaria</th>
            <th>Mecánico</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceSpareParts.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.repuesto.name}</td>
              <td>{item.cantidadUtilizada}</td>
              <td>{item.mantencion.id}</td>
              <td>{item.mantencion.maquinaria.patente} - {item.mantencion.maquinaria.modelo}</td>
              <td>{item.mantencion.mecanicoAsignado?.name || 'N/A'}</td>
              <td>
                <ButtonGroup size="sm">
                  <Button variant="outline-primary" onClick={() => handleEdit(item.id)}>
                    <PencilSquare />
                  </Button>
                  <Button variant="outline-danger" onClick={() => handleDelete(item.id)}>
                    <Trash />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MaintenanceSparePartList;