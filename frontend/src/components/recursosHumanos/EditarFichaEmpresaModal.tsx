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
          padding: '0.75rem 1rem'
        }}
        className="text-white"
      >
        <Modal.Title className="fw-semibold fs-5">
          <i className="bi bi-clipboard-data me-2"></i>
          Editar Ficha de Empresa
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '1rem' }}>
        {/* Información del Trabajador - Más compacta */}
        <div 
          className="mb-2 p-2" 
          style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}
        >
          <div className="row">
            <div className="col-md-8">
              <small className="text-muted">Trabajador:</small>
              <strong className="ms-1">{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}</strong>
            </div>
            <div className="col-md-4">
              <small className="text-muted">RUT:</small>
              <strong className="ms-1">{formatearRut(ficha.trabajador.rut)}</strong>
            </div>
          </div>
        </div>

        {/* Alertas - Más compactas */}
        {error && (
          <Alert variant="danger" className="border-0 mb-2 py-2" style={{ borderRadius: '8px' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            <small>{error}</small>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="border-0 mb-2 py-2" style={{ borderRadius: '8px' }}>
            <i className="bi bi-check-circle me-2"></i>
            <small>{success}</small>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-2 mb-2">
            {/* Cargo y Área */}
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Cargo <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  required
                  size="sm"
                  style={{ borderRadius: '6px' }}
                  placeholder="Ej: Desarrollador Senior"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Área <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  size="sm"
                  style={{ borderRadius: '6px' }}
                  placeholder="Ej: Tecnología"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-2">
            {/* Tipo de Contrato y Jornada */}
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Tipo de Contrato <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="tipoContrato"
                  value={formData.tipoContrato}
                  onChange={handleInputChange}
                  required
                  size="sm"
                  style={{ borderRadius: '6px' }}
                >
                  <option value="">Seleccione...</option>
                  <option value="Indefinido">Indefinido</option>
                  <option value="Plazo Fijo">Plazo Fijo</option>
                  <option value="Por Obra">Por Obra</option>
                  <option value="Part-Time">Part-Time</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Jornada Laboral <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="jornadaLaboral"
                  value={formData.jornadaLaboral}
                  onChange={handleInputChange}
                  required
                  size="sm"
                  style={{ borderRadius: '6px' }}
                >
                  <option value="">Seleccione...</option>
                  <option value="Tiempo Completo">Tiempo Completo</option>
                  <option value="Medio Tiempo">Medio Tiempo</option>
                  <option value="Por Horas">Por Horas</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-2">
            {/* Sueldo Base */}
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Sueldo Base <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="sueldoBase"
                  value={formData.sueldoBase}
                  onChange={handleInputChange}
                  required
                  size="sm"
                  style={{ borderRadius: '6px' }}
                  placeholder="1.000.000"
                />
              </Form.Group>
            </Col>
            {/* Fecha Inicio Contrato */}
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Fecha Inicio <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="fechaInicioContrato"
                  value={formData.fechaInicioContrato}
                  onChange={handleInputChange}
                  required
                  size="sm"
                  style={{ borderRadius: '6px' }}
                />
              </Form.Group>
            </Col>
            {/* Fecha Fin Contrato */}
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small">Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaFinContrato"
                  value={formData.fechaFinContrato}
                  onChange={handleInputChange}
                  size="sm"
                  style={{ borderRadius: '6px' }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Sección de Contrato - Más compacta */}
          <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <h6 className="text-primary mb-2 fw-semibold small">Contrato</h6>
            
            {/* Estado actual del contrato - Más compacto */}
            {ficha.contrato && (
              <div className="mb-2 p-2" style={{ backgroundColor: '#d1ecf1', borderRadius: '6px', border: '1px solid #bee5eb' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-file-pdf text-danger me-1"></i>
                    <small className="fw-semibold">Contrato disponible</small>
                  </div>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={handleDownloadFile}
                      className="me-1 py-1 px-2"
                      style={{ borderRadius: '4px', fontSize: '0.75rem' }}
                    >
                      <i className="bi bi-download"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={handleDeleteFile}
                      className="py-1 px-2"
                      style={{ borderRadius: '4px', fontSize: '0.75rem' }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Subir nuevo contrato - Más compacto */}
            <Form.Group className="mb-0">
              <Form.Label className="fw-semibold small">
                {ficha.contrato ? 'Reemplazar contrato' : 'Subir nuevo contrato'}
              </Form.Label>
              <Form.Control
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                size="sm"
                style={{ borderRadius: '6px' }}
              />
              {selectedFile && (
                <div className="mt-1 p-1 bg-light rounded d-flex align-items-center justify-content-between">
                  <div>
                    <i className="bi bi-file-pdf text-danger me-1"></i>
                    <small className="fw-semibold">{selectedFile.name}</small>
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-danger p-0"
                    onClick={() => setSelectedFile(null)}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </div>
              )}
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: '1px solid #e9ecef', padding: '0.75rem 1rem' }}>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={onHide}
          style={{ borderRadius: '20px', fontWeight: '500' }}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
          style={{ borderRadius: '20px', fontWeight: '500', minWidth: '100px' }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-1"></i>
              Guardar
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 