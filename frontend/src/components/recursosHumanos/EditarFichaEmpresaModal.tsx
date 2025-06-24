import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { FichaEmpresa, UpdateFichaEmpresaData, EstadoLaboral } from '@/types/recursosHumanos/fichaEmpresa.types';
import { updateFichaEmpresa, uploadContrato, downloadContrato, deleteContrato, getFichaEmpresa } from '@/services/recursosHumanos/fichaEmpresa.service';

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

export const EditarFichaEmpresaModal: React.FC<EditarFichaEmpresaModalProps> = ({
  show,
  onHide,
  ficha,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<UpdateFichaEmpresaData & { sueldoBase: string }>({
    cargo: ficha.cargo || '',
    area: ficha.area || '',
    tipoContrato: ficha.tipoContrato || '',
    jornadaLaboral: ficha.jornadaLaboral || '',
    sueldoBase: ficha.sueldoBase ? formatMiles(ficha.sueldoBase) : '',
    fechaInicioContrato: ficha.fechaInicioContrato ? new Date(ficha.fechaInicioContrato).toISOString().split('T')[0] : '',
    fechaFinContrato: ficha.fechaFinContrato ? new Date(ficha.fechaFinContrato).toISOString().split('T')[0] : ''
  });

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
      setSelectedFile(null);
      setValidated(false);
      setFormData({
        cargo: ficha.cargo || '',
        area: ficha.area || '',
        tipoContrato: ficha.tipoContrato || '',
        jornadaLaboral: ficha.jornadaLaboral || '',
        sueldoBase: ficha.sueldoBase ? formatMiles(ficha.sueldoBase) : '',
        fechaInicioContrato: ficha.fechaInicioContrato ? new Date(ficha.fechaInicioContrato).toISOString().split('T')[0] : '',
        fechaFinContrato: ficha.fechaFinContrato ? new Date(ficha.fechaFinContrato).toISOString().split('T')[0] : ''
      });
    }
  }, [show, ficha]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'sueldoBase') {
      const numericValue = cleanNumber(value).replace(/[^0-9]/g, '');
      const formatted = numericValue ? formatMiles(numericValue) : '';
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no puede superar los 10MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDownloadFile = async () => {
    try {
      await downloadContrato(ficha.id);
    } catch (error: any) {
      setError(error.message || 'Error al descargar el contrato');
    }
  };

  const handleDeleteFile = async () => {
    if (!confirm('¿Está seguro de que desea eliminar el contrato?')) {
      return;
    }
    try {
      const response = await deleteContrato(ficha.id);
      if (response.success) {
        if (onUpdate) onUpdate();
        setSuccess('Contrato eliminado exitosamente');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(response.message || 'Error al eliminar el contrato');
      }
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el contrato');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);
    
    // Validar campos requeridos
    const isValid = formData.cargo.trim() && 
                   formData.area.trim() && 
                   formData.tipoContrato && 
                   formData.jornadaLaboral && 
                   formData.sueldoBase && 
                   parseInt(cleanNumber(formData.sueldoBase)) > 0 && 
                   formData.fechaInicioContrato;
    
    if (!isValid) {
      setError('Por favor, completa todos los campos requeridos');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

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
        setSuccess('Ficha actualizada exitosamente');
        if (onUpdate) onUpdate();
        setTimeout(() => {
          setSuccess(null);
          onHide();
        }, 1500);
      } else {
        setError(response.message || 'Error al actualizar la ficha');
      }
    } catch (error: any) {
      setError(error.message || 'Error inesperado al actualizar la ficha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header 
        closeButton 
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

        {/* Alertas */}
        {error && (
          <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '8px' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="border-0 mb-3" style={{ borderRadius: '8px' }}>
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </Alert>
        )}

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
                  isInvalid={validated && !formData.cargo.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Completa este campo
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
                  isInvalid={validated && !formData.area.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Completa este campo
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
                  isInvalid={validated && !formData.tipoContrato}
                >
                  <option value="">Seleccione...</option>
                  <option value="Indefinido">Indefinido</option>
                  <option value="Plazo Fijo">Plazo Fijo</option>
                  <option value="Por Obra">Por Obra</option>
                  <option value="Part-Time">Part-Time</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Completa este campo
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
                  isInvalid={validated && !formData.jornadaLaboral}
                >
                  <option value="">Seleccione...</option>
                  <option value="Completa">Completa</option>
                  <option value="Media">Media</option>
                  <option value="Part-Time">Part-Time</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Completa este campo
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
                  {!formData.sueldoBase ? 'Completa este campo' : 'El sueldo debe ser mayor a 0'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {/* Fecha Inicio Contrato */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Fecha Inicio <span className="text-danger">*</span></Form.Label>
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
                  Completa este campo
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            {/* Fecha Fin Contrato */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Fecha Fin</Form.Label>
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
            
            {/* Estado actual del contrato */}
            {ficha.contrato && (
              <div className="mb-3 p-2" style={{ backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #bee5eb' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-file-pdf text-danger me-2"></i>
                    <span className="fw-semibold">Contrato disponible</span>
                  </div>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={handleDownloadFile}
                      className="me-2"
                      style={{ borderRadius: '6px' }}
                    >
                      <i className="bi bi-download me-1"></i>
                      Descargar
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={handleDeleteFile}
                      style={{ borderRadius: '6px' }}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Subir nuevo contrato */}
            <Form.Group>
              <Form.Label className="fw-semibold">
                {ficha.contrato ? 'Reemplazar contrato' : 'Subir nuevo contrato'}
              </Form.Label>
              <Form.Control
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
                    onClick={() => setSelectedFile(null)}
                    style={{ borderRadius: '6px' }}
                  >
                    <i className="bi bi-x me-1"></i>
                    Quitar archivo
                  </Button>
                </div>
              )}
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: '1px solid #e9ecef', padding: '1rem 1.25rem' }}>
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          style={{ borderRadius: '20px', fontWeight: '500' }}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
          style={{ borderRadius: '20px', fontWeight: '500', minWidth: '120px' }}
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
  );
}; 