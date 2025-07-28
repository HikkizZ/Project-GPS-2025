import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Table, Spinner } from 'react-bootstrap';
import { useSpareParts } from '@/hooks/MachinaryMaintenance/SparePart/useSpareParts';
import { useMaintenanceSpareParts } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useMaintenanceSpareParts';
import { useCreateMaintenanceSparePart } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useCreateMaintenanceSparePart';
import { useDeleteMaintenanceSparePart } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useDeleteMaintenanceSparePart';
import { useUpdateMaintenanceSparePart } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useUpdateMaintenanceSparePart';
import EditMaintenanceSparePartModal from '@/components/MachineryMaintenance/MaintenanceSpareParts/EditMaintenanceSparePartModal'; 
import { MaintenanceSparePart } from '@/types/machinaryMaintenance/maintenanceSparePart.types';
import { useAuth } from "@/context/useAuth";
import { useToast } from '@/components/common/Toast';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';

interface Props {
  mantencionId: number;
  show: boolean;
  onReload: () => Promise<void>;
  onHide: () => void;
}

const MaintenanceSparePartPanel: React.FC<Props> = ({ mantencionId, show, onHide }) => {
    
    const { spareParts, loading: loadingSpareParts, reload: reloadSpareParts } = useSpareParts();
    const { maintenanceSpareParts, loading, reload } = useMaintenanceSpareParts();
    const { create, loading: creating, error: errorCreate, success: successCreate, reset: resetCreate } = useCreateMaintenanceSparePart();
    const { showError, showSuccess } = useToast();
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MaintenanceSparePart | null>(null);
    const { update, loading: updating  } = useUpdateMaintenanceSparePart();
    const { user } = useAuth();
      
    
    const isAutorizado = ["SuperAdministrador", "Mecánico"].includes(user?.role);
    const isSuperAdmin = user?.role === "SuperAdministrador";



    const [cantidad, setCantidad] = useState<number>(1);
    const [selectedId, setSelectedId] = useState<number>(0);

    useEffect(() => {
      if (!show || !mantencionId) return;
      reload();
    }, [mantencionId, show]);
    

            const handleEditClick = (item: MaintenanceSparePart) => {
                setSelectedItem(item);
                setShowEditModal(true);
            };

            const handleSaveEdit = async (newCantidad: number) => {
            if (selectedItem) {
                await update(selectedItem.id, { cantidadUtilizada: newCantidad });
                reload();
                reloadSpareParts();
                setShowEditModal(false);
                setSelectedItem(null);
            }
            };

            const { remove, loading: deleting } = useDeleteMaintenanceSparePart();

            const handleDelete = async (id: number) => {
                
                try {
                    await remove(id);

                        showSuccess('Repuesto eliminado', 'Se eliminó correctamente.');
                        reload();
                        reloadSpareParts();

                    } catch (error) {
                    showError('Error al eliminar', String(error));
                    }
                }
                
            const handleClose = () => {
              setSelectedId(0);
              setCantidad(1);
              setSelectedItem(null);
              setShowEditModal(false);
              onHide();      
              reload();      
            };

            const handleAgregar = async () => {
              if (!selectedId || selectedId === 0) {
                showError("Selección inválida", "Debes seleccionar un repuesto.");
                return;
              }

              if (cantidad <= 0) {
                showError("Cantidad inválida", "La cantidad debe ser mayor que cero.");
                return;
              }

              const seleccionado = spareParts.find((s) => s.id === selectedId);
              if (!seleccionado) {
                showError("Repuesto no encontrado", "El repuesto seleccionado no existe.");
                return;
              }

              if (cantidad > seleccionado.stock) {
                showError("Stock insuficiente", `Solo hay ${seleccionado.stock} unidades disponibles.`);
                return;
              }

              const yaExiste = repuestosUsados.some(r => r.repuesto.id === selectedId);
              if (yaExiste) {
                showError("Repuesto duplicado", "Este repuesto ya fue registrado en esta mantención.");
                return;
              }

              const [data, error] = await create({
                repuestoId: selectedId,
                cantidadUtilizada: cantidad,
                mantencionId
              });

              if (error) {
                showError("Error", error);
                return;
              }

              showSuccess("Repuesto registrado", "Se agregó correctamente");
              setCantidad(1);
              setSelectedId(0);
              reload();
              reloadSpareParts();
              resetCreate();
            };



  const repuestosFiltrados = spareParts;
  const repuestosUsados = useMemo(
      () => maintenanceSpareParts.filter((r) => r.mantencion?.id === mantencionId),
      [maintenanceSpareParts, mantencionId]
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Repuestos Utilizados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isAutorizado && (
          <Form className="mb-3">
            <Form.Group>
              <Form.Label>Repuesto</Form.Label>
              <Form.Select
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                <option value={0}>Seleccione un repuesto</option>
                {repuestosFiltrados.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
                  <br></br>
            <Form.Control
              type="number"
              value={cantidad === 0 ? "" : cantidad}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setCantidad(0);
                  return;
                }
                const parsed = Number(value);
                if (!isNaN(parsed) && parsed >= 0) {
                  setCantidad(parsed);
                }
              }}
            />


            <Button className="mt-3" onClick={handleAgregar} disabled={creating}>
              {creating ? 'Agregando...' : 'Agregar'}
            </Button>
          </Form>
        )}

        <h3 style={{ textAlign: 'center',minWidth: '250px', fontWeight: 700  }}>Repuestos ya registrados</h3>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Nombre</th>
                <th style={{ textAlign: 'center' }}>Cantidad</th>
                {isSuperAdmin && (
                  <th style={{ textAlign: 'center', minWidth: '250px', fontWeight: 700 }}>Editar</th>
                )}
              </tr>
            </thead>

            <tbody>
              {repuestosUsados.map((r) => (
                <tr key={r.id}>
                  <td style={{ textAlign: 'center' }}>{r.repuesto?.name ?? 'Desconocido'}</td>
                  <td style={{ textAlign: 'center' }}>{r.cantidadUtilizada}</td>

                 {isSuperAdmin && (
                    <td
                      style={{
                        textAlign: 'center',
                        minWidth: '1px',
                        fontWeight: 700,
                        width: '120px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <Button size="sm" variant="warning" onClick={() => handleEditClick(r)}>
                         <i className="bi bi-pencil"></i>
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)} disabled={deleting}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

          </Table>
        )}
      </Modal.Body>
        <EditMaintenanceSparePartModal
                show={showEditModal}
                onHide={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                onSave={handleSaveEdit}
                initialData={selectedItem}
                stockDisponible={spareParts.find((s) => s.id === selectedItem?.repuesto?.id)?.stock ?? 0}
                onReload={reload}
            />
    </Modal>
  );
};

export default MaintenanceSparePartPanel;
