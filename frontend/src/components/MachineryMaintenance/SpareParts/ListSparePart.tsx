import React, {useState} from 'react';
import { Table, Card, Button, Badge } from 'react-bootstrap';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';
import { useUpdateSparePart } from '@/hooks/MachinaryMaintenance/SparePart/useUpdateSparePart';
import AddStockModal from '@/components/MachineryMaintenance/SpareParts/AddStockModal'
import { useAuth } from '@/context/useAuth';
import ConfirmModal from "@/components/common/ConfirmModal"; 

interface Props {
  data: SparePart[];
  onEdit: (repuesto: SparePart) => void;
  onDelete: (id: number) => void;
  onReload: () => void;
  totalItems: number;
}

const ListSparePart: React.FC<Props> = ({ data, onEdit, onDelete, totalItems, onReload }) => {

  const getStockColor = (stock: number) => {
    if (stock > 20) return 'success';
    if (stock >= 5) return 'warning';
    if (stock === 0) return 'secondary';
    return 'danger';
  };

  const { user } = useAuth();
  const role = user?.role;



  const { updateSparePart, loading } = useUpdateSparePart();
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sparePartToDelete, setSparePartToDelete] = useState<SparePart | null>(null);

  const handleShowConfirmDelete = (repuesto: SparePart) => {
    setSparePartToDelete(repuesto);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (sparePartToDelete) {
      onDelete(sparePartToDelete.id);
      setShowConfirmModal(false);
      setSparePartToDelete(null);
    }
  };



  const handleShowAddStockModal = (repuesto: SparePart) => {
    setSelectedSparePart(repuesto);
    setShowAddStockModal(true);
  };

  const handleAddStock = async (id: number, cantidad: number) => {
    try {
      const updated = await updateSparePart(id, {
        stock: cantidad,
        modo: 'agregarStock', 
      });
      onReload(); 
    } catch (error) {
      console.error("Error al agregar stock:", error);
    } finally {
      setShowAddStockModal(false);
    }
  };


  return (
    <Card className="shadow-sm">
      <Card.Body>
        {data.length === 0 ? (
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
                Repuestos Registrados ({totalItems})
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
                    {role !== "Mecánico" && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {[...data]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((repuesto) => (
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
                     {role !== "Mecánico" && (
                        <td>
                          <div className="align-middle table-sm">
                            {role === "Mantenciones de Maquinaria" && (
                              <Button
                                variant="info"
                                size="sm"
                                className="px-1 me-1"
                                onClick={() => handleShowAddStockModal(repuesto)}
                              >
                                <i className="bi bi-plus-circle"></i>
                              </Button>
                            )}
                            {role === "SuperAdministrador" && (
                              <>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="px-1"
                                  onClick={() => onEdit(repuesto)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="px-1"
                                  onClick={() => handleShowConfirmDelete(repuesto)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>

                              </>
                            )}
                          </div>
                        </td>
                      )}

                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Card.Body>

            <AddStockModal
              show={showAddStockModal}
              onHide={() => setShowAddStockModal(false)}
              repuesto={selectedSparePart}
              onConfirm={handleAddStock}
            />
            
            <ConfirmModal
              show={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmDelete}
              title="¿Eliminar repuesto?"
              message={`¿Estás seguro que deseas eliminar el repuesto "${sparePartToDelete?.name}"? Esta acción no se puede deshacer.`}
              confirmText="Eliminar"
              cancelText="Cancelar"
              headerVariant="danger"
              warningContent={<p>El repuesto será eliminado del sistema y no podrá ser utilizado en nuevas mantenciones.</p>}
            />

    </Card>
  );
};

export default ListSparePart;
