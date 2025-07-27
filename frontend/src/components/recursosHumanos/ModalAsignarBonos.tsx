import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Toast as BootstrapToast } from 'react-bootstrap';
import { FichaEmpresa, AsignarBonoDTO, AsignarFichaEmpresaData, AsignacionesBonos } from '@/types/recursosHumanos/fichaEmpresa.types';
import { updateFichaEmpresa, uploadContrato, downloadContrato, deleteContrato, getFichaEmpresa, asignarBono } from '@/services/recursosHumanos/fichaEmpresa.service';
import { useToast } from '@/components/common/Toast';
import { useBono } from '@/hooks/recursosHumanos/useBonos';

interface AsignarBonosFichaEmpresaModalProps {
  show: boolean;
  onHide: () => void;
  asignaciones: AsignacionesBonos;
  ficha: FichaEmpresa;
  onSuccess?: () => void;
}

// Función para formatear fecha sin problemas de zona horaria
const formatLocalDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return ''; // Verifica si la fecha es válida
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function calcularFechaFinAsignacion(fechaAsignacion: string | Date, duracionMes: number): string {
  if (!duracionMes || duracionMes <= 0) return '';
  const fechaFin = new Date(fechaAsignacion);
  fechaFin.setMonth(fechaFin.getMonth() + duracionMes);
  return formatLocalDate(fechaFin);
}

export const AsignarBonosFichaEmpresaModal: React.FC<AsignarBonosFichaEmpresaModalProps> = ({
  show,
  onHide,
  asignaciones,
  ficha,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formatData, setFormatData] = useState<AsignacionesBonos | null>(null);
  const { bonos } = useBono();

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    if (!show || !bonos.length) return;

    // Solo inicializar si no hay datos previos o si es la primera vez que se abre
    if (!formatData) {
      const now = new Date();
      const fechaAsignacion = formatLocalDate(now);

      // Inicializar con un bono por defecto si no hay uno seleccionado
      const bonoInicial = asignaciones.bono || '';
      
      const bonoSeleccionado = bonos.find(
        (b) => String(b.id) === String(bonoInicial)
      );

      const temporalidad = bonoSeleccionado?.temporalidad;
      const duracionMes = bonoSeleccionado?.duracionMes ? parseInt(bonoSeleccionado.duracionMes) : 0;

      let fechaFinAsignacion = '';
      if (temporalidad !== 'permanente' && duracionMes > 0) {
        fechaFinAsignacion = calcularFechaFinAsignacion(now, duracionMes);
      }
      
      setFormatData({
        fechaAsignacion,
        fechaFinAsignacion,
        activo: true,
        bono: bonoInicial,
        fichaEmpresa: ficha,
        observaciones: '',
      });

      setHasChanges(false); // Cambiar a false para que no se pueda guardar sin seleccionar bono
      setValidated(false); // Resetear validación
    }
  }, [show, bonos]); // Remover asignaciones y ficha de las dependencias

  // Actualizar hasChanges cuando se selecciona un bono válido
  useEffect(() => {
    if (formatData?.bono && formatData.bono.trim() !== '' && formatData.bono.trim() !== 'Seleccione una opción') {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [formatData?.bono]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setFormatData(null);
      setValidated(false);
      setHasChanges(false);
    }
  }, [show]);

  // Validación dinámica en el submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);

    // Validación estricta de campos requeridos y formato de fechas
    let isValid = true;
    const bono = formatData?.bono;
    
    // Validar campos requeridos
    if (!bono || bono.trim() === '' || bono.trim() === 'Seleccione una opción') {
      isValid = false;
    }

    if (!isValid) {
      // No mostrar toast de error, solo dejar los mensajes en rojo bajo los campos
      return;
    }

    setLoading(true);
    try {
        const bonoSeleccionado = bonos.find(b => String(b.id) === String(bono));
        const bonoId = bonoSeleccionado?.id;

        const dataToSubmit: AsignarBonoDTO = {
            bonoId: Number(bonoId),
            observaciones: formatData?.observaciones
        };

        const response = await asignarBono(ficha.id, dataToSubmit);
        if (response.success) {
            showSuccess('Bono asignado correctamente', 'El bono se ha asignado exitosamente a la ficha de empresa.', 5000);
            onSuccess?.();
            onHide();
        } else {
            showError('Error al asignar bono', response.message || 'No se pudo asignar el bono. Intente nuevamente.', 6000);
        }
    } catch (error: any) {
      // Solo mostrar toast si es un error inesperado del backend
      showError('Error inesperado', error.message || 'Error inesperado al actualizar la ficha', 6000);
    } finally {
      setLoading(false);
    }
  };
    const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === 'bono') {
      // Si se cambia el bono, actualizar las fechas
      const bonoSeleccionado = bonos.find(b => String(b.id) === String(value));
      const temporalidad = bonoSeleccionado?.temporalidad;
      const duracionMes = bonoSeleccionado?.duracionMes ? parseInt(bonoSeleccionado.duracionMes) : 0;

      let fechaFinAsignacion = '';
      if (temporalidad !== 'permanente' && duracionMes > 0) {
        const now = new Date();
        fechaFinAsignacion = calcularFechaFinAsignacion(now, duracionMes);
      }

      const newFormData = { 
        ...formatData, 
        [name]: value,
        fechaFinAsignacion
      } as AsignacionesBonos;
      
      setFormatData(newFormData);
    } else {
      const newFormData = { ...formatData, [name]: value } as AsignacionesBonos;
      setFormatData(newFormData);
    }
        
    if (validated) {
      setValidated(false);
    }
  };


  return (
    <>
      <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg" 
      backdrop="static"
      >
        <Modal.Header
          style={{
            background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
            border: 'none',
            padding: '1rem 1.25rem'
          }}
          className="text-white"
        >
          <Modal.Title className="fw-semibold">
            <i className="bi bi-clipboard-data me-2"></i>
            Asignar Bono
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.25rem' }}>
          {/* Información de la asignacion - Tamaño balanceado */}
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
                <strong className="ms-1">
                {ficha && ficha.trabajador
                  ? `${ficha.trabajador.nombres} ${ficha.trabajador.apellidoPaterno} ${ficha.trabajador.apellidoMaterno}`
                  : <span className="text-danger">Sin datos</span>
                }
              </strong>
              </div>
            </div>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="g-3 mb-3">
              {/* Bono y observaciones */}
              <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold">Bono <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                        name="bono"
                        value={formatData?.bono || ''}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '8px' }}
                        isInvalid={
                            validated &&
                            (!formatData?.bono ||
                                formatData?.bono.trim() === '' ||
                                formatData?.bono.trim() === 'Seleccione una opción')
                            }
                    >
                    <option value="">Seleccione una opción</option>
                    {bonos.map(b => (
                      <option key={b.id} value={b.id}>{b.nombreBono}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                        {validated &&
                        (!formatData?.bono ||
                            formatData?.bono.trim() === '' ||
                            formatData?.bono.trim() === 'Seleccione una opción') &&
                        'Completa este campo'}
                    </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Observaciones</Form.Label>
                  <Form.Control
                    type="text"
                    name="observaciones"
                    value={formatData?.observaciones ?? ''}
                    style={{ borderRadius: '8px' }}
                    placeholder="Ej: Tecnología"
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group>
                    <Form.Label className="fw-semibold">
                        Fecha de Asignación <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        type="date"
                        name="fechaAsignacion"
                        value={formatLocalDate(new Date())}
                        readOnly
                        disabled
                        style={{ borderRadius: '8px' }}
                    />
                    <Form.Label className="fw-semibold mt-3">
                        Fecha de Fin de Asignación <span className="text-danger"></span>
                    </Form.Label>
                    {(() => {
                        const bonoSeleccionado = useMemo(() => {
                        return bonos.find(b => String(b.id) === String(formatData?.bono));
                      }, [formatData?.bono, bonos]);
                        const temporalidad = bonoSeleccionado?.temporalidad;
                        if (temporalidad === 'permanente') { 
                          return (
                                <Form.Control
                                plaintext
                                readOnly
                                value="Indefinido"
                                style={{ borderRadius: '8px' }}
                                />
                            );
                        }

                        const fechaAsignacion = new Date(); 
                        const duracionMes = bonoSeleccionado?.duracionMes ? parseInt(bonoSeleccionado.duracionMes) : 0;
                        const fechaFin = calcularFechaFinAsignacion(fechaAsignacion, duracionMes);
                        return (
                            <Form.Control
                                type="date"
                                name="fechaFinAsignacion"
                                value={fechaFin}
                                readOnly
                                disabled
                                style={{ borderRadius: '8px' }}
                            />
                        );
                    })()}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e9ecef' }}>
          {(
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