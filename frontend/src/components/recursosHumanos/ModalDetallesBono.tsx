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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-cash-coin me-2 text-success"></i>
          Detalles del Bono
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Información del Trabajador */}
        <div className="mb-4">
          <h6 className="fw-bold text-primary mb-3">
            <i className="bi bi-person me-2"></i>
            Información del Trabajador
          </h6>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Nombre:</label>
                <div className="fs-5 text-primary">
                  {ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">RUT:</label>
                <div className="font-monospace">{ficha.trabajador.rut}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Cargo:</label>
                <div>{ficha.cargo}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Área:</label>
                <div>{ficha.area}</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información del Bono */}
        <div className="mb-4">
          <h6 className="fw-bold text-success mb-3">
            <i className="bi bi-cash-coin me-2"></i>
            Información del Bono
          </h6>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Nombre del Bono:</label>
                <div className="fs-5 fw-bold text-success">{bono.nombreBono}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Monto:</label>
                <div className="fs-5 fw-bold text-success">{formatearMonto(bono.monto)}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Tipo de Bono:</label>
                <div>
                  <Badge bg={getTipoBonoColor(bono.tipoBono)} className="fs-6">
                    {bono.tipoBono === 'estatal' ? 'Estatal' : 'Empresarial'}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Temporalidad:</label>
                <div>
                  <Badge bg={getTemporalidadColor(bono.temporalidad)} className="fs-6">
                    {getTemporalidadTexto(bono.temporalidad)}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Imponible:</label>
                <div>
                  <Badge bg={bono.imponible ? 'success' : 'secondary'} className="fs-6">
                    {bono.imponible ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </Col>
            {bono.duracionMes && (
              <Col md={6}>
                <div>
                  <label className="fw-bold">Duración (meses):</label>
                  <div className="fs-5">{bono.duracionMes}</div>
                </div>
              </Col>
            )}
            {bono.descripcion && (
              <Col md={12}>
                <div>
                  <label className="fw-bold">Descripción:</label>
                  <div className="bg-light p-3 rounded">{bono.descripcion}</div>
                </div>
              </Col>
            )}
          </Row>
        </div>

        {/* Información de la Asignación */}
        <div className="mb-4">
          <h6 className="fw-bold text-info mb-3">
            <i className="bi bi-calendar-check me-2"></i>
            Información de la Asignación
          </h6>
          <Row className="g-3">
            <Col md={6}>
              <div>
                <label className="fw-bold">Fecha de Asignación:</label>
                <div className="fs-5">{formatearFecha(asignacion.fechaAsignacion)}</div>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <label className="fw-bold">Estado:</label>
                <div>
                  <Badge bg={asignacion.activo ? 'success' : 'secondary'} className="fs-6">
                    {asignacion.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </Col>
            {asignacion.fechaFinAsignacion && (
              <Col md={6}>
                <div>
                  <label className="fw-bold">Fecha de Fin:</label>
                  <div className="fs-5">{formatearFecha(asignacion.fechaFinAsignacion)}</div>
                </div>
              </Col>
            )}
            {asignacion.observaciones && (
              <Col md={12}>
                <div>
                  <label className="fw-bold">Observaciones:</label>
                  <div className="bg-light p-3 rounded">{asignacion.observaciones}</div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </Modal.Body>
    </Modal>
  );
}; 