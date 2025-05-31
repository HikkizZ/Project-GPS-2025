import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { getFichaEmpresa, updateFichaEmpresa, uploadContrato, downloadContrato, deleteContrato } from '../services/fichaEmpresaService';

interface EditWorkerModalProps {
  show: boolean;
  handleClose: () => void;
  workerId: number;
  onUpdate: () => void;
}

interface FichaEmpresa {
  id: number;
  cargo: string;
  area: string;
  empresa: string;
  tipoContrato: string;
  jornadaLaboral: string;
  sueldoBase: number;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  contratoURL: string | null;
  trabajador: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

const EditWorkerModal: React.FC<EditWorkerModalProps> = ({ show, handleClose, workerId, onUpdate }) => {
  const [ficha, setFicha] = useState<FichaEmpresa | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    cargo: '',
    area: '',
    empresa: '',
    tipoContrato: '',
    jornadaLaboral: '',
    sueldoBase: '',
    fechaInicioContrato: '',
    fechaFinContrato: ''
  });

  // Estados para manejo de archivos
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isContratoDeleted, setIsContratoDeleted] = useState(false);

  useEffect(() => {
    if (show && workerId) {
      setError(null);
      setSuccess(null);
      setLoading(true);
      setShowUploadForm(false);
      setIsContratoDeleted(false);
      fetchFicha();
    }
  }, [show, workerId]);

  // Nuevo useEffect para manejar la eliminación del contrato
  useEffect(() => {
    if (isContratoDeleted && ficha) {
      setFicha(prev => prev ? { ...prev, contratoURL: null } : null);
      setSelectedFile(null);
      if (document.getElementById('contratoFile')) {
        (document.getElementById('contratoFile') as HTMLInputElement).value = '';
      }
    }
  }, [isContratoDeleted]);

  const fetchFicha = async () => {
    try {
      const response = await getFichaEmpresa(workerId);
      
      if (response.success && response.data) {
        const fichaData = response.data;
        setFicha(fichaData);
        setFormData({
          cargo: fichaData.cargo || '',
          area: fichaData.area || '',
          empresa: fichaData.empresa || '',
          tipoContrato: fichaData.tipoContrato || '',
          jornadaLaboral: fichaData.jornadaLaboral || '',
          sueldoBase: fichaData.sueldoBase?.toString() || '',
          fechaInicioContrato: fichaData.fechaInicioContrato ? fichaData.fechaInicioContrato.split('T')[0] : '',
          fechaFinContrato: fichaData.fechaFinContrato ? fichaData.fechaFinContrato.split('T')[0] : ''
        });
        setError(null);
      } else {
        console.error('Error al cargar ficha:', response);
        setError('No se pudo cargar la información del trabajador. Por favor, intente nuevamente.');
      }
    } catch (error) {
      console.error('Error fetching ficha:', error);
      setError('Error al cargar la información del trabajador. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('contratoFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async () => {
    if (!ficha) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        const uploadResponse = await uploadContrato(ficha.id, selectedFile);
        if (!uploadResponse.success) {
          setError(uploadResponse.message || 'Error al subir el contrato');
          return;
        }
      }

      const dataToSubmit = {
        ...formData,
        sueldoBase: parseFloat(formData.sueldoBase) || 0,
        fechaFinContrato: formData.fechaFinContrato || undefined,
        fechaInicioContrato: formData.fechaInicioContrato
      };

      const response = await updateFichaEmpresa(ficha.id, dataToSubmit);
      
      if (response.data || response.success) {
        setSuccess('Ficha actualizada exitosamente');
        // Notificar la actualización
        onUpdate();
        // Esperar un momento para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          // Cerrar el modal usando la función proporcionada por el padre
          handleClose();
        }, 1000);
      } else {
        setError(response.message || 'Error al actualizar la ficha');
      }
    } catch (error: any) {
      console.error('Error updating ficha:', error);
      setError(error.response?.data?.message || error.message || 'Error al actualizar la ficha');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!ficha) return;

    try {
      setDownloadLoading(true);
      setError(null);
      
      await downloadContrato(ficha.id);
      setSuccess('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Error al descargar el archivo');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!ficha || !window.confirm('¿Está seguro de que desea eliminar el contrato?')) return;

    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await deleteContrato(ficha.id);
      
      // Siempre mostrar el mensaje de éxito y actualizar la interfaz
      setSuccess('Contrato eliminado exitosamente');
      setFicha(prev => prev ? { ...prev, contratoURL: null } : null);
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Error al eliminar el archivo');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Editar Ficha de Empresa
          {ficha && ` - ${ficha.trabajador.nombres} ${ficha.trabajador.apellidoPaterno}`}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading && (
          <div className="text-center p-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {ficha && (
          <Form 
            id="editForm" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cargo *</Form.Label>
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
                  <Form.Label>Área *</Form.Label>
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
                  <Form.Label>Empresa</Form.Label>
                  <Form.Control
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Contrato *</Form.Label>
                  <Form.Select
                    name="tipoContrato"
                    value={formData.tipoContrato}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione tipo...</option>
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
                  <Form.Label>Jornada Laboral *</Form.Label>
                  <Form.Control
                    type="text"
                    name="jornadaLaboral"
                    value={formData.jornadaLaboral}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sueldo Base *</Form.Label>
                  <Form.Control
                    type="number"
                    name="sueldoBase"
                    value={formData.sueldoBase}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Inicio Contrato *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaInicioContrato"
                    value={formData.fechaInicioContrato}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    La fecha de inicio del contrato no puede ser modificada
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Fin Contrato</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaFinContrato"
                    value={formData.fechaFinContrato}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="border rounded p-3 mb-3">
              <h6>Gestión de Contrato (PDF)</h6>
              {!ficha?.contratoURL ? (
                <div>
                  <Form.Group controlId="contratoFile" className="mb-3">
                    <Form.Control
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf"
                    />
                    <Form.Text className="text-muted">
                      Solo archivos PDF. Máximo 10MB.
                    </Form.Text>
                  </Form.Group>
                  {selectedFile && (
                    <div className="d-flex align-items-center gap-2">
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
                </div>
              ) : (
                <div className="d-flex gap-2 align-items-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleDownloadFile}
                    disabled={downloadLoading}
                  >
                    <i className="bi bi-download me-1"></i>
                    {downloadLoading ? 'Descargando...' : 'Descargar Contrato'}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDeleteFile}
                    disabled={deleteLoading}
                  >
                    <i className="bi bi-trash me-1"></i>
                    {deleteLoading ? 'Eliminando...' : 'Eliminar Contrato'}
                  </Button>
                </div>
              )}
            </div>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="editForm"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditWorkerModal; 