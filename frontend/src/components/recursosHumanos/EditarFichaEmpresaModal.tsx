import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Toast as BootstrapToast } from 'react-bootstrap';
import { FichaEmpresa, UpdateFichaEmpresaData, EstadoLaboral } from '@/types/recursosHumanos/fichaEmpresa.types';
import { updateFichaEmpresa, uploadContrato, downloadContrato, deleteContrato, getFichaEmpresa } from '@/services/recursosHumanos/fichaEmpresa.service';
import { useToast } from '@/components/common/Toast';

interface EditarFichaEmpresaModalProps {
  show: boolean;
  onHide: () => void;
  ficha: FichaEmpresa;
  onUpdate?: () => void;
}

// Función para formatear el RUT con puntos y guion
function formatearRut(rut: string): string {
  rut = rut.replace(/[^\dkK]/g, '').toUpperCase();
  if (rut.length < 2) return rut;
  const cuerpo = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dv = rut.slice(-1);
  return `${cuerpo}-${dv}`;
}

// Utilidad para formatear con puntos de miles
function formatMiles(value: string | number): string {
  const num = typeof value === 'number' ? value : value.replace(/\D/g, '');
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Utilidad para limpiar puntos
function cleanNumber(value: string): string {
  return value.replace(/\./g, '');
}

// Función para formatear sueldo
function formatSueldo(sueldo: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(sueldo);
}

// Función para formatear fecha sin problemas de zona horaria
const formatLocalDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const EditarFichaEmpresaModal: React.FC<EditarFichaEmpresaModalProps> = ({
  show,
  onHide,
  ficha,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validated, setValidated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasContrato, setHasContrato] = useState(!!ficha.contratoURL);
  const [hasChanges, setHasChanges] = useState(false);
  const [contratoEliminado, setContratoEliminado] = useState(false);
  const [initialFormData, setInitialFormData] = useState<UpdateFichaEmpresaData & { sueldoBase: string }>({
    cargo: '',
    area: '',
    tipoContrato: '',
    jornadaLaboral: '',
    sueldoBase: '',
    fechaInicioContrato: '',
    fechaFinContrato: ''
  });

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<UpdateFichaEmpresaData & { sueldoBase: string }>({
    cargo: (ficha.cargo && ficha.cargo !== 'Por Definir') ? ficha.cargo : '',
    area: (ficha.area && ficha.area !== 'Por Definir') ? ficha.area : '',
    tipoContrato: (ficha.tipoContrato && ficha.tipoContrato !== 'Por Definir') ? ficha.tipoContrato : '',
    jornadaLaboral: (ficha.jornadaLaboral && ficha.jornadaLaboral !== 'Por Definir') ? ficha.jornadaLaboral : '',
    sueldoBase: ficha.sueldoBase ? formatMiles(ficha.sueldoBase) : '',
    fechaInicioContrato: formatLocalDate(ficha.fechaInicioContrato),
    fechaFinContrato: formatLocalDate(ficha.fechaFinContrato)
  });

  useEffect(() => {
    if (show) {
      const newFormData = {
        cargo: (ficha.cargo && ficha.cargo !== 'Por Definir') ? ficha.cargo : '',
        area: (ficha.area && ficha.area !== 'Por Definir') ? ficha.area : '',
        tipoContrato: (ficha.tipoContrato && ficha.tipoContrato !== 'Por Definir') ? ficha.tipoContrato : '',
        jornadaLaboral: (ficha.jornadaLaboral && ficha.jornadaLaboral !== 'Por Definir') ? ficha.jornadaLaboral : '',
        sueldoBase: ficha.sueldoBase ? formatMiles(ficha.sueldoBase) : '',
        fechaInicioContrato: formatLocalDate(ficha.fechaInicioContrato),
        fechaFinContrato: formatLocalDate(ficha.fechaFinContrato)
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setHasChanges(false);
      setSelectedFile(null);
      setValidated(false);
      setContratoEliminado(false);
      setHasContrato(!!ficha.contratoURL);
    }
  }, [show, ficha]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    let newFormData;
    if (name === 'sueldoBase') {
      const numericValue = cleanNumber(value).replace(/[^0-9]/g, '');
      const formatted = numericValue ? formatMiles(numericValue) : '';
      newFormData = { ...formData, [name]: formatted };
    } else {
      newFormData = { ...formData, [name]: value };
    }
    setFormData(newFormData);
    // Si el formulario ya fue validado, revalidar solo el campo editado
    if (validated) {
      setValidated(false);
    }
    // Verificar si hay cambios comparando con los valores iniciales
    const hasAnyChange = Object.keys(newFormData).some(key => {
      if (key === 'sueldoBase') {
        const initialValue = cleanNumber(initialFormData[key]);
        const currentValue = cleanNumber(newFormData[key]);
        return initialValue !== currentValue;
      }
      return newFormData[key] !== initialFormData[key];
    });
    setHasChanges(hasAnyChange || !!selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showError('Archivo inválido', 'Solo se permiten archivos PDF', 4000);
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError('Archivo muy grande', 'El archivo no puede superar los 10MB', 4000);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setHasChanges(true);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Verificar si hay otros cambios además del archivo
    const hasOtherChanges = Object.keys(formData).some(key => {
      if (key === 'sueldoBase') {
        const initialValue = cleanNumber(initialFormData[key]);
        const currentValue = cleanNumber(formData[key]);
        return initialValue !== currentValue;
      }
      return formData[key] !== initialFormData[key];
    });
    setHasChanges(hasOtherChanges);
  };

  const handleDownloadFile = async () => {
    try {
      await downloadContrato(ficha.id);
      showSuccess('Descarga exitosa', 'El contrato se ha descargado correctamente', 4000);
    } catch (error: any) {
      showError('Error de descarga', error.message || 'Error al descargar el contrato', 6000);
    }
  };

  const handleDeleteFile = async () => {
    setShowDeleteConfirm(false);
    try {
      const response = await deleteContrato(ficha.id);
      if (response.success) {
        setHasContrato(false);
        setHasChanges(true);
        setContratoEliminado(true);
        showSuccess('Contrato eliminado', 'El contrato se ha eliminado exitosamente. Debe guardar los cambios para finalizar.', 6000);
      } else {
        showError('Error al eliminar', response.message || 'Error al eliminar el contrato', 6000);
      }
    } catch (error: any) {
      showError('Error al eliminar', error.message || 'Error al eliminar el contrato', 6000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);
    
    // Validar campos requeridos
    const isValid = formData.cargo.trim() && formData.cargo.trim() !== 'Por Definir' &&
                   formData.area.trim() && formData.area.trim() !== 'Por Definir' &&
                   formData.tipoContrato && formData.tipoContrato !== 'Por Definir' &&
                   formData.jornadaLaboral && formData.jornadaLaboral !== 'Por Definir' &&
                   formData.sueldoBase && 
                   parseInt(cleanNumber(formData.sueldoBase)) > 0 && 
                   formData.fechaInicioContrato;
    
    if (!isValid) {
      return; // No mostrar mensaje de error general, dejar que los campos individuales muestren sus errores
    }
    
    setLoading(true);

    try {
      const fichaId = typeof ficha.id === 'string' ? parseInt(ficha.id) : ficha.id;

      // Si hay un archivo seleccionado, subirlo
      if (selectedFile) {
        const uploadResponse = await uploadContrato(fichaId, selectedFile);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.message || 'Error al subir el contrato');
        }
      }

      // Procesar los datos antes de enviarlos
      const sueldoBaseNumber = formData.sueldoBase ? parseInt(cleanNumber(formData.sueldoBase)) : 0;

      const dataToSubmit = {
        cargo: formData.cargo.trim(),
        area: formData.area.trim(),
        tipoContrato: formData.tipoContrato,
        jornadaLaboral: formData.jornadaLaboral,
        sueldoBase: sueldoBaseNumber,
        fechaInicioContrato: formData.fechaInicioContrato,
        fechaFinContrato: formData.fechaFinContrato || undefined
      };

      if (!dataToSubmit.sueldoBase || dataToSubmit.sueldoBase <= 0) {
        throw new Error('El sueldo base debe ser mayor a 0');
      }

      // Actualizar ficha de empresa
      const response = await updateFichaEmpresa(fichaId, dataToSubmit);
      
      if (response.success) {
        if (onUpdate) onUpdate();
        onHide(); // Cerrar inmediatamente
      } else {
        showError('Error al actualizar', response.message || 'Error al actualizar la ficha', 6000);
      }
    } catch (error: any) {
      showError('Error inesperado', error.message || 'Error inesperado al actualizar la ficha', 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={onHide} 
        size="lg" 
        centered
        backdrop={contratoEliminado ? 'static' : true}
        keyboard={!contratoEliminado}
      >
        <Modal.Header 
          closeButton={!contratoEliminado}
          style={{
            background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
            border: 'none',
            padding: '1rem 1.25rem'
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-clipboard-data me-2"></i>
            Editar Ficha de Empresa
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.25rem' }}>
          {/* Información del Trabajador - Tamaño balanceado */}
          <div 
            className="mb-3 p-2" 
            style={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}
          >
            <div className="row">
              <div className="col-md-8">
                <span className="text-muted">Trabajador:</span>
                <strong className="ms-1">{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}</strong>
              </div>
              <div className="col-md-4">
                <span className="text-muted">RUT:</span>
                <strong className="ms-1">{formatearRut(ficha.trabajador.rut)}</strong>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="g-3 mb-3">
              {/* Cargo y Área */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Cargo <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="Ej: Desarrollador Senior"
                    isInvalid={validated && (!formData.cargo.trim() || formData.cargo.trim() === 'Por Definir')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.cargo.trim() || formData.cargo.trim() === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Área <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="Ej: Tecnología"
                    isInvalid={validated && (!formData.area.trim() || formData.area.trim() === 'Por Definir')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.area.trim() || formData.area.trim() === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              {/* Tipo de Contrato y Jornada */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Tipo de Contrato <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="tipoContrato"
                    value={formData.tipoContrato}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={validated && (!formData.tipoContrato || formData.tipoContrato === 'Por Definir')}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Indefinido">Indefinido</option>
                    <option value="Plazo Fijo">Plazo Fijo</option>
                    <option value="Por Obra">Por Obra</option>
                    <option value="Part-Time">Part-Time</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.tipoContrato || formData.tipoContrato === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Jornada Laboral <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="jornadaLaboral"
                    value={formData.jornadaLaboral}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={validated && (!formData.jornadaLaboral || formData.jornadaLaboral === 'Por Definir')}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Completa">Completa</option>
                    <option value="Media">Media</option>
                    <option value="Part-Time">Part-Time</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.jornadaLaboral || formData.jornadaLaboral === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              {/* Sueldo Base */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Sueldo Base <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="sueldoBase"
                    value={formData.sueldoBase}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="1.000.000"
                    isInvalid={validated && (!formData.sueldoBase || parseInt(cleanNumber(formData.sueldoBase)) <= 0)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.sueldoBase || parseInt(cleanNumber(formData.sueldoBase)) <= 0) && 'El sueldo debe ser mayor a 0'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* Fecha Inicio Contrato */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Fecha Inicio Contrato<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaInicioContrato"
                    value={formData.fechaInicioContrato}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={validated && !formData.fechaInicioContrato}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validated && !formData.fechaInicioContrato && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* Fecha Fin Contrato */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Fecha Fin Contrato</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaFinContrato"
                    value={formData.fechaFinContrato}
                    onChange={handleInputChange}
                    style={{ borderRadius: '8px' }}
                  />
                  <Form.Text className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Opcional para contratos indefinidos
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Sección de Contrato */}
            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem', marginTop: '1rem' }}>
              <h6 className="text-primary mb-3 fw-semibold">Contrato</h6>
              
              {/* Mostrar botones de descargar y eliminar si hay contrato */}
              {hasContrato ? (
                <>
                  <div className="d-flex align-items-center text-success mb-3">
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    <small>Contrato actual disponible</small>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleDownloadFile}
                      style={{ borderRadius: '6px' }}
                    >
                      <i className="bi bi-download me-1"></i>
                      Descargar Contrato
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ borderRadius: '6px' }}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Eliminar Contrato
                    </Button>
                  </div>
                </>
              ) : (
                /* Mostrar input para subir nuevo contrato si no hay contrato */
                <Form.Group>
                  <Form.Label className="fw-semibold">Subir nuevo contrato</Form.Label>
                  <Form.Control
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={{ borderRadius: '8px' }}
                  />
                  <Form.Text className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Solo archivos PDF, máximo 10MB
                  </Form.Text>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-light rounded d-flex align-items-center justify-content-between">
                      <div>
                        <i className="bi bi-file-pdf text-danger me-2"></i>
                        <strong>{selectedFile.name}</strong>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={handleRemoveFile}
                        style={{ borderRadius: '6px' }}
                      >
                        <i className="bi bi-x me-1"></i>
                        Quitar archivo
                      </Button>
                    </div>
                  )}
                </Form.Group>
              )}
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e9ecef' }}>
          {!contratoEliminado && (
            <Button 
              variant="outline-secondary" 
              onClick={onHide}
              style={{ borderRadius: '20px', fontWeight: '500' }}
            >
              Cancelar
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || !hasChanges}
            style={{ 
              borderRadius: '20px', 
              fontWeight: '500', 
              minWidth: '120px',
              marginLeft: contratoEliminado ? 'auto' : '0' // Centra el botón cuando está solo
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Guardar Cambios
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar contrato */}
      <Modal 
        show={showDeleteConfirm} 
        onHide={() => setShowDeleteConfirm(false)}
        centered
        size="sm"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        backdropClassName="confirm-delete-backdrop"
      >
        <Modal.Header 
          closeButton 
          style={{ 
            border: 'none', 
            paddingBottom: '0.5rem',
            background: 'white',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        >
          <Modal.Title as="h6" className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
            Confirmar eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body 
          style={{ 
            paddingTop: '0.5rem', 
            paddingBottom: '1.5rem',
            background: 'white'
          }}
        >
          ¿Está seguro que desea eliminar el contrato?
        </Modal.Body>
        <Modal.Footer 
          style={{ 
            border: 'none', 
            paddingTop: '0',
            background: 'white',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px'
          }}
        >
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
            style={{ 
              borderRadius: '6px',
              padding: '0.375rem 1rem'
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleDeleteFile}
            style={{ 
              borderRadius: '6px',
              padding: '0.375rem 1rem'
            }}
          >
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sistema de notificaciones */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          width: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {toasts.map((toast) => (
          <BootstrapToast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={toast.duration || 5000}
            autohide
            className="toast-custom mb-2"
          >
            <BootstrapToast.Header className={`toast-header-${toast.type}`}>
              <div className="d-flex align-items-center">
                <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : toast.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2`}></i>
                <strong className="me-auto">{toast.title}</strong>
              </div>
            </BootstrapToast.Header>
            <BootstrapToast.Body className="toast-body">
              {toast.message}
            </BootstrapToast.Body>
          </BootstrapToast>
        ))}
      </div>
    </>
  );
}; 