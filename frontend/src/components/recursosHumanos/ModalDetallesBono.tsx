import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import { FichaEmpresa } from '@/types/recursosHumanos/fichaEmpresa.types';

interface ModalDetallesBonoProps {
  show: boolean;
  onHide: () => void;
  bono: {
    id: number;
    nombreBono: string;
    monto: string;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    duracionMes?: string;
  } | null;
  ficha: FichaEmpresa | null;
  asignacion: {
    id: number;
    observaciones?: string;
    fechaAsignacion: Date | string;
    fechaFinAsignacion?: Date | string | null;
    activo: boolean;
  } | null;
}

export const ModalDetallesBono: React.FC<ModalDetallesBonoProps> = ({
  show,
  onHide,
  bono,
  ficha,
  asignacion
}) => {
  if (!bono || !ficha || !asignacion) return null;

  // Formatear fecha
  const formatearFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Formatear monto
  const formatearMonto = (monto: string) => {
    return `$${parseInt(monto).toLocaleString()}`;
  };

  // Obtener color del tipo de bono
  const getTipoBonoColor = (tipo: string) => {
    return tipo === 'estatal' ? 'primary' : 'success';
  };

  // Obtener color de la temporalidad
  const getTemporalidadColor = (temporalidad: string) => {
    switch (temporalidad) {
      case 'permanente': return 'success';
      case 'recurrente': return 'warning';
      case 'puntual': return 'info';
      default: return 'secondary';
    }
  };

  // Obtener texto de temporalidad
  const getTemporalidadTexto = (temporalidad: string) => {
    switch (temporalidad) {
      case 'permanente': return 'Permanente';
      case 'recurrente': return 'Recurrente';
      case 'puntual': return 'Puntual';
      default: return temporalidad;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-enhanced">
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-cash-coin me-2"></i>
          <span>Detalles del Bono</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información del Trabajador */}
        <section className="modal-section">
          <div className="modal-section-title">
            <i className="bi bi-person me-2"></i>
            Información del Trabajador
          </div>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <span className="label">Nombre:</span>
                <span className="value ms-2">
                  {ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}
                </span>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">RUT:</span>
                <span className="value ms-2 font-monospace">{ficha.trabajador.rut}</span>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Cargo:</span>
                <span className="value ms-2">{ficha.cargo}</span>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Área:</span>
                <span className="value ms-2">{ficha.area}</span>
              </div>
            </Col>
          </Row>
        </section>
        {/* Información del Bono */}
        <section className="modal-section">
          <div className="modal-section-title">
            <i className="bi bi-gift me-2"></i>
            Información del Bono
          </div>
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <div>
                <span className="label">Nombre del Bono:</span>
                <span className="value highlight ms-2">{bono.nombreBono}</span>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Monto:</span>
                <span className="value money ms-2">{formatearMonto(bono.monto)}</span>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Tipo de Bono:</span>
                <Badge bg={getTipoBonoColor(bono.tipoBono)} className="ms-2 fs-6">
                  {bono.tipoBono === 'estatal' ? 'Estatal' : 'Empresarial'}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Temporalidad:</span>
                <Badge bg={getTemporalidadColor(bono.temporalidad)} className="ms-2 fs-6">
                  {getTemporalidadTexto(bono.temporalidad)}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Imponible:</span>
                <Badge bg={bono.imponible ? 'success' : 'secondary'} className="ms-2 fs-6">
                  {bono.imponible ? 'Sí' : 'No'}
                </Badge>
              </div>
            </Col>
            {bono.duracionMes && (
              <Col md={6}>
                <div>
                  <span className="label">Duración:</span>
                  <span className="value ms-2">{bono.duracionMes} meses</span>
                </div>
              </Col>
            )}
            {bono.descripcion && (
              <Col md={12}>
                <div>
                  <span className="label">Descripción:</span>
                  <div className="bg-light p-3 rounded mt-1">{bono.descripcion}</div>
                </div>
              </Col>
            )}
          </Row>
        </section>
        {/* Información de la Asignación */}
        <section className="modal-section">
          <div className="modal-section-title">
            <i className="bi bi-calendar-check me-2"></i>
            Información de la Asignación
          </div>
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <div>
                <span className="label">Fecha de Asignación:</span>
                <span className="value ms-2">{formatearFecha(asignacion.fechaAsignacion)}</span>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <span className="label">Estado:</span>
                <Badge bg={asignacion.activo ? 'success' : 'secondary'} className="ms-2 fs-6">
                  {asignacion.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </Col>
            {asignacion.fechaFinAsignacion && (
              <Col md={6}>
                <div>
                  <span className="label">Fecha de Fin:</span>
                  <span className="value ms-2">{formatearFecha(asignacion.fechaFinAsignacion)}</span>
                </div>
              </Col>
            )}
            {asignacion.observaciones && (
              <Col md={12}>
                <div>
                  <span className="label">Observaciones:</span>
                  <div className="bg-light p-3 rounded mt-1">{asignacion.observaciones}</div>
                </div>
              </Col>
            )}
          </Row>
        </section>
      </Modal.Body>
    </Modal>
  );
}; 