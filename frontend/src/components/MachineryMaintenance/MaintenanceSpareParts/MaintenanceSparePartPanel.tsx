import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Spinner } from 'react-bootstrap';
import { useSpareParts } from '@/hooks/MachinaryMaintenance/SparePart/useSpareParts';
import { useMaintenanceSpareParts } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useMaintenanceSpareParts';
import { useCreateMaintenanceSparePart } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useCreateMaintenanceSparePart';
import { useDeleteMaintenanceSparePart } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useDeleteMaintenanceSparePart';
import { useUpdateMaintenanceSparePart } from '@/hooks/MachinaryMaintenance/MaintenanceSparePart/useUpdateMaintenanceSparePart';
import EditMaintenanceSparePartModal from '@/components/MachineryMaintenance/MaintenanceSpareParts/EditMaintenanceSparePartModal'; 
import { MaintenanceSparePart } from '@/types/machinaryMaintenance/maintenanceSparePart.types';

import { useToast } from '@/components/common/Toast';

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
    const { update } = useUpdateMaintenanceSparePart();



    const [cantidad, setCantidad] = useState<number>(1);
    const [selectedId, setSelectedId] = useState<number>(0);

    useEffect(() => {
        if (mantencionId && show) reload();
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
                
                if (!confirm('¿Estás seguro de que deseas eliminar este repuesto utilizado?')) return;
                try {
                    await remove(id);

                        showSuccess('Repuesto eliminado', 'Se eliminó correctamente.');
                        reload();
                        reloadSpareParts();

                    } catch (error) {
                    showError('Error al eliminar', String(error));
                    }
                }
                

                    

            const handleAgregar = async () => {

                if (!selectedId || cantidad < 1) return;

                const seleccionado = spareParts.find((s) => s.id === selectedId);
                if (!seleccionado) return;

                if (cantidad > seleccionado.stock) {
                showError('Stock insuficiente', `Solo hay ${seleccionado.stock} unidades disponibles.`);
                return;
                }

                const yaExiste = repuestosUsados.some(r => r.repuesto.id === selectedId);
                    if (yaExiste) {
                    showError('Repuesto duplicado', 'Este repuesto ya fue registrado en esta mantención.');
                    return;
                }


                const [data, error] = await create({
                    repuestoId: selectedId,
                    cantidadUtilizada: cantidad,
                    mantencionId
                });

                if (error) {
                    showError('Error', error);
                return;
            }

                showSuccess('Repuesto registrado', 'Se agregó correctamente');
                setCantidad(1);
                setSelectedId(0);
                reload();
                reloadSpareParts();
                resetCreate();

            };


  const repuestosFiltrados = spareParts;
  const repuestosUsados = maintenanceSpareParts.filter((r) => r.mantencion?.id === mantencionId);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Repuestos Utilizados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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

          <Form.Group className="mt-2">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </Form.Group>

          <Button className="mt-3" onClick={handleAgregar} disabled={creating}>
            {creating ? 'Agregando...' : 'Agregar'}
          </Button>
        </Form>

        <h3 style={{ textAlign: 'center',minWidth: '250px', fontWeight: 700  }}>Repuestos ya registrados</h3>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th  style={{ textAlign: 'center'  }}>Nombre</th>
                <th style={{ textAlign: 'center'  }}>Cantidad</th>
                <th style={{ textAlign: 'center',minWidth: '250px', fontWeight: 700  }}>Editar</th>
              </tr>
            </thead>
            <tbody>
              {repuestosUsados.map((r) => (
                <tr key={r.id}>
                    <td style={{ textAlign: 'center'  }}>{r.repuesto?.name ?? 'Desconocido'}</td>
                    <td style={{ textAlign: 'center'  }}>{r.cantidadUtilizada}</td>
                    <td style={{ textAlign: 'center', minWidth: '1px', fontWeight: 700,  width: '120px' }}><div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <Button size="sm" variant="warning" onClick={() => handleEditClick(r)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)} disabled={deleting}>Eliminar</Button>
                    </div></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
        <EditMaintenanceSparePartModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                onSave={handleSaveEdit}
                initialData={selectedItem}
                stockDisponible={spareParts.find((s) => s.id === selectedItem?.repuesto?.id)?.stock ?? 0}
                onReload={reload}
            />
    </Modal>
  );
};

export default MaintenanceSparePartPanel;
