import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { licenciaPermisoService } from '../../services/recursosHumanos/licenciaPermiso.service';
import { useToast, Toast } from '../common/Toast';

interface VerificarEstadosLaboralesProps {
  className?: string;
  variant?: 'primary' | 'white';
}

const VerificarEstadosLaborales: React.FC<VerificarEstadosLaboralesProps> = ({ 
  className = '', 
  variant = 'primary' 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [ultimaEjecucion, setUltimaEjecucion] = useState<string | null>(
    localStorage.getItem('ultimaVerificacionEstados')
  );

  const { toasts, removeToast, showSuccess, showInfo, showError } = useToast();

  const formatearFechaHora = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ejecutarVerificacion = async () => {
    setProcesando(true);
    try {
      const result = await licenciaPermisoService.procesarEstadosLicencias();
      
      if (result.success) {
        const { activadas, desactivadas } = result.data || { activadas: 0, desactivadas: 0 };
        const ahora = new Date().toISOString();
        
        // Guardar timestamp de última ejecución
        setUltimaEjecucion(ahora);
        localStorage.setItem('ultimaVerificacionEstados', ahora);
        
        const totalCambios = activadas + desactivadas;
        if (totalCambios > 0) {
          let mensajeDetallado = '';
          if (activadas > 0 && desactivadas > 0) {
            mensajeDetallado = `${activadas} licencias/permisos activadas y ${desactivadas} desactivadas`;
          } else if (activadas > 0) {
            mensajeDetallado = `${activadas} licencias/permisos activadas`;
          } else if (desactivadas > 0) {
            mensajeDetallado = `${desactivadas} licencias/permisos desactivadas`;
          }
          showSuccess(
            'Procesamiento Completado',
            `Se procesaron: ${mensajeDetallado}`
          );
        } else {
          showInfo(
            'Procesamiento Completado',
            'Todos los estados laborales están actualizados. No se realizaron cambios.'
          );
        }
      } else {
        showError('Error en el Procesamiento', result.message || 'Error al procesar estados laborales');
      }
    } catch (error: any) {
      console.error('Error al procesar estados:', error);
      showError('Error Inesperado', 'Error inesperado al procesar estados laborales');
    } finally {
      setProcesando(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Botón Principal */}
      <Button
        variant={variant === 'white' ? 'outline-light' : 'outline-primary'}
        className={`d-flex align-items-center ${className}`}
        onClick={() => setShowModal(true)}
        disabled={procesando}
        style={{ 
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          fontWeight: '500',
          ...(variant === 'white' && {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            color: 'white'
          })
        }}
      >
        <i 
          className={`bi bi-arrow-clockwise me-2 ${procesando ? 'rotating' : ''}`}
          style={{ fontSize: '1.1rem' }}
        ></i>
                    {procesando ? 'Procesando...' : 'Procesar Estados'}
      </Button>

      {/* Modal de Confirmación */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
                      <Modal.Title className="d-flex align-items-center">
              <i className="bi bi-arrow-clockwise text-primary me-2"></i>
              Procesar Estados Laborales
            </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-4 pb-4">
          <Alert variant="info" className="mb-4">
            <Alert.Heading className="h6 mb-2">
              <i className="bi bi-info-circle me-2"></i>
              ¿Qué hace esta acción?
            </Alert.Heading>
            <p className="mb-0 small">
              Procesa automáticamente todos los estados de licencias y permisos: activa las que deben comenzar hoy y desactiva las que ya terminaron. 
              Es completamente seguro ejecutarlo múltiples veces.
            </p>
          </Alert>

          <div className="mb-4">
            <h6 className="fw-bold mb-3">Esta acción:</h6>
            <div className="row g-3">
              <div className="col-6">
                <div className="d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <small>Solo afecta licencias realmente vencidas</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <small>Es seguro ejecutar múltiples veces</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <small>No duplica actualizaciones</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                  <small>Muestra cuántos registros se actualizaron</small>
                </div>
              </div>
            </div>
          </div>

          {ultimaEjecucion && (
            <div className="bg-light rounded p-3">
              <small className="text-muted d-flex align-items-center">
                <i className="bi bi-clock me-2"></i>
                Última ejecución: <strong className="ms-1">{formatearFechaHora(ultimaEjecucion)}</strong>
              </small>
            </div>
          )}

          <div className="mt-4 p-3 bg-warning bg-opacity-10 rounded">
            <small className="text-warning-emphasis">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Nota:</strong> Esta acción se ejecuta automáticamente todos los días a las 00:01. 
              Solo úsala si necesitas procesar estados de manera inmediata.
            </small>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={ejecutarVerificacion}
            disabled={procesando}
            className="d-flex align-items-center"
          >
            {procesando ? (
              <>
                <Spinner size="sm" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                <i className="bi bi-play-fill me-2"></i>
                Ejecutar Procesamiento
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* CSS para animación de rotación */}
      <style>
        {`
          .rotating {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default VerificarEstadosLaborales; 