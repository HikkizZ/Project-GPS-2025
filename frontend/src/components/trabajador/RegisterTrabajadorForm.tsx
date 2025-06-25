import React, { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useRut, usePhone } from '@/hooks/useRut';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { CreateTrabajadorData } from '@/types/recursosHumanos/trabajador.types';

interface RegisterTrabajadorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegisterTrabajadorForm: React.FC<RegisterTrabajadorFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { createTrabajador } = useTrabajadores();
  const { formatRUT, validateRUT } = useRut();
  const { formatPhone, validatePhone } = usePhone();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  
  const [formData, setFormData] = useState<CreateTrabajadorData>({
    rut: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    telefono: '',
    correoPersonal: '',
    numeroEmergencia: '',
    direccion: '',
    fechaIngreso: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);
    setError('');
    setAdvertencias([]);

    // Validar campos obligatorios
    const isValid = validateRUT(formData.rut) &&
                   formData.nombres.trim() &&
                   formData.apellidoPaterno.trim() &&
                   formData.apellidoMaterno.trim() &&
                   formData.fechaNacimiento.trim() &&
                   formData.correoPersonal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
                   formData.telefono.trim() &&
                   formData.direccion.trim();

    if (!isValid) {
      return; // No mostrar mensaje de error general, dejar que los campos individuales muestren sus errores
    }

    try {
      setIsLoading(true);
      const result = await createTrabajador(formData);
      if (result.success) {
        if (result.advertencias && result.advertencias.length > 0) {
          setAdvertencias(result.advertencias);
        }
        onSuccess();
      } else {
        setError(result.error || 'Error al crear trabajador');
      }
    } catch (error) {
      setError('Error al crear trabajador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (validated) {
      setValidated(false);
    }
    
    if (name === 'rut') {
      setFormData({ ...formData, [name]: formatRUT(value) });
    } else if (name === 'telefono' || name === 'numeroEmergencia') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else if (name === 'fechaNacimiento') {
      // Mantener la fecha exactamente como viene del input type="date"
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div style={{ padding: '0.5rem 1rem' }}>
      {error && (
        <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}
      {advertencias.length > 0 && (
        <Alert variant="warning" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-start">
            <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
            <div>
              <strong>Advertencias:</strong>
              <ul className="mb-0 mt-1">
                {advertencias.map((adv, index) => (
                  <li key={index}>{adv}</li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          {/* Primera fila - RUT y Fecha Ingreso */}
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">RUT: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                placeholder="12.345.678-9"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !validateRUT(formData.rut)}
              />
              <Form.Control.Feedback type="invalid">
                {!formData.rut.trim() ? 'Completa este campo' : 'RUT inválido'}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Fecha de Ingreso:</Form.Label>
              <Form.Control
                type="date"
                value={formData.fechaIngreso}
                readOnly
                disabled
                className="bg-light"
                style={{ borderRadius: '8px' }}
              />
              <Form.Text className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Automática (hoy)
              </Form.Text>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Fecha de Nacimiento: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.fechaNacimiento.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Completa este campo
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          {/* Segunda fila - Nombres completos */}
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Nombres: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                placeholder="Nombres completos"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.nombres.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Completa este campo
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Apellido Paterno: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleInputChange}
                placeholder="Apellido paterno"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.apellidoPaterno.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Completa este campo
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Apellido Materno: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleInputChange}
                placeholder="Apellido materno"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.apellidoMaterno.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Completa este campo
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          {/* Tercera fila - Contacto */}
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Correo Personal: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="correoPersonal"
                value={formData.correoPersonal}
                onChange={handleInputChange}
                placeholder="correo@gmail.com"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.correoPersonal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
              />
              <Form.Control.Feedback type="invalid">
                {!formData.correoPersonal.trim() ? 'Completa este campo' : 'Correo personal inválido'}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Teléfono: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+56912345678"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.telefono.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Completa este campo
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group>
              <Form.Label className="fw-semibold">Teléfono de Emergencia:</Form.Label>
              <Form.Control
                type="tel"
                name="numeroEmergencia"
                value={formData.numeroEmergencia}
                onChange={handleInputChange}
                placeholder="+56987654321"
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
          </div>

          {/* Cuarta fila - Dirección */}
          <div className="col-12">
            <Form.Group>
              <Form.Label className="fw-semibold">Dirección: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Av. Principal 123, Comuna, Ciudad"
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.direccion.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Completa este campo
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
          <Button 
            variant="outline-secondary" 
            onClick={onCancel} 
            disabled={isLoading}
            style={{ borderRadius: '20px', fontWeight: '500' }}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
            style={{ borderRadius: '20px', fontWeight: '500' }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Registrar Trabajador
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}; 