import { useSpareParts } from '../../../hooks/MachinaryMaintenance/SparePart/useSpareParts';
import { deleteSparePart } from '../../../services/machinaryMaintenance/sparePart.service';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useState } from 'react';

const SparePartList = () => {
  const { spareParts, loading, error, reload } = useSpareParts();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);

  const handleEdit = (sparePart: SparePart) => {
  setSelectedSparePart(sparePart);
  setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteError(null);
    const response = await deleteSparePart(id);
    if (response.success) {
      reload();
    } else {
      setDeleteError(response.message);
    }
    setDeletingId(null);
  };

  return (
    <div className="p-3">
      <h2 className="mb-4">Listado de Repuestos</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Grupo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {spareParts.map((rep) => (
              <tr key={rep.id}>
                <td>{rep.name}</td>
                <td>{rep.stock}</td>
                <td>{rep.marca}</td>
                <td>{rep.modelo}</td>
                <td>{rep.anio}</td>
                <td>{rep.grupo}</td>
                <td><Button variant="warning" onClick={() => handleEdit(sp)}>Editar</Button></td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(rep.id)}
                    disabled={deletingId === rep.id}
                  >
                    {deletingId === rep.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default SparePartList;
