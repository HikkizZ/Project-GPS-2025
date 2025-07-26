import React from 'react';
import { Modal, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';

interface TrabajadorDetalleModalProps {
  show: boolean;
  onHide: () => void;
  trabajador: Trabajador | null;
}

export const TrabajadorDetalleModal: React.FC<TrabajadorDetalleModalProps> = ({ show, onHide, trabajador }) => {
  if (!trabajador) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-badge me-2"></i>
          Detalles del Trabajador
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="fw-bold text-primary mb-3">Información Personal</h6>
                <div><strong>RUT:</strong> {trabajador.rut}</div>
                <div><strong>Nombres:</strong> {trabajador.nombres}</div>
                <div><strong>Apellido Paterno:</strong> {trabajador.apellidoPaterno}</div>
                <div><strong>Apellido Materno:</strong> {trabajador.apellidoMaterno}</div>
                <div><strong>Fecha de Nacimiento:</strong> {trabajador.fechaNacimiento ? new Date(trabajador.fechaNacimiento).toLocaleDateString() : '-'}</div>
                <div><strong>Fecha de Ingreso:</strong> {trabajador.fechaIngreso ? new Date(trabajador.fechaIngreso).toLocaleDateString() : '-'}</div>
                <div><strong>Teléfono:</strong> {trabajador.telefono}</div>
                <div><strong>Correo Personal:</strong> {trabajador.correoPersonal}</div>
                <div><strong>N° Emergencia:</strong> {trabajador.numeroEmergencia || '-'}</div>
                <div><strong>Dirección:</strong> {trabajador.direccion}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6 className="fw-bold text-primary mb-3">Información Laboral</h6>
                {(
                  // Mostrar siempre los campos, aunque no haya fichaEmpresa
                  true
                ) && (
                  <>
                    <div><strong>Cargo:</strong> {trabajador.fichaEmpresa?.cargo || '-'}</div>
                    <div><strong>Área:</strong> {trabajador.fichaEmpresa?.area || '-'}</div>
                    <div><strong>Tipo Contrato:</strong> {trabajador.fichaEmpresa?.tipoContrato || '-'}</div>
                    <div><strong>Jornada Laboral:</strong> {trabajador.fichaEmpresa?.jornadaLaboral || '-'}</div>
                    <div><strong>Sueldo Base:</strong> {trabajador.fichaEmpresa?.sueldoBase ? `$${trabajador.fichaEmpresa.sueldoBase.toLocaleString()}` : '-'}</div>
                    <div><strong>Fecha Inicio Contrato:</strong> {trabajador.fichaEmpresa?.fechaInicioContrato ? new Date(trabajador.fichaEmpresa.fechaInicioContrato).toLocaleDateString() : '-'}</div>
                    <div><strong>Fecha Fin Contrato:</strong> {trabajador.fichaEmpresa?.fechaFinContrato ? new Date(trabajador.fichaEmpresa.fechaFinContrato).toLocaleDateString() : '-'}</div>
                    <div><strong>AFP:</strong> {trabajador.fichaEmpresa?.afp || '-'}</div>
                    <div><strong>Salud:</strong> {trabajador.fichaEmpresa?.previsionSalud || '-'}</div>
                    <div><strong>Seguro cesantía:</strong> {trabajador.fichaEmpresa?.seguroCesantia || '-'}</div>
                    <div><strong>Bonos asignados:</strong> {trabajador.fichaEmpresa?.asignacionesBonos.map(asignacion => asignacion.bono.nombre).join(', ') || '-'}</div>
                    <div><strong>Estado:</strong> {trabajador.fichaEmpresa?.estado || '-'}</div>
                  </>
                )}
                {trabajador.usuario && (
                  <div className="mt-3">
                    <h6 className="fw-bold text-info">Usuario Asociado</h6>
                    <div><strong>Email Corporativo:</strong> {trabajador.usuario.corporateEmail}</div>
                    <div><strong>Rol:</strong> {trabajador.usuario.role}</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Eliminar historial laboral */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <i className="bi bi-x-circle me-2"></i>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 