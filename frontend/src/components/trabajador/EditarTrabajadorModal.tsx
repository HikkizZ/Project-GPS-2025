import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { useRut, usePhone } from '@/hooks/useRut';
import { TrabajadorService } from '@/services/recursosHumanos/trabajador.service';

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
  const { formatPhone } = usePhone();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [correoError, setCorreoError] = useState<string>('');
  const [isValidatingCorreo, setIsValidatingCorreo] = useState(false);

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

    // Validar que no haya error de correo duplicado
    if (correoError !== '') {
      setError('Por favor, corrige el error en el correo personal antes de continuar');
      return;
    }

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

  // Función para validar correo personal
  const validateCorreoPersonal = async (correo: string) => {
    if (!correo || !correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setCorreoError('');
      return;
    }

    // Si el correo no cambió, no validar
    if (correo === trabajador.correoPersonal) {
      setCorreoError('');
      return;
    }

    setIsValidatingCorreo(true);
    setCorreoError('');

    try {
      const trabajadorService = new TrabajadorService();
      const response = await trabajadorService.verificarCorreoPersonal(correo, trabajador.id);
      
      if (!response.data.disponible) {
        setCorreoError(response.data.mensaje);
      }
    } catch (error) {
      console.error('Error al validar correo:', error);
    } finally {
      setIsValidatingCorreo(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'telefono' || name === 'numeroEmergencia') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPhone(value)
      }));
    } else if (name === 'correoPersonal') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Validar correo personal con debounce
      const timeoutId = setTimeout(() => {
        validateCorreoPersonal(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header 
        closeButton 
        style={{
          background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
          border: 'none'
        }}
        className="text-white"
      >
        <Modal.Title className="fw-semibold">
          <i className="bi bi-pencil-square me-2"></i>
          Editar Trabajador
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '1.5rem' }}>
        {error && (
          <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* RUT (solo lectura) */}
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">RUT</Form.Label>
                <Form.Control
                  type="text"
                  value={formatRUT(trabajador.rut)}
                  disabled
                  className="bg-light"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>

            {/* Nombres */}
            <div className="col-md-8">
              <Form.Group>
                <Form.Label className="fw-semibold">Nombres</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>

            {/* Apellidos */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Apellido Paterno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Apellido Materno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>

            {/* Contacto */}
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Correo Corporativo</Form.Label>
                <Form.Control
                  type="email"
                  name="corporateEmail"
                  value={trabajador.usuario?.corporateEmail || ''}
                  disabled
                  className="bg-light"
                  style={{ borderRadius: '8px' }}
                />
                <Form.Text className="text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  Se genera automáticamente y se actualiza con cambios de nombre
                </Form.Text>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Correo Personal (editable)</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="email"
                    name="correoPersonal"
                    value={formData.correoPersonal}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={correoError !== ''}
                  />
                  {isValidatingCorreo && (
                    <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Validando...</span>
                      </div>
                    </div>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {correoError}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted small">
                    <i className="bi bi-envelope me-1"></i>
                    Solo se actualiza para futuras comunicaciones
                  </Form.Text>
                </div>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Número de Emergencia</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroEmergencia"
                  value={formData.numeroEmergencia}
                  onChange={handleInputChange}
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>

            {/* Dirección */}
            <div className="col-8">
              <Form.Group>
                <Form.Label className="fw-semibold">Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                  style={{ borderRadius: '8px' }}
                />
              </Form.Group>
            </div>

            {/* Fechas */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  value={new Date(trabajador.fechaNacimiento).toISOString().split('T')[0]}
                  disabled
                  className="bg-light"
                  style={{ borderRadius: '8px' }}
                />
                <Form.Text className="text-muted small">
                  <i className="bi bi-lock me-1"></i>
                  No se puede modificar
                </Form.Text>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Fecha de Ingreso</Form.Label>
                <Form.Control
                  type="date"
                  value={new Date(trabajador.fechaIngreso).toISOString().split('T')[0]}
                  disabled
                  className="bg-light"
                  style={{ borderRadius: '8px' }}
                />
                <Form.Text className="text-muted small">
                  <i className="bi bi-lock me-1"></i>
                  No se puede modificar
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button 
              variant="outline-secondary" 
              onClick={onHide}
              style={{ borderRadius: '20px', fontWeight: '500' }}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              disabled={isLoading}
              style={{ borderRadius: '20px', fontWeight: '500' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
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