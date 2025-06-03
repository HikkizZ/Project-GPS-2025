import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FichaEmpresa, UpdateFichaEmpresaData, EstadoLaboral } from '@/types/fichaEmpresa.types';
import { updateFichaEmpresa, uploadContrato, downloadContrato, deleteContrato, getFichaEmpresa } from '@/services/fichaEmpresa.service';

interface EditarFichaEmpresaModalProps {
  show: boolean;
  onHide: () => void;
  ficha: FichaEmpresa;
  onUpdate?: () => void;
}

// Componente para el ícono de información con tooltip
const InfoIcon: React.FC<{ text: string }> = ({ text }) => (
  <OverlayTrigger
    placement="right"
    overlay={<Tooltip>{text}</Tooltip>}
  >
    <i className="bi bi-info-circle ms-2" style={{ cursor: 'help' }}></i>
  </OverlayTrigger>
);

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
  const [isContratoDeleted, setIsContratoDeleted] = useState(false);

  const [formData, setFormData] = useState<UpdateFichaEmpresaData>({
    cargo: ficha.cargo || '',
    area: ficha.area || '',
    empresa: ficha.empresa || '',
    tipoContrato: ficha.tipoContrato || '',
    jornadaLaboral: ficha.jornadaLaboral || '',
    sueldoBase: typeof ficha.sueldoBase === 'string' ? 
      parseInt(ficha.sueldoBase.replace(/\D/g, '')) : 
      Math.round(ficha.sueldoBase || 0),
    fechaInicioContrato: ficha.fechaInicioContrato ? new Date(ficha.fechaInicioContrato).toISOString().split('T')[0] : '',
    fechaFinContrato: ficha.fechaFinContrato ? new Date(ficha.fechaFinContrato).toISOString().split('T')[0] : ''
  });

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
      setSelectedFile(null);
      setIsContratoDeleted(false);
      setFormData({
        cargo: ficha.cargo || '',
        area: ficha.area || '',
        empresa: ficha.empresa || '',
        tipoContrato: ficha.tipoContrato || '',
        jornadaLaboral: ficha.jornadaLaboral || '',
        sueldoBase: typeof ficha.sueldoBase === 'string' ? 
          parseInt(ficha.sueldoBase.replace(/\D/g, '')) : 
          Math.round(ficha.sueldoBase || 0),
        fechaInicioContrato: ficha.fechaInicioContrato ? new Date(ficha.fechaInicioContrato).toISOString().split('T')[0] : '',
        fechaFinContrato: ficha.fechaFinContrato ? new Date(ficha.fechaFinContrato).toISOString().split('T')[0] : ''
      });
    }
  }, [show, ficha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'sueldoBase') {
      // Solo permitir números y convertir a número
      const numericValue = value.replace(/\D/g, '');
      const numberValue = numericValue === '' ? 0 : Number(numericValue);
      
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    } else if (name === 'fechaInicioContrato' || name === 'fechaFinContrato') {
      // Mantener la fecha exactamente como viene del input type="date"
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
      if (file.size > 10 * 1024 * 1024) { // 10MB
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
        setIsContratoDeleted(true);
        if (onUpdate) onUpdate();
        setSuccess('Contrato eliminado exitosamente');
        // Hacer que el mensaje desaparezca después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 1500);
      } else {
        setError(response.message || 'Error al eliminar el contrato');
      }
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el contrato');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (document.getElementById('contratoFile')) {
      (document.getElementById('contratoFile') as HTMLInputElement).value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verificar si la ficha existe antes de actualizarla
      const fichaId = typeof ficha.id === 'string' ? parseInt(ficha.id) : ficha.id;
      const verificacion = await getFichaEmpresa(fichaId);
      
      if (!verificacion.success) {
        throw new Error('No se pudo encontrar la ficha para actualizar. Por favor, recargue la página e intente nuevamente.');
      }

      console.log('Ficha encontrada:', verificacion.data);
      console.log('Datos a actualizar:', formData);

      // Si hay un archivo seleccionado, subirlo
      if (selectedFile) {
        const uploadResponse = await uploadContrato(fichaId, selectedFile);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.message || 'Error al subir el contrato');
        }
      }

      // Procesar los datos antes de enviarlos
      const sueldoBase = typeof formData.sueldoBase === 'string' ? 
        parseInt(formData.sueldoBase.replace(/\D/g, '')) : 
        formData.sueldoBase;

      const dataToSubmit = {
        cargo: formData.cargo.trim(),
        area: formData.area.trim(),
        empresa: formData.empresa.trim(),
        tipoContrato: formData.tipoContrato,
        jornadaLaboral: formData.jornadaLaboral,
        sueldoBase: sueldoBase,
        fechaInicioContrato: formData.fechaInicioContrato,
        fechaFinContrato: formData.fechaFinContrato || undefined
      };

      // Validaciones adicionales
      if (!dataToSubmit.sueldoBase || dataToSubmit.sueldoBase <= 0) {
        throw new Error('El sueldo base debe ser mayor a 0');
      }

      // Actualizar ficha de empresa
      const response = await updateFichaEmpresa(fichaId, dataToSubmit);
      
      if (response.success) {
        setSuccess('Ficha actualizada exitosamente');
        if (onUpdate) onUpdate();
        onHide();
      } else {
        throw new Error(response.message || 'Error al actualizar la ficha');
      }
    } catch (error: any) {
      setError(error.message || 'Error al actualizar la información');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Ficha de Empresa</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-3">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </Alert>
          )}
          {loading && (
            <div className="text-center p-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          )}

          <h5 className="mb-3 mt-4">Información del Trabajador</h5>
          <div className="alert alert-info">
            <strong>Trabajador:</strong>
            <span className="ms-2">{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}</span>
            <span className="mx-3 fw-bold">|</span>
            <strong>RUT:</strong>
            <span className="ms-2">{ficha.trabajador.rut}</span>
          </div>

          <h5 className="mb-3">Información Laboral</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Cargo *
                  <InfoIcon text="El cargo debe tener entre 3 y 100 caracteres" />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Área *
                  <InfoIcon text="El área debe tener entre 3 y 100 caracteres" />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Empresa *
                  <InfoIcon text="La empresa debe tener entre 3 y 100 caracteres" />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tipo de Contrato *
                </Form.Label>
                <Form.Select
                  name="tipoContrato"
                  value={formData.tipoContrato}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Indefinido">Indefinido</option>
                  <option value="Plazo Fijo">Plazo Fijo</option>
                  <option value="Por Obra">Por Obra</option>
                  <option value="Part-Time">Part-Time</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Jornada Laboral *
                </Form.Label>
                <Form.Select
                  name="jornadaLaboral"
                  value={formData.jornadaLaboral}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Completa">Completa</option>
                  <option value="Media">Media</option>
                  <option value="Part-Time">Part-Time</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Sueldo Base *
                  <InfoIcon text="El sueldo base debe ser mayor a 0 y no puede ser menor al sueldo actual" />
                </Form.Label>
                <Form.Control
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  name="sueldoBase"
                  value={formData.sueldoBase > 0 ? formData.sueldoBase : ''}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Fecha Inicio Contrato *
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fechaInicioContrato"
                  value={formData.fechaInicioContrato}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Fecha Fin Contrato
                  <InfoIcon text="La fecha de fin debe ser posterior a la fecha de inicio" />
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fechaFinContrato"
                  value={formData.fechaFinContrato}
                  onChange={handleInputChange}
                  min={formData.fechaInicioContrato}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <h5 className="mb-3">Contrato</h5>
          {ficha.contratoURL && !isContratoDeleted ? (
            <div className="d-flex gap-2 align-items-center">
              <Button 
                variant="outline-primary" 
                onClick={handleDownloadFile}
                disabled={loading}
              >
                <i className="bi bi-download me-2"></i>
                Descargar Contrato
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={handleDeleteFile}
                disabled={loading}
              >
                <i className="bi bi-trash me-2"></i>
                Eliminar Contrato
              </Button>
            </div>
          ) : (
            <Form.Group>
              <Form.Label>Subir Contrato (PDF, máx. 10MB)</Form.Label>
              <Form.Control
                id="contratoFile"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Archivo seleccionado: {selectedFile.name}
                  </span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Quitar archivo
                  </Button>
                </div>
              )}
              <Form.Text className="text-muted">
                Solo archivos PDF. Máximo 10MB.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}; 