import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { useRut } from '@/hooks/useRut';

interface EditarTrabajadorModalProps {
  show: boolean;
  onHide: () => void;
  trabajador: Trabajador;
  onSuccess: () => void;
}

export const EditarTrabajadorModal: React.FC<EditarTrabajadorModalProps> = ({
  show,
  onHide,
  trabajador,
  onSuccess
}) => {
  const { updateTrabajador } = useTrabajadores();
  const { formatRUT } = useRut();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombres: trabajador.nombres,
    apellidoPaterno: trabajador.apellidoPaterno,
    apellidoMaterno: trabajador.apellidoMaterno,
    telefono: trabajador.telefono,
    numeroEmergencia: trabajador.numeroEmergencia || '',
    direccion: trabajador.direccion,
    correoPersonal: trabajador.correoPersonal,
  });

  // Actualizar el estado del formulario cuando cambia el trabajador
  useEffect(() => {
    setFormData({
      nombres: trabajador.nombres,
      apellidoPaterno: trabajador.apellidoPaterno,
      apellidoMaterno: trabajador.apellidoMaterno,
      telefono: trabajador.telefono,
      numeroEmergencia: trabajador.numeroEmergencia || '',
      direccion: trabajador.direccion,
      correoPersonal: trabajador.correoPersonal,
    });
  }, [trabajador]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await updateTrabajador(trabajador.id, formData);
      
      if (result.success) {
        onSuccess();
        onHide();
      } else {
        setError(result.error || 'Error al actualizar el trabajador');
      }
    } catch (err) {
      setError('Error al actualizar el trabajador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>
          <i className="bi bi-pencil-square me-2"></i>
          Editar Trabajador
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* RUT (solo lectura) */}
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  value={formatRUT(trabajador.rut)}
                  disabled
                />
              </Form.Group>
            </div>

            {/* Nombres */}
            <div className="col-md-8">
              <Form.Group>
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>

            {/* Apellidos */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Apellido Paterno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Apellido Materno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>

            {/* Contacto */}
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Correo de Usuario (Lamas)</Form.Label>
                <Form.Control
                  type="email"
                  value={trabajador.usuario?.email || ''}
                  disabled
                />
                <Form.Text className="text-muted">
                  Este correo se genera automáticamente y se actualiza si cambias nombre o apellido paterno
                </Form.Text>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Correo personal (editable)</Form.Label>
                <Form.Control
                  type="email"
                  name="correoPersonal"
                  value={formData.correoPersonal}
                  onChange={handleInputChange}
                  required
                />
                <Form.Text className="text-muted">
                  Si cambias el correo personal, solo se actualizará en el sistema para futuras comunicaciones.
                </Form.Text>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Número de Emergencia</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroEmergencia"
                  value={formData.numeroEmergencia}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>

            {/* Dirección */}
            <div className="col-12">
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>

            {/* Fechas */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  value={new Date(trabajador.fechaNacimiento).toISOString().split('T')[0]}
                  disabled
                />
                <Form.Text className="text-muted">
                  La fecha de nacimiento no se puede modificar
                </Form.Text>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Fecha de Ingreso</Form.Label>
                <Form.Control
                  type="date"
                  value={new Date(trabajador.fechaIngreso).toISOString().split('T')[0]}
                  disabled
                />
                <Form.Text className="text-muted">
                  La fecha de ingreso no se puede modificar
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide}>
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}; 