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
    fechaFinContrato: '',
    afp: '',
    previsionSalud: '',
    seguroCesantia: ''
  });

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<UpdateFichaEmpresaData & { sueldoBase: string }>({
    cargo: (ficha.cargo && ficha.cargo !== 'Por Definir') ? ficha.cargo : '',
    area: (ficha.area && ficha.area !== 'Por Definir') ? ficha.area : '',
    tipoContrato: (ficha.tipoContrato && ficha.tipoContrato !== 'Por Definir') ? ficha.tipoContrato : '',
    jornadaLaboral: (ficha.jornadaLaboral && ficha.jornadaLaboral !== 'Por Definir') ? ficha.jornadaLaboral : '',
    sueldoBase: ficha.sueldoBase ? formatMiles(ficha.sueldoBase) : '',
    fechaInicioContrato: ficha.fechaInicioContrato ? formatLocalDate(ficha.fechaInicioContrato) : '',
    fechaFinContrato: ficha.fechaFinContrato ? formatLocalDate(ficha.fechaFinContrato) : '',
    afp: (ficha.afp && ficha.afp !== 'Por Definir') ? ficha.afp : '',
    previsionSalud: (ficha.previsionSalud && ficha.previsionSalud !== 'Por Definir') ? ficha.previsionSalud : '',
    seguroCesantia: ficha.seguroCesantia || ''
  });

  useEffect(() => {
    if (show) {
      const newFormData = {
        cargo: (ficha.cargo && ficha.cargo !== 'Por Definir') ? ficha.cargo : '',
        area: (ficha.area && ficha.area !== 'Por Definir') ? ficha.area : '',
        tipoContrato: (ficha.tipoContrato && ficha.tipoContrato !== 'Por Definir') ? ficha.tipoContrato : '',
        jornadaLaboral: (ficha.jornadaLaboral && ficha.jornadaLaboral !== 'Por Definir') ? ficha.jornadaLaboral : '',
        sueldoBase: ficha.sueldoBase ? formatMiles(ficha.sueldoBase) : '',
        fechaInicioContrato: ficha.fechaInicioContrato ? formatLocalDate(ficha.fechaInicioContrato) : '',
        fechaFinContrato: ficha.fechaFinContrato ? formatLocalDate(ficha.fechaFinContrato) : '',
        afp: (ficha.afp && ficha.afp !== 'Por Definir') ? ficha.afp : '',
        previsionSalud: (ficha.previsionSalud && ficha.previsionSalud !== 'Por Definir') ? ficha.previsionSalud : '',
        seguroCesantia: ficha.seguroCesantia || ''
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

  // Detectar si es el primer update (todos los campos clave vacíos o por defecto)
  const esPrimerUpdate = !ficha.cargo && !ficha.area && !ficha.tipoContrato && !ficha.jornadaLaboral && (!ficha.sueldoBase || ficha.sueldoBase === 0) && !ficha.afp && !ficha.previsionSalud;

  // Lógica para habilitar/deshabilitar fecha fin según tipo de contrato
  const tipoContratoActual = formData.tipoContrato;
  const esIndefinido = tipoContratoActual === 'Indefinido';

  // Validación dinámica en el submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);

    // Validación estricta de campos requeridos y formato de fechas
    let isValid = true;
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    const tipoContrato = formData.tipoContrato;
    const afp = formData.afp;
    const previsionSalud = formData.previsionSalud;
    const fechaFin = formData.fechaFinContrato;

    // Validar campos requeridos
    if (!formData.cargo.trim() || formData.cargo.trim() === 'Por Definir') isValid = false;
    if (!formData.area.trim() || formData.area.trim() === 'Por Definir') isValid = false;
    if (!tipoContrato || tipoContrato === 'Por Definir') isValid = false;
    if (!formData.jornadaLaboral || formData.jornadaLaboral === 'Por Definir') isValid = false;
    if (!formData.sueldoBase || parseInt(cleanNumber(formData.sueldoBase)) <= 0) isValid = false;
    if (!formData.fechaInicioContrato || !fechaRegex.test(formData.fechaInicioContrato)) isValid = false;
    if (!formData.afp || afp === 'Por Definir') {
      isValid = false;
    }
    if (!formData.previsionSalud || previsionSalud === 'Por Definir') {
      isValid = false;
    } 

    // Validación específica de Fecha Fin
    if (tipoContrato === 'Plazo Fijo' || tipoContrato === 'Por Obra' || tipoContrato === 'Part-Time') {
      if (!fechaFin || !fechaRegex.test(fechaFin)) {
        isValid = false;
      }
    }
    if (tipoContrato === 'Indefinido' && fechaFin) {
      isValid = false;
    }

    if (!isValid) {
      // No mostrar toast de error, solo dejar los mensajes en rojo bajo los campos
      return;
    }

    setLoading(true);
    try {
      const fichaId = typeof ficha.id === 'string' ? parseInt(ficha.id) : ficha.id;
      const sueldoBaseNumber = formData.sueldoBase ? parseInt(cleanNumber(formData.sueldoBase)) : 0;
      const dataToSubmit = {
        cargo: formData.cargo.trim(),
        area: formData.area.trim(),
        tipoContrato: formData.tipoContrato,
        jornadaLaboral: formData.jornadaLaboral,
        sueldoBase: sueldoBaseNumber,
        fechaInicioContrato: formData.fechaInicioContrato,
        fechaFinContrato: tipoContrato === 'Indefinido' ? undefined : formData.fechaFinContrato || undefined,
        afp: formData.afp,
        previsionSalud: formData.previsionSalud,
        seguroCesantia: formData.seguroCesantia
      };
      let response;
      if (selectedFile) {
        const formDataToSend = new FormData();
        Object.entries(dataToSubmit).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value as any);
          }
        });
        formDataToSend.append('contrato', selectedFile);
        response = await updateFichaEmpresa(fichaId, formDataToSend);
      } else {
        response = await updateFichaEmpresa(fichaId, dataToSubmit);
      }
      if (response.success) {
        if (onUpdate) onUpdate();
        onHide();
      } else {
        // Solo mostrar toast si es un error general del backend
        showError('Error al actualizar', response.message || 'Error al actualizar la ficha', 6000);
      }
    } catch (error: any) {
      // Solo mostrar toast si es un error inesperado del backend
      showError('Error inesperado', error.message || 'Error inesperado al actualizar la ficha', 6000);
    } finally {
      setLoading(false);
    }
  };

  // Helper para el tipo correcto de backdrop
  const getBackdropValue = (): true | 'static' => (contratoEliminado ? 'static' : true);

  return (
    <>
      <Modal 
        show={show} 
        onHide={onHide} 
        size="lg" 
        centered
        backdrop={contratoEliminado ? 'static' : true}
        keyboard={!contratoEliminado}
        className="editar-ficha-empresa-modal"
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
                  <Form.Label className="fw-semibold">Fecha Inicio <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    id="editar-ficha-empresa-fecha-inicio"
                    name="fechaInicioContrato"
                    value={formData.fechaInicioContrato}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={!!validated && !formData.fechaInicioContrato}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validated && !formData.fechaInicioContrato && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* Fecha Fin Contrato */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Fecha Fin {((tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time') && esPrimerUpdate) && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    type="date"
                    id="editar-ficha-empresa-fecha-fin"
                    name="fechaFinContrato"
                    value={formData.fechaFinContrato}
                    onChange={handleInputChange}
                    style={{ borderRadius: '8px' }}
                    disabled={
                      !tipoContratoActual ||
                      tipoContratoActual === 'Indefinido' ||
                      !formData.fechaInicioContrato ||
                      !/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaInicioContrato)
                    }
                    required={tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time'}
                    isInvalid={
                      validated && (
                        (tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time') && !formData.fechaFinContrato
                      ) ||
                      (validated && (tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time') && formData.fechaFinContrato && !/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaFinContrato)) ||
                      (validated && tipoContratoActual === 'Indefinido' && !!formData.fechaFinContrato)
                    }
                    min={
                      formData.fechaInicioContrato && /^\d{4}-\d{2}-\d{2}$/.test(formData.fechaInicioContrato)
                        ? formData.fechaInicioContrato
                        : undefined
                    }
                  />
                  <Form.Text className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    {!tipoContratoActual ? 'Seleccione primero un tipo de contrato' :
                      tipoContratoActual === 'Indefinido' ? 'No debe ingresar fecha fin para contratos indefinidos' :
                      'Obligatorio para contratos no indefinidos'}
                    {((tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time') && (!formData.fechaInicioContrato || !/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaInicioContrato))) && (
                      <>
                        <br/>( La Fecha Fin se habilita después de ingresar una Fecha de Inicio ).
                      </>
                    )}
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {validated && (tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time') && !formData.fechaFinContrato && 'Completa este campo'}
                    {validated && (tipoContratoActual === 'Plazo Fijo' || tipoContratoActual === 'Por Obra' || tipoContratoActual === 'Part-Time') && formData.fechaFinContrato && !/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaFinContrato) && 'Formato de fecha inválido (YYYY-MM-DD)'}
                    {validated && tipoContratoActual === 'Indefinido' && formData.fechaFinContrato && 'No debe ingresar fecha fin para contratos indefinidos'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* AFP, Previsión de Salud Y seguro cesantia*/}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">AFP <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="afp"
                    value={formData.afp}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={validated && (!formData.afp || formData.afp === 'Por Definir')}
                  >
                    <option value="">Seleccione...</option>
                    <option value="modelo">AFP Modelo</option>
                    <option value="capital">AFP Capital</option>
                    <option value="habitat">AFP Habitat</option>
                    <option value="cuprum">AFP Cuprum</option>
                    <option value="provida">AFP Provida</option>
                    <option value="planvital">AFP PlanVital</option>
                    <option value="uno">AFP Uno</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.afp || formData.afp === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Previsión de Salud <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="previsionSalud"
                    value={formData.previsionSalud}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={validated && (!formData.previsionSalud || formData.previsionSalud === 'Por Definir')}
                  >
                    <option value="">Seleccione...</option>
                    <option value="FONASA">Fonasa</option>
                    <option value="ISAPRE">Isapre</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.previsionSalud || formData.previsionSalud === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Seguro de Cesantía <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="seguroCesantia"
                    value={formData.seguroCesantia}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                    isInvalid={validated && (!formData.seguroCesantia || formData.seguroCesantia === 'Por Definir')}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validated && (!formData.seguroCesantia || formData.seguroCesantia === 'Por Definir') && 'Completa este campo'}
                  </Form.Control.Feedback>
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
                    name="contrato"
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
      {/* Solo mostrar los toasts si hay mensajes de archivos o errores generales, no por validaciones de formulario */}
      {toasts.length > 0 && (
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
      )}
    </>
  );
}; 