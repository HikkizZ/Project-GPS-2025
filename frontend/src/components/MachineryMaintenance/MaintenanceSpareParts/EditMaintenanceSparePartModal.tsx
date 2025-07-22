import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { MaintenanceSparePart } from '@/types/machinaryMaintenance/maintenanceSparePart.types';
import { useSpareParts } from '@/hooks/MachinaryMaintenance/SparePart/useSpareParts';

import { useToast } from '@/components/common/Toast';
interface Props {
  show: boolean;
  onHide: () => void;
  onSave: (cantidad: number) => void;
  onReload: () => Promise<void>;
  initialData: MaintenanceSparePart | null;
  stockDisponible: number;
}

const EditMaintenanceSparePartModal: React.FC<Props> = ({ show, onHide, onSave, initialData, stockDisponible, onReload }) => {
    
    const [cantidad, setCantidad] = useState<number>(1);
    const [selectedId, setSelectedId] = useState<number>(0);
    const { showError, showSuccess } = useToast();
    const { spareParts, loading: loadingSpareParts, reload: reloadSpareParts } = useSpareParts();
    

    

        useEffect(() => {
            if (initialData) {
            setCantidad(initialData.cantidadUtilizada);
            }
        }, [initialData]);


        const handleSave = async () => {
            
            if (cantidad < 1) return;
            
            const repuestoId = initialData?.repuesto?.id;

            if (!repuestoId) return;
            
            const seleccionado = spareParts.find((s) => s.id === repuestoId);
            if (!seleccionado)return;
            
            if (cantidad > stockDisponible) {
            showError('Stock insuficiente', `Solo hay ${stockDisponible} unidades disponibles.`);
            return;
            }
            
            showSuccess('Actualizavión completada');
            await onSave(cantidad);     
            await onReload();  
        };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Editar cantidad utilizada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                    type="number"
                    value={cantidad}
                    min={1}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                Guardar cambios
                </Button>
            </Modal.Footer>
        </Modal>
  );
};

export default EditMaintenanceSparePartModal;
