import React, { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useRut } from '@/hooks/useRut';
import { useTrabajadores } from '@/hooks/useTrabajadores';
import { CreateTrabajadorData } from '@/types/trabajador.types';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<CreateTrabajadorData>({
    rut: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
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
    setError('');

    // Validaciones
    if (!validateRUT(formData.rut)) {
      setError('RUT inválido');
      return;
    }

    if (!formData.nombres || !formData.apellidoPaterno || !formData.apellidoMaterno) {
      setError('Los nombres y apellidos son obligatorios');
      return;
    }

    if (!formData.correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Correo electrónico inválido');
      return;
    }

    try {
      setIsLoading(true);
      const result = await createTrabajador(formData);
      if (result.success) {
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
    if (name === 'rut') {
      setFormData({ ...formData, [name]: formatRUT(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="px-2">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Primera fila - Identificación */}
      <Row className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>RUT: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="rut"
              value={formData.rut}
              onChange={handleInputChange}
              placeholder="12.345.678-9"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Fecha de Ingreso:</Form.Label>
            <Form.Control
              type="date"
              value={formData.fechaIngreso}
              readOnly
              disabled
              className="bg-light"
            />
            <Form.Text className="text-muted small">
              Se establece automáticamente al día de hoy
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Segunda fila - Nombres y Fecha Nacimiento */}
      <Row className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nombres: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
              placeholder="Nombres completos"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Fecha de Nacimiento:</Form.Label>
            <Form.Control
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleInputChange}
              placeholder="dd-mm-aaaa"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Tercera fila - Apellidos */}
      <Row className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Apellido Paterno: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleInputChange}
              placeholder="Apellido paterno"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Apellido Materno: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleInputChange}
              placeholder="Apellido materno"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Cuarta fila - Contacto */}
      <Row className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Email: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              placeholder="correo@empresa.com"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Teléfono: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="+56912345678"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Quinta fila - Teléfono Emergencia y Dirección */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Teléfono de Emergencia:</Form.Label>
            <Form.Control
              type="tel"
              name="numeroEmergencia"
              value={formData.numeroEmergencia}
              onChange={handleInputChange}
              placeholder="+56987654321"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Dirección: <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Av. Principal 123, Comuna, Ciudad"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button 
          variant="secondary" 
          onClick={onCancel} 
          disabled={isLoading}
          size="sm"
        >
          <i className="bi bi-x-circle me-1"></i>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isLoading}
          size="sm"
        >
          <i className="bi bi-check-circle me-1"></i>
          {isLoading ? 'Registrando...' : 'Registrar Trabajador'}
        </Button>
      </div>
    </Form>
  );
}; 