import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useRut, usePhone } from '@/hooks/useRut';
import { useTrabajadores } from '@/hooks/recursosHumanos/useTrabajadores';
import { CreateTrabajadorData } from '@/types/recursosHumanos/trabajador.types';
import { trabajadorService, TrabajadorService } from '@/services/recursosHumanos/trabajador.service';
import { useToast } from '@/components/common/Toast';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';

interface RegisterTrabajadorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  rutPrellenado?: string;
}

interface VerificarRUTModalProps {
  show: boolean;
  onHide: () => void;
  onRegistroNormal: (rut: string) => void;
  onReactivacion: (trabajador: Trabajador) => void;
}

export const VerificarRUTModal: React.FC<VerificarRUTModalProps> = ({
  show,
  onHide,
  onRegistroNormal,
  onReactivacion
}) => {
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();
  const { formatRUT, validateRUT } = useRut();

  // Resetear el estado cuando el modal se abre
  useEffect(() => {
    if (show) {
      setRut('');
      setError(null);
      setLoading(false);
    }
  }, [show]);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRut = formatRUT(e.target.value);
    setRut(formattedRut);
    setError(null);
  };

  const handleVerificar = async () => {
    if (!rut.trim()) {
      setError('El RUT es requerido');
      return;
    }

    if (!validateRUT(rut)) {
      setError('El RUT ingresado no es válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await trabajadorService.verificarEstadoRUT(rut);
      
      if (!response.success) {
        setError('Error al verificar el RUT');
        return;
      }

      const { existe, activo, trabajador } = response.data;

      if (!existe) {
        // RUT no existe - ir a registro normal
        onHide();
        onRegistroNormal(rut);
      } else if (activo) {
        // RUT existe y está activo - mostrar error
        setError('Este trabajador ya existe y está activo en el sistema');
      } else {
        // RUT existe pero está desvinculado - ir a reactivación
        onHide();
        onReactivacion(trabajador!);
      }
    } catch (error: any) {
      console.error('Error al verificar RUT:', error);
      showError('Error', 'Error al verificar el RUT. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRut('');
    setError(null);
    setLoading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-search me-2"></i>
          Verificar Trabajador
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="text-center mb-4">
          <p className="mb-0">Ingrese el RUT del trabajador para verificar su estado</p>
          <small className="text-muted">
            El sistema determinará automáticamente si es un nuevo registro o una reactivación
          </small>
        </div>

        <Form>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>RUT del Trabajador</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: 12.345.678-9"
                  value={rut}
                  onChange={handleRutChange}
                  isInvalid={!!error}
                  disabled={loading}
                  maxLength={12}
                />
                <Form.Control.Feedback type="invalid">
                  {error}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Formato requerido: XX.XXX.XXX-X
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          <i className="bi bi-x-circle me-2"></i>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleVerificar} 
          disabled={loading || !rut.trim()}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Verificando...
            </>
          ) : (
            <>
              <i className="bi bi-search me-2"></i>
              Verificar RUT
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface ReactivarTrabajadorModalProps {
  show: boolean;
  onHide: () => void;
  trabajador: Trabajador;
  onSuccess: () => void;
}

export const ReactivarTrabajadorModal: React.FC<ReactivarTrabajadorModalProps> = ({
  show,
  onHide,
  trabajador,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: trabajador.nombres || '',
    apellidoPaterno: trabajador.apellidoPaterno || '',
    apellidoMaterno: trabajador.apellidoMaterno || '',
    correoPersonal: trabajador.correoPersonal || '',
    telefono: trabajador.telefono || '',
    numeroEmergencia: trabajador.numeroEmergencia || '',
    direccion: trabajador.direccion || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showSuccess, showError } = useToast();
  const { formatRUT } = useRut();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }
    if (!formData.apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    }
    if (!formData.apellidoMaterno.trim()) {
      newErrors.apellidoMaterno = 'El apellido materno es requerido';
    }
    if (!formData.correoPersonal.trim()) {
      newErrors.correoPersonal = 'El correo personal es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoPersonal)) {
      newErrors.correoPersonal = 'El formato del correo no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await trabajadorService.reactivarTrabajador(trabajador.id, formData);
      
      if (response.success) {
        showSuccess(
          '¡Trabajador reactivado!', 
          `El trabajador se ha reactivado exitosamente. Nuevo correo corporativo: ${response.data.nuevoCorreoCorporativo}`
        );
        onSuccess();
        onHide();
      } else {
        showError('Error', response.message || 'Error al reactivar el trabajador');
      }
    } catch (error: any) {
      console.error('Error al reactivar trabajador:', error);
      showError('Error', 'Error inesperado al reactivar el trabajador');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombres: trabajador.nombres || '',
      apellidoPaterno: trabajador.apellidoPaterno || '',
      apellidoMaterno: trabajador.apellidoMaterno || '',
      correoPersonal: trabajador.correoPersonal || '',
      telefono: trabajador.telefono || '',
      numeroEmergencia: trabajador.numeroEmergencia || '',
      direccion: trabajador.direccion || ''
    });
    setErrors({});
    setLoading(false);
    onHide();
  };

  const formatFecha = (fecha: string | Date) => {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CL');
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-arrow-clockwise me-2 text-success"></i>
          Reactivar Trabajador
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Alert variant="info" className="mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Trabajador desvinculado encontrado.</strong> Puede modificar los datos antes de reactivarlo.
        </Alert>

        <Form>
          {/* Campos deshabilitados */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  value={formatRUT(trabajador.rut)}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  No se puede modificar
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="text"
                  value={formatFecha(trabajador.fechaNacimiento)}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  No se puede modificar
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha de Ingreso</Form.Label>
                <Form.Control
                  type="date"
                  value={(() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })()}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Automática (hoy)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Campos habilitados */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombres <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  isInvalid={!!errors.nombres}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombres}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido Paterno <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  isInvalid={!!errors.apellidoPaterno}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.apellidoPaterno}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido Materno <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                  isInvalid={!!errors.apellidoMaterno}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.apellidoMaterno}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Correo Personal <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="correoPersonal"
                  value={formData.correoPersonal}
                  onChange={handleInputChange}
                  isInvalid={!!errors.correoPersonal}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.correoPersonal}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="+56912345678"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Número de Emergencia</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroEmergencia"
                  value={formData.numeroEmergencia}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="+56987654321"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Calle, número, comuna, ciudad"
                />
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="success" className="mt-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Al reactivar:</strong>
            <ul className="mb-0 mt-2">
              <li>Se generará un nuevo correo corporativo (nunca se reutilizan correos anteriores)</li>
              <li>Se enviarán las nuevas credenciales al correo personal</li>
              <li>El rol será "Usuario" por defecto</li>
            </ul>
          </Alert>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          <i className="bi bi-x-circle me-2"></i>
          Cancelar
        </Button>
        <Button 
          variant="success" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Reactivando...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reactivar Trabajador
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const RegisterTrabajadorForm: React.FC<RegisterTrabajadorFormProps> = ({
  onSuccess,
  onCancel,
  rutPrellenado
}) => {
  const { createTrabajador } = useTrabajadores();
  const { formatRUT, validateRUT } = useRut();
  const { formatPhone, validatePhone } = usePhone();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  
  const [formData, setFormData] = useState<CreateTrabajadorData>({
    rut: rutPrellenado || '',
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
    // Limpiar errores solo del campo editado si el formulario ya fue validado
    if (validated) {
      // Si el campo editado ya no está vacío, no mostrar error para ese campo
      setValidated(false);
    }
    if (name === 'rut') {
      setFormData({ ...formData, [name]: formatRUT(value) });
    } else if (name === 'telefono' || name === 'numeroEmergencia') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else if (name === 'fechaNacimiento') {
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
                disabled={!!rutPrellenado}
                className={rutPrellenado ? "bg-light" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {validated && !validateRUT(formData.rut) && 'RUT inválido'}
              </Form.Control.Feedback>
              {rutPrellenado && (
                <Form.Text className="text-muted small">
                  <i className="bi bi-check-circle me-1 text-success"></i>
                  RUT verificado automáticamente
                </Form.Text>
              )}
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
                id="register-trabajador-fecha-nacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                required
                style={{ borderRadius: '8px' }}
                isInvalid={validated && !formData.fechaNacimiento.trim()}
              />
              <Form.Control.Feedback type="invalid">
                {validated && !formData.fechaNacimiento.trim() && 'Completa este campo'}
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
                {validated && !formData.nombres.trim() && 'Completa este campo'}
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
                {validated && !formData.apellidoPaterno.trim() && 'Completa este campo'}
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
                {validated && !formData.apellidoMaterno.trim() && 'Completa este campo'}
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
                {validated && !formData.correoPersonal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && 'Correo personal inválido'}
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
                {validated && !formData.telefono.trim() && 'Completa este campo'}
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
                {validated && !formData.direccion.trim() && 'Completa este campo'}
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