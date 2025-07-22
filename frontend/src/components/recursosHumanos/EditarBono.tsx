import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Toast as BootstrapToast } from 'react-bootstrap';
import { Bono, UpdateBonoData } from '@/types/recursosHumanos/bono.types';
import { actualizarBono } from '@/services/recursosHumanos/bono.service';
import { useToast } from '@/components/common/Toast';

export interface EditarBonoModalProps {
  show: boolean;
  onHide: () => void;
  bono: Bono;
  onUpdate?: () => void;
}

enum TipoBono {
  estatal = 'estatal',
  empresarial = 'empresarial'
}

enum Temporalidad {
  permanente = 'permanente',
  recurrente = 'recurrente',
  puntual = 'puntual'
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

export const EditarBonoModal: React.FC<EditarBonoModalProps> = ({
    show,
    onHide,
    bono,
    onUpdate
}) => {
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [closeW, setCloseW] = useState(false);
    const [formData, setFormData] = useState<UpdateBonoData>({
        nombreBono: 'Ejemplo',
        monto: '111.111',
        tipoBono: TipoBono.empresarial,
        temporalidad: Temporalidad.permanente,
        descripcion: '',
        imponible: true,
    });
   
    // Toast notifications
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
      if(!bono) return;

      setFormData({
          nombreBono: (bono.nombreBono && bono.nombreBono !== 'Por definir')? bono.nombreBono : 'Ejemplo',
          monto: bono.monto ? formatMiles(bono.monto) : '111.111',
          tipoBono: ( bono.tipoBono || 'empresarial' ),
          temporalidad:( bono.temporalidad || 'puntual' ),
          descripcion: (bono.descripcion && bono.descripcion !== 'Por definir')? bono.descripcion : '',
          imponible: bono.imponible !== undefined ? bono.imponible : true,
      });
      if(show && bono) {
        const newFormData = {
          nombreBono: (bono.nombreBono && bono.nombreBono !== 'Por definir')? bono.nombreBono : '',
          monto: bono.monto ? formatMiles(bono.monto) : '',
          tipoBono: bono.tipoBono || 'empresarial',
          temporalidad: bono.temporalidad || 'puntual',
          descripcion: (bono.descripcion && bono.descripcion !== 'Por definir')? bono.descripcion : '',
          imponible: bono.imponible !== undefined ? bono.imponible : true,
        };
        setFormData(newFormData);
        setHasChanges(false);
        setValidated(false);
        setCloseW(false);
      };
    }, [show, bono]);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        let newFormData;
        if (name === 'monto') {
          const numericValue = cleanNumber(value).replace(/[^0-9]/g, '');
          const formatted = numericValue ? formatMiles(numericValue) : '';
          newFormData = { ...formData, [name]: formatted };
        } else {
          newFormData = { ...formData, [name]: value };
        }
        setFormData(newFormData);

        if (validated) {
          setValidated(false);
        }

        // Verificar si hay cambios comparando con los valores iniciales
        const hasAnyChange = Object.keys(newFormData).some(key => {
          if (key === 'monto') {
            const initialValue = cleanNumber(formData[key]);
            const currentValue = cleanNumber(newFormData[key]);
            return initialValue !== currentValue;
          }
          return newFormData[key] !== formData[key];
        });
        setHasChanges(hasAnyChange);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidated(true); 
        
        // Validar campos requeridos
        const isValid = 
          formData.nombreBono.trim() && formData.nombreBono.trim() !== 'Por Definir' &&
          formData.tipoBono.trim() && formData.tipoBono.trim() !== 'Seleccione una opción' &&
          formData.temporalidad.trim() && formData.temporalidad.trim() !== 'Seleccione una opción' &&
          formData.descripcion && formData.descripcion !== 'Por Definir' &&
          formData.monto && 
          parseInt(cleanNumber(formData.monto)) > 0 && 
          formData.imponible;

        
        if (!isValid) {
          return; // No mostrar mensaje de error general, dejar que los campos individuales muestren sus errores
        }
        setLoading(true);
        
        try {
            const bonoId = typeof bono.id === 'string' ? parseInt(bono.id) : bono.id;
            const montoNumber = formData.monto? parseFloat(cleanNumber(formData.monto)) : 0;
            
            if (!montoNumber || montoNumber <= 0) {
              throw new Error('El monto debe ser mayor a 0');
            }

            const dataToSubmit = {
              nombreBono: formData.nombreBono.trim(),
              monto: montoNumber.toString().replace(/\./g, ''), // Asegurarse de que el monto esté limpio
              tipoBono: formData.tipoBono || 'empresarial',
              temporalidad: formData.temporalidad || 'permanente',
              descripcion: formData.descripcion.trim(),
              imponible: formData.imponible,
            };

            //Actualizar el bono
            const response = await actualizarBono(bonoId, dataToSubmit);
            if (response.success) {
              if (onUpdate) onUpdate();
              onHide(); // Cerrar inmediatamente
            } else {
              showError('Error al actualizar', response.message || 'Error al actualizar el bono', 6000);
            }
        } catch (error: any) {
          showError('Error inesperado', error.message || 'Error inesperado al actualizar el bono', 6000);
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
                backdrop={closeW ? 'static' : true}
                keyboard={!closeW}
                onEscapeKeyDown={() => setCloseW(true)}
                onBackdropClick={() => setCloseW(true)}
        >
          <Modal.Header 
                    closeButton={!closeW}
                    style={{
                      background: 'linear-gradient(135deg, #C9CCD3 0%, #78808D 100%)',
                      border: 'none',
                      padding: '1rem 1.25rem'
                    }}
                    className="text-white"
                  >
                    <Modal.Title className="fw-semibold">
                      <i className="bi bi-clipboard-data me-2"></i>
                      Editar Bono
                    </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: '1.25rem' }}>
              {/* Información del Bono - Tamaño balanceado */}
              <Form onSubmit={handleSubmit} noValidate>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Nombre
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="nombreBono"
                      value={formData.nombreBono}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px' }}
                      placeholder="Ej: Desarrollador Senior"
                      isInvalid={validated && (!formData.nombreBono.trim() || formData.nombreBono.trim() === 'Por Definir')}>  
                      </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {validated && (!formData.nombreBono.trim() || formData.nombreBono.trim() === 'Por Definir') && 'Completa este campo'}
                    </Form.Control.Feedback>
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Monto 
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="monto"
                      value={formData.monto}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px' }}
                      placeholder="Ej: 1.000.000"
                      isInvalid={validated && (!formData.monto || parseInt(cleanNumber(formData.monto)) <= 0)}>    
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {validated && (!formData.monto || parseInt(cleanNumber(formData.monto)) <= 0) ? 'Completa este campo con un monto válido' : ''}
                    </Form.Control.Feedback>
                  </Form.Group>
                  </Col>
                </Row>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Tipo de bono
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="tipoBono"
                      value={formData.tipoBono}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px' }}
                      isInvalid={validated && (!formData.tipoBono.trim() || formData.tipoBono.trim() === 'Seleccione una opción')}
                    >  
                      <option value="">Seleccione una opción</option>
                      <option value="estatal">Estatal</option>
                      <option value="empresarial">Empresarial</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validated && (!formData.tipoBono.trim() || formData.tipoBono.trim() === 'Seleccione una opción') && 'Completa este campo'}
                    </Form.Control.Feedback>
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Temporalidad 
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="temporalidad"
                      value={formData.temporalidad}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px' }}
                      isInvalid={validated && (!formData.temporalidad.trim() || formData.temporalidad.trim() === 'Seleccione una opción')}
                    >  
                      <option value="">Seleccione una opción</option>
                      <option value="permanente">Permanente</option>
                      <option value="recurrente">Recurrente</option>
                      <option value="puntual">Puntual</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validated && (!formData.temporalidad.trim() || formData.temporalidad.trim() === 'Seleccione una opción') && 'Completa este campo'}
                    </Form.Control.Feedback>
                  </Form.Group>
                  </Col>
                </Row>
                <Row className="g-3 mb-3">
                  <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Imponible 
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Check 
                      type="switch"
                      id="imponible-switch"
                      label={formData.imponible ? "Sí" : "No"}
                      checked={formData.imponible}
                      required
                      onChange={handleInputChange}
                      isInvalid={validated && formData.imponible === undefined}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validated && formData.imponible === undefined && 'Selecciona si es imponible o no'}
                    </Form.Control.Feedback>
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Descripción 
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      style={{ borderRadius: '8px' }}
                      placeholder="Ej: Es un bono ofrecido por la empresa como incentivo ...">
                    </Form.Control>
                  </Form.Group>
                  </Col>
                </Row>
              </Form>
              </Modal.Body>

              <Modal.Footer style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e9ecef' }}>
                <Button 
                  variant="primary" 
                  onClick={handleSubmit}
                  disabled={loading || !hasChanges}
                  style={{ 
                    borderRadius: '20px', 
                    fontWeight: '500', 
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem 1rem'
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
      </>
    );
};