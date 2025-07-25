// Componente de bonos - Pendiente de implementación
// Este archivo es temporal para evitar errores de compilación

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Toast as BootstrapToast, Alert } from 'react-bootstrap';
import { Bono, CreateBonoData } from '@/types/recursosHumanos/bono.types';
import { crearBono } from '@/services/recursosHumanos/bono.service';
import { useToast } from '@/components/common/Toast';
import { useBono } from '@/hooks/recursosHumanos/useBonos';

export interface CrearBonoModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
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

// Verificación de duración en meses
function isValidDuration(duration: string): boolean {
  const numericValue = parseInt(cleanNumber(duration));
  return !isNaN(numericValue) && numericValue > 0 && numericValue <= 12;
}

function isValidMonto(monto: string): boolean {
  const numericValue = parseFloat(cleanNumber(monto));
  return !isNaN(numericValue) && numericValue > 0;
}

function isValidDurartionTemporalidad(temporalidad: string, duracionMes: string): [boolean, boolean] {
    if (temporalidad === Temporalidad.permanente) {
        return [false, true]; // No requiere duración, pero es válido
    }
    if (temporalidad === Temporalidad.recurrente || temporalidad === Temporalidad.puntual) {
        return [true, isValidDuration(duracionMes)];
    }
    return [false, false];
}

export const CrearBonoModal: React.FC<CrearBonoModalProps> = ({
    show,
    onHide,
    onSuccess
}) => {
    const { createBono } = useBono();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [advertencias, setAdvertencias] = useState<string[]>([]);
    const [validated, setValidated] = useState(false);
    const [closeW, setCloseW] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [formData, setFormData] = useState<CreateBonoData>({
        nombreBono: 'Ejemplo',
        monto: '111.111',
        tipoBono: TipoBono.empresarial,
        temporalidad: Temporalidad.permanente,
        descripcion: '',
        imponible: true,
        duracionMes: '',
        fechaCreacion: (() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })()
    });
   
    // Toast notifications
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {

        setFormData({
            nombreBono: 'Ejemplo',
            monto: '111.111',
            tipoBono: '',
            temporalidad: '',
            descripcion: '',
            imponible: true,
            duracionMes: '',
        });
        setValidated(false);
        setCloseW(false);
        setHasChanges(false);
    }, [show]);

    // Detectar cambios en el formulario
    useEffect(() => {
        const hasFormChanges = 
            formData.nombreBono !== 'Ejemplo' ||
            formData.monto !== '111.111' ||
            formData.tipoBono !== TipoBono.empresarial ||
            formData.temporalidad !== Temporalidad.permanente ||
            formData.descripcion !== '' ||
            formData.duracionMes !== '' ||
            !formData.imponible;
        
        setHasChanges(hasFormChanges);
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAdvertencias([]);
        
        // Debug log para validación del monto
        console.log('isValidMonto:', isValidMonto(formData.monto));
        
        // Validar campos requeridos
        let isValid = true;
        if (!formData.nombreBono.trim() || formData.nombreBono.trim() === 'Por Definir') {
            console.log('Nombre del bono inválido'); 
            isValid = false;
        }

        if (!formData.monto || isValidMonto(formData.monto) === false) {
            console.log('Monto inválido');
            isValid = false;
        }
        if (!formData.tipoBono.trim() || formData.tipoBono.trim() === 'Seleccione una opción') {
            console.log('Tipo de bono inválido');
            isValid = false;
        }
        if (!formData.temporalidad.trim() || formData.temporalidad.trim() === 'Seleccione una opción') {
            console.log('Temporalidad inválida');
            isValid = false;
        }
        if ((formData.temporalidad === 'recurrente' || formData.temporalidad === 'puntual') && !formData.duracionMes) {
            console.log('Duración requerida para temporalidad puntual o recurrente');
            isValid = false;
        }


        
        
        // Solo mostrar errores de validación si el formulario no es válido
        if (!isValid) {
            console.log('Formulario inválido:', {
                nombreBono: formData.nombreBono,
                monto: formData.monto,
                tipoBono: formData.tipoBono,
                temporalidad: formData.temporalidad,
                duracionMes: formData.duracionMes,
                imponible: formData.imponible
            });
            setValidated(true);
            return; // No mostrar mensaje de error general, dejar que los campos individuales muestren sus errores
        }

        try {
            setLoading(true);
            const dataCreate = {
                nombreBono: formData.nombreBono.trim(),
                monto: cleanNumber(formData.monto),
                tipoBono: formData.tipoBono,
                temporalidad: formData.temporalidad,
                descripcion: formData.descripcion.trim(),
                imponible: formData.imponible || undefined,
                duracionMes: formData.duracionMes ? cleanNumber(formData.duracionMes) : undefined,
                fechaCreacion: formData.fechaCreacion
            }
            const result = await createBono(dataCreate);
            console.log('Resultado de crear bono:', result);
            if (result.success) {
                if (result.advertencias && result.advertencias.length > 0) {
                    setAdvertencias(result.advertencias);
                }
                onSuccess();
            } else {
                setError(result.error || 'Error al crear bono');
            }
        } catch (error) {
            setError('Error al crear bono');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        // Limpiar errores creacion
        let newFormData;
        if (name === 'monto') {
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
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
            <Modal.Body>
            <div style={{ padding: '0.5rem 1rem' }}>
                {error && (
                    <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}
                    </Alert>
                )}
                {advertencias.length > 0 && (
                    <Alert variant="warning" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-start">
                            <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
                            <div>
                                <strong>Advertencias:</strong>
                                <ul className="mb-0 mt-1">
                                    {advertencias.map((adv, index) => (
                                    <li key={index}>{adv}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Alert>
                )}
                <Form onSubmit={handleSubmit} noValidate validated={validated}>
                    <Row
                        style={{
                            background: 'linear-gradient(135deg, #C9CCD3 0%, #78808D 100%)',
                            border: 'none',
                            padding: '1rem 1.25rem'
                        }}
                    >
                        <Col className="text-white">
                            <Modal.Title className="fw-semibold">
                                <i className="bi bi-clipboard-data me-2"></i>
                                Crear Bono
                            </Modal.Title>
                        </Col>
                    </Row>
                    <Row> 
                        <Col>
                            {/* Nombre del Bono */}
                            <Form.Group>
                                <Form.Label className="fw-semibold">Nombre: <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                type="text"
                                name="nombreBono"
                                value={formData.nombreBono}
                                onChange={handleInputChange}
                                placeholder="Ej: Bono Producción Mensual"
                                required
                                style={{ borderRadius: '8px' }}
                                isInvalid={validated && !formData.nombreBono.trim()}
                                />
                                <Form.Control.Feedback type="invalid">
                                {validated && !formData.nombreBono.trim() && 'Nombre inválido'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col>
                            {/* Monto del Bono */}
                            <Form.Group>
                                <Form.Label className="fw-semibold">Monto: <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleInputChange}
                                    required
                                    style={{ borderRadius: '8px' }}
                                    placeholder="10.000"
                                    isInvalid={validated && (!formData.monto || parseInt(cleanNumber(formData.monto)) <= 0)}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validated && formData.monto && !isValidMonto(formData.monto) && 'Monto inválido'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            {/* Tipo de Bono */}
                            <Form.Group>
                                <Form.Label className="fw-semibold">Tipo de Bono: <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                name="tipoBono"
                                value={formData.tipoBono}
                                onChange={handleInputChange}
                                required
                                style={{ borderRadius: '8px' }}
                                isInvalid={validated && !formData.tipoBono}
                                >
                                <option value="">Seleccione una opción</option>
                                <option value={TipoBono.estatal}>Estatal</option>
                                <option value={TipoBono.empresarial}>Empresarial</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                {validated && !formData.tipoBono && 'Seleccione un tipo de bono'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>   
                        <Col>
                            {/* Temporalidad del Bono */}                   
                            <Form.Group>
                                <Form.Label className="fw-semibold">Temporalidad: <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="temporalidad"
                                    value={formData.temporalidad}
                                    onChange={handleInputChange}
                                    required
                                    style={{ borderRadius: '8px' }}
                                    isInvalid={validated && (!formData.temporalidad || formData.temporalidad === 'Seleccione una opción')}
                                >
                                    <option value="">Seleccione una opción</option>
                                    <option value={Temporalidad.puntual}>Puntual</option>
                                    <option value={Temporalidad.recurrente}>Recurrente</option>
                                    <option value={Temporalidad.permanente}>Permanente</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {validated && !formData.temporalidad && 'Seleccione una temporalidad'}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>     
                    </Row>    

                    <Row>
                        <Col>
                            {/* Descripción del Bono */}
                            <Form.Group>
                                <Form.Label className="fw-semibold">Descripción:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>   
                        <Col>
                            <Row>
                                {/* Imponible */}
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Imponible:</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="imponibleSwitch"
                                        name="imponible"
                                        checked={formData.imponible}
                                        onChange={(e) => setFormData({ ...formData, imponible: e.target.checked })}
                                        style={{ borderRadius: '8px' }}
                                        className="form-switch"
                                    />
                                    <Form.Text className="text-muted">
                                        {formData.imponible ? 'Este bono será considerado imponible.' : 'Este bono no será considerado imponible.'}
                                    </Form.Text>
                                </Form.Group>
                            </Row>
                            <Row>
                                {/* Duración en meses */}
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Duración en meses:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duracionMes"
                                        value={formData.duracionMes}
                                        onChange={handleInputChange}
                                        min={1}
                                        style={{ borderRadius: '8px' }}
                                        disabled={
                                            !formData.temporalidad  ||
                                            formData.temporalidad === 'permanente'
                                        }
                                        required={formData.temporalidad === 'puntual' || formData.temporalidad === 'recurrente'}
                                        isInvalid={
                                            validated && 
                                            formData.temporalidad !== 'permanente' && 
                                            !formData.duracionMes}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validated && formData.temporalidad !== 'permanente' && !formData.duracionMes && 'Ingrese una duración válida en meses para temporalidad recurrente o puntual.'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                        </Col>     
                    </Row>    
                   
                    
                    
                    
                    
                    
                    {/* Botones */}
                    <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
                        <Button
                            variant="outline-secondary"
                            onClick={onHide}
                            disabled={loading}
                            style={{ borderRadius: '20px', fontWeight: '500' }}
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancelar
                        </Button>
                        <Button
                            type="submit" 
                            variant="primary" 
                            disabled={loading || !hasChanges}
                            style={{ borderRadius: '20px', fontWeight: '500' }}
                        >
                            {loading ? (
                                <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creando...
                                </>
                            ) : (
                                <>
                                <i className="bi bi-person-plus me-2"></i>
                                Crear Bono
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </div>
            </Modal.Body>
        </Modal>
        
    );
};