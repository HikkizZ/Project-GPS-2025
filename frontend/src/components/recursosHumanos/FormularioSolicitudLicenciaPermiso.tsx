import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import { useLicenciasPermisos } from '@/hooks/recursosHumanos/useLicenciasPermisos';
import { 
  CreateLicenciaPermisoForm, 
  TipoSolicitud 
} from '@/types/recursosHumanos/licenciaPermiso.types';
import { Toast, useToast } from '@/components/common/Toast';

interface FormularioSolicitudLicenciaPermisoProps {
  onSuccess: (message: string) => void;
  onCancel?: () => void;
}

export const FormularioSolicitudLicenciaPermiso: React.FC<FormularioSolicitudLicenciaPermisoProps> = ({
  onSuccess,
  onCancel
}) => {
  const { crearSolicitud, isCreating, error, validationErrors, limpiarErrores } = useLicenciasPermisos();
  
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  const [formData, setFormData] = useState<CreateLicenciaPermisoForm>({
    tipo: TipoSolicitud.PERMISO,
    fechaInicio: '',
    fechaFin: '',
    motivoSolicitud: '',
    archivo: undefined
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [archivoInfo, setArchivoInfo] = useState<string>('');

  // Calcular días automáticamente
  const calcularDias = () => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      const diferencia = fin.getTime() - inicio.getTime();
      const dias = Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
      return dias > 0 ? dias : 0;
    }
    return 0;
  };

  // Validaciones del frontend
  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};
    // Crear fecha de hoy en formato local para evitar problemas de zona horaria
    const hoy = new Date();
    const fechaHoyString = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    // Debug temporal
    console.log('=== DEBUG FECHAS ===');
    console.log('formData.fechaInicio:', formData.fechaInicio);
    console.log('fechaHoyString:', fechaHoyString);
    console.log('formData.tipo:', formData.tipo);
    console.log('comparación (inicio < hoy):', formData.fechaInicio < fechaHoyString);
    console.log('error del hook:', error);
    console.log('localErrors:', localErrors);
    console.log('validationErrors:', validationErrors);
    console.log('==================');

    // Validar fechas
    if (!formData.fechaInicio) {
      errores.fechaInicio = 'La fecha de inicio es requerida';
    } else {
      // Usar >= para permitir fechas de hoy en adelante
      if (formData.fechaInicio < fechaHoyString) {
        errores.fechaInicio = 'La fecha de inicio debe ser hoy o en el futuro';
      }
    }

    if (!formData.fechaFin) {
      errores.fechaFin = 'La fecha de fin es requerida';
    } else if (formData.fechaInicio) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);
      if (fechaFin <= fechaInicio) {
        errores.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validar motivo
    if (!formData.motivoSolicitud.trim()) {
      errores.motivoSolicitud = 'El motivo es requerido';
    } else if (formData.motivoSolicitud.trim().length < 10) {
      errores.motivoSolicitud = 'El motivo debe tener al menos 10 caracteres';
    } else if (formData.motivoSolicitud.trim().length > 500) {
      errores.motivoSolicitud = 'El motivo no puede exceder los 500 caracteres';
    }

    // Validar archivo para licencias médicas
    if (formData.tipo === TipoSolicitud.LICENCIA && !formData.archivo) {
      errores.archivo = 'Las licencias médicas requieren un archivo adjunto';
    }

    setLocalErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limpiarErrores();
    setLocalErrors({});

    if (!validarFormulario()) {
      return;
    }

    try {
      const result = await crearSolicitud(formData);
      if (result.success) {
        // Limpiar formulario
        setFormData({
          tipo: TipoSolicitud.PERMISO,
          fechaInicio: '',
          fechaFin: '',
          motivoSolicitud: '',
          archivo: undefined
        });
        setArchivoInfo('');
        
        showSuccess('¡Solicitud enviada!', result.message || 'Tu solicitud ha sido enviada exitosamente y está pendiente de aprobación');
        onSuccess(result.message || 'Solicitud creada exitosamente');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores cuando el usuario hace cambios
    limpiarErrores(); // Limpiar error general del hook
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      // Validar tipo de archivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!tiposPermitidos.includes(archivo.type)) {
        setLocalErrors(prev => ({ 
          ...prev, 
          archivo: 'Solo se permiten archivos PDF, JPG, JPEG o PNG' 
        }));
        showWarning('Archivo no válido', 'Solo se permiten archivos PDF, JPG, JPEG o PNG');
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (archivo.size > maxSize) {
        setLocalErrors(prev => ({ 
          ...prev, 
          archivo: 'El archivo no puede ser mayor a 10MB' 
        }));
        showWarning('Archivo muy grande', 'El archivo no puede ser mayor a 10MB');
        return;
      }

      setFormData(prev => ({ ...prev, archivo }));
      setArchivoInfo(`${archivo.name} (${(archivo.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Limpiar error de archivo
      if (localErrors.archivo) {
        setLocalErrors(prev => ({ ...prev, archivo: '' }));
      }
    }
  };

  const removerArchivo = () => {
    setFormData(prev => ({ ...prev, archivo: undefined }));
    setArchivoInfo('');
    // Limpiar el input de archivo
    const fileInput = document.getElementById('archivo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipo = e.target.value as TipoSolicitud;
    setFormData(prev => ({ 
      ...prev, 
      tipo: nuevoTipo,
      // Limpiar archivo si cambio de licencia a permiso
      archivo: nuevoTipo === TipoSolicitud.PERMISO ? undefined : prev.archivo
    }));
    
    if (nuevoTipo === TipoSolicitud.PERMISO) {
      setArchivoInfo('');
      // Limpiar el input de archivo
      const fileInput = document.getElementById('archivo') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Limpiar errores cuando se monta el componente
  useEffect(() => {
    limpiarErrores(); // Limpiar errores al montar
    return () => {
      limpiarErrores(); // Limpiar errores al desmontar
    };
  }, []); // Array vacío - solo se ejecuta al montar/desmontar

  const tieneErrores = !!error || Object.keys(localErrors).length > 0 || Object.keys(validationErrors).length > 0;
  const diasCalculados = calcularDias();

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Solicitud de Licencia o Permiso
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Mostrar errores generales */}
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Información importante */}
          <Alert variant="info" className="mb-4">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Información importante:</strong>
            <ul className="mb-0 mt-2">
              <li>Las <strong>licencias médicas</strong> requieren adjuntar un archivo (certificado médico)</li>
              <li>Los <strong>permisos administrativos</strong> no requieren archivo adjunto</li>
              <li>Las fechas no pueden ser en el pasado</li>
              <li>Su solicitud será revisada por Recursos Humanos</li>
            </ul>
          </Alert>

          {/* Primera fila - Tipo de solicitud */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Tipo de Solicitud: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleTipoChange}
                  isInvalid={!!(localErrors.tipo || validationErrors.tipo)}
                  required
                >
                  <option value={TipoSolicitud.PERMISO}>Permiso Administrativo</option>
                  <option value={TipoSolicitud.LICENCIA}>Licencia Médica</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {localErrors.tipo || validationErrors.tipo}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.tipo === TipoSolicitud.LICENCIA 
                    ? 'Requiere certificado médico adjunto' 
                    : 'No requiere documentación adicional'
                  }
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Segunda fila - Fechas */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Fecha de Inicio: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  isInvalid={!!(localErrors.fechaInicio || validationErrors.fechaInicio)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {localErrors.fechaInicio || validationErrors.fechaInicio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Fecha de Fin: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  isInvalid={!!(localErrors.fechaFin || validationErrors.fechaFin)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {localErrors.fechaFin || validationErrors.fechaFin}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Mostrar días calculados */}
          {diasCalculados > 0 && (
            <Row className="mb-3">
              <Col md={12}>
                <Alert variant="light" className="border py-2">
                  <i className="bi bi-calendar-event me-2"></i>
                  <strong>Duración:</strong> {diasCalculados} día{diasCalculados !== 1 ? 's' : ''}
                  {diasCalculados > 30 && (
                    <Badge bg="warning" className="ms-2">
                      Período extenso
                    </Badge>
                  )}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Tercera fila - Motivo */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Motivo de la Solicitud: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="motivoSolicitud"
                  value={formData.motivoSolicitud}
                  onChange={handleInputChange}
                  placeholder="Describe detalladamente el motivo de tu solicitud..."
                  isInvalid={!!(localErrors.motivoSolicitud || validationErrors.motivoSolicitud)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {localErrors.motivoSolicitud || validationErrors.motivoSolicitud}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.motivoSolicitud.length}/500 caracteres (mínimo 10)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Cuarta fila - Archivo (solo para licencias) */}
          {formData.tipo === TipoSolicitud.LICENCIA && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Archivo Adjunto (Certificado Médico): <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="archivo"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleArchivoChange}
                    isInvalid={!!(localErrors.archivo || validationErrors.archivo)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {localErrors.archivo || validationErrors.archivo}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Formatos permitidos: PDF, JPG, PNG (máximo 10MB)
                  </Form.Text>
                  
                  {archivoInfo && (
                    <Alert variant="success" className="mt-2 py-2">
                      <i className="bi bi-file-earmark-check me-2"></i>
                      {archivoInfo}
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="ms-2"
                        onClick={removerArchivo}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </Alert>
                  )}
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Botones */}
          <Row className="mt-4">
            <Col md={12}>
              <div className="d-flex gap-2 justify-content-end">
                {onCancel && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={onCancel}
                    disabled={isCreating}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </Button>
                )}
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isCreating || tieneErrores}
                >
                  {isCreating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Crear Solicitud
                    </>
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
      
      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </Card>
  );
}; 