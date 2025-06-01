import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { 
  getFichaEmpresa,
  updateFichaEmpresa,
  uploadContrato,
  downloadContrato,
  deleteContrato
} from '@/services/fichaEmpresa.service';
import { Trabajador } from '@/types/trabajador.types';
import { useTrabajador } from '@/hooks/useTrabajador';

interface EditarTrabajadorModalProps {
  show: boolean;
  onHide: () => void;
  trabajador: Trabajador;
  onUpdate?: () => void;
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

export const EditarTrabajadorModal: React.FC<EditarTrabajadorModalProps> = ({
  show,
  onHide,
  trabajador,
  onUpdate
}) => {
  const { updateTrabajador, isLoading: isUpdatingTrabajador, error: updateError } = useTrabajador();
  const [ficha, setFicha] = useState<FichaEmpresa | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Estados para datos del trabajador
  const [formData, setFormData] = useState({
    nombres: trabajador.nombres,
    apellidoPaterno: trabajador.apellidoPaterno,
    apellidoMaterno: trabajador.apellidoMaterno,
    rut: trabajador.rut,
    email: trabajador.email,
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
    if (show && trabajador.id) {
      setError(null);
      setSuccess(null);
      setLoading(true);
      setShowUploadForm(false);
      fetchFicha();
    }
  }, [show, trabajador.id]);

  const fetchFicha = async () => {
    try {
      const response = await getFichaEmpresa(trabajador.id);
      
      if (response.success && response.data) {
        const fichaData = response.data;
        setFicha(fichaData);
        setFormData(prev => ({
          ...prev,
          cargo: fichaData.cargo || '',
          area: fichaData.area || '',
          empresa: fichaData.empresa || '',
          tipoContrato: fichaData.tipoContrato || '',
          jornadaLaboral: fichaData.jornadaLaboral || '',
          sueldoBase: fichaData.sueldoBase?.toString() || '',
          fechaInicioContrato: fichaData.fechaInicioContrato ? fichaData.fechaInicioContrato.split('T')[0] : '',
          fechaFinContrato: fichaData.fechaFinContrato ? fichaData.fechaFinContrato.split('T')[0] : ''
        }));
        setError(null);
      } else {
        setError('No se pudo cargar la información del trabajador.');
      }
    } catch (error) {
      console.error('Error fetching ficha:', error);
      setError('Error al cargar la información del trabajador.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ficha) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Actualizar datos del trabajador
      const trabajadorResult = await updateTrabajador(trabajador.id, {
        nombres: formData.nombres,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        rut: formData.rut,
        email: formData.email
      });

      if (!trabajadorResult.success) {
        setError(trabajadorResult.error || 'Error al actualizar datos del trabajador');
        return;
      }

      // Si hay un archivo seleccionado, subirlo
      if (selectedFile) {
        const uploadResponse = await uploadContrato(ficha.id, selectedFile);
        if (!uploadResponse.success) {
          setError(uploadResponse.message || 'Error al subir el contrato');
          return;
        }
      }

      // Actualizar ficha de empresa
      const fichaResult = await updateFichaEmpresa(ficha.id, {
        cargo: formData.cargo,
        area: formData.area,
        empresa: formData.empresa,
        tipoContrato: formData.tipoContrato,
        jornadaLaboral: formData.jornadaLaboral,
        sueldoBase: parseFloat(formData.sueldoBase) || 0,
        fechaInicioContrato: formData.fechaInicioContrato,
        fechaFinContrato: formData.fechaFinContrato || undefined
      });

      if (fichaResult.success) {
        setSuccess('Información actualizada exitosamente');
        if (onUpdate) onUpdate();
        onHide();
      } else {
        setError(fichaResult.message || 'Error al actualizar la ficha');
      }
    } catch (error: any) {
      console.error('Error updating:', error);
      setError(error.message || 'Error al actualizar la información');
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
      
      if (response.success) {
        setSuccess('Contrato eliminado exitosamente');
        setFicha(prev => prev ? { ...prev, contratoURL: null } : null);
        setTimeout(() => setSuccess(null), 1500);
      } else {
        setError('Error al eliminar el contrato');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Error al eliminar el archivo');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Trabajador</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {(error || updateError) && (
            <Alert variant="danger">{error || updateError}</Alert>
          )}
          {success && <Alert variant="success">{success}</Alert>}
          {loading && (
            <div className="text-center p-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          )}

          <h5 className="mb-3">Datos Personales</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido Paterno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido Materno</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <hr className="my-4" />
          
          <h5 className="mb-3">Información Laboral</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cargo</Form.Label>
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
                <Form.Label>Área</Form.Label>
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
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Contrato</Form.Label>
                <Form.Select
                  name="tipoContrato"
                  value={formData.tipoContrato}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Indefinido">Indefinido</option>
                  <option value="Plazo Fijo">Plazo Fijo</option>
                  <option value="Por Obra">Por Obra</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Jornada Laboral</Form.Label>
                <Form.Select
                  name="jornadaLaboral"
                  value={formData.jornadaLaboral}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Completa">Completa</option>
                  <option value="Parcial">Parcial</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sueldo Base</Form.Label>
                <Form.Control
                  type="number"
                  name="sueldoBase"
                  value={formData.sueldoBase}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio Contrato</Form.Label>
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

          <hr className="my-4" />

          <h5 className="mb-3">Contrato</h5>
          {ficha?.contratoURL ? (
            <div className="d-flex gap-2 align-items-center">
              <Button 
                variant="outline-primary" 
                onClick={handleDownloadFile}
                disabled={downloadLoading}
              >
                {downloadLoading ? 'Descargando...' : 'Descargar Contrato'}
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={handleDeleteFile}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar Contrato'}
              </Button>
            </div>
          ) : (
            <Form.Group>
              <Form.Label>Subir Contrato (PDF, máx. 10MB)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
              />
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
            disabled={loading || isUpdatingTrabajador}
          >
            {loading || isUpdatingTrabajador ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}; 