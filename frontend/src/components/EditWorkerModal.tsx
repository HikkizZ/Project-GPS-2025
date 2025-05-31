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

  useEffect(() => {
    if (show && workerId) {
      // Limpiar mensajes al abrir el modal
      setError(null);
      setSuccess(null);
      setLoading(true);
      fetchFicha();
    }
  }, [show, workerId]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleUploadFile = async () => {
    if (!selectedFile || !ficha) return;

    try {
      setUploadLoading(true);
      setError(null);
      
      const response = await uploadContrato(ficha.id, selectedFile);
      
      if (response.success) {
        setSuccess('Contrato subido exitosamente');
        setSelectedFile(null);
        // Limpiar el input file
        const fileInput = document.getElementById('contratoFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Actualizar la ficha para mostrar que ahora tiene contrato
        await fetchFicha();
        // Notificar al componente padre que hubo una actualización
        onUpdate();
      } else {
        setError(response.message || 'Error al subir el archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error al subir el archivo');
    } finally {
      setUploadLoading(false);
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
      
      if (response.success) {
        setSuccess('Contrato eliminado exitosamente');
        await fetchFicha();
      } else {
        setError(response.message || 'Error al eliminar el archivo');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Error al eliminar el archivo');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ficha) return;

    try {
      setLoading(true);
      setError(null);

      const { fechaInicioContrato, ...dataToSubmit } = {
        ...formData,
        sueldoBase: parseFloat(formData.sueldoBase) || 0,
        fechaFinContrato: formData.fechaFinContrato || undefined
      };

      const response = await updateFichaEmpresa(ficha.id, dataToSubmit);
      
      if (response.success) {
        // Primero notificar la actualización
        onUpdate();
        // Forzar el cierre del modal
        handleClose();
        return; // Salir inmediatamente después de cerrar
      }

      // Si llegamos aquí, hubo un error
      setError(response.message || 'Error al actualizar la ficha');
    } catch (error) {
      console.error('Error updating ficha:', error);
      setError('Error al actualizar la ficha');
    } finally {
      setLoading(false);
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
      <Modal.Header closeButton={!loading}>
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
          <Form id="editForm" onSubmit={handleSubmit}>
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
              {ficha.contratoURL ? (
                <div className="d-flex gap-2 align-items-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleDownloadFile}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Descargando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-download me-1"></i>
                        Descargar Contrato
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDeleteFile}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              ) : (
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
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={handleUploadFile}
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload me-1"></i>
                          Subir Contrato
                        </>
                      )}
                    </Button>
                  )}
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