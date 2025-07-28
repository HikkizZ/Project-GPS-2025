import React from 'react';
import { Modal, Card, Badge } from 'react-bootstrap';
import { FichaEmpresa } from '@/types/recursosHumanos/fichaEmpresa.types';
import { calculoSueldoBruto, calcularSueldoLiquido } from '@/pages/recursosHumanos/GestionRemuneracionesPage';
import { formatAFP } from '@/utils/index';

interface ModalRemuneracionesProps {
  show: boolean;
  onHide: () => void;
  ficha: FichaEmpresa;
}

// Función para formatear números con separadores de miles
const formatMiles = (numero: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(numero);
};
/*
// Función para calcular sueldo bruto simplificado
function calculoSueldoBruto(ficha: FichaEmpresa): number {
  const { sueldoBase } = ficha;
  const bonos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
  const sumaBonos = bonos.reduce((total, asignacionBono) => total + parseInt(asignacionBono.bono?.monto || '0'), 0);
  return sueldoBase + sumaBonos;
}

// Función para calcular sueldo líquido simplificado
function calcularSueldoLiquido(ficha: FichaEmpresa): number {
  const sueldoBruto = calculoSueldoBruto(ficha);
  
  // Descuentos legales (simplificados)
  const afp = Math.round(sueldoBruto * 0.10); // 10% AFP, dependiente del tipo de afp
  const salud = Math.round(sueldoBruto * 0.07); // 7% Salud
  const seguroCesantia = Math.round(sueldoBruto * 0.03); // 3% Seguro Cesantía va al seguro cesantía Es dependiente del tipo de contrato
  
  const totalDescuentos = afp + salud + seguroCesantia;
  return sueldoBruto - totalDescuentos;
}
*/


export const ModalRemuneraciones: React.FC<ModalRemuneracionesProps> = ({
  show, onHide, ficha
}) => {
  if (!ficha || !show) return null;

  const sueldoBruto = calculoSueldoBruto(ficha);
  const [sueldoLiquido] = calcularSueldoLiquido(ficha, null);
  const bonosActivos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
  const totalBonos = bonosActivos.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0);
  
  // Descuentos legales
  const afp = Math.round(sueldoBruto * 0.10);
  const salud = Math.round(sueldoBruto * 0.07);
  const seguroCesantia = Math.round(sueldoBruto * 0.03);
  const totalDescuentos = afp + salud + seguroCesantia;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header 
        closeButton
        style={{
          background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
          border: 'none',
          color: 'white'
        }}
      >
        <Modal.Title>
          <i className="bi bi-calculator me-2"></i>
          Resumen de Remuneración
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Información del trabajador */}
        <div className="mb-4">
          <h5 className="text-primary mb-3">
            <i className="bi bi-person me-2"></i>
            {ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}
          </h5>
          <p className="text-muted mb-0">
            <i className="bi bi-briefcase me-2"></i>
            {ficha.cargo} - {ficha.area}
          </p>
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            Última actualización: {new Date().toLocaleString('es-CL')}
          </small>
        </div>

        {/* Resumen de Remuneración */}
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h6 className="mb-0">
              <i className="bi bi-cash-stack me-2"></i>
              Resumen de Remuneración
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-success mb-3">Ingresos</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Sueldo Base:</span>
                  <strong className="text-success">{formatMiles(ficha.sueldoBase)}</strong>
                </div>
                {totalBonos > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Bonos:</span>
                    <strong className="text-success">{formatMiles(totalBonos)}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Sueldo Bruto:</span>
                  <strong className="text-primary">{formatMiles(sueldoBruto)}</strong>
                </div>
              </div>
              
              <div className="col-md-6">
                <h6 className="text-danger mb-3">Descuentos Legales</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>AFP ({formatAFP(ficha.afp)}):</span>
                  <strong className="text-danger">{formatMiles(afp)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Salud {ficha.previsionSalud ? `(${ficha.previsionSalud})` : ''} (7%):</span>
                  <strong className="text-danger">{formatMiles(salud)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Seguro Cesantía:</span>
                  <strong className="text-danger">{formatMiles(seguroCesantia)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Descuentos:</span>
                  <strong className="text-danger">{formatMiles(totalDescuentos)}</strong>
                </div>
              </div>
            </div>
            
            {/* Sueldo Líquido */}
            <div className="mt-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Sueldo Líquido:</span>
                <strong className="text-primary fs-5">{formatMiles(sueldoLiquido)}</strong>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Bonos Asignados */}
        {bonosActivos.length > 0 ? (
          <Card>
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">
                <i className="bi bi-gift me-2"></i>
                Bonos Asignados
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Bono</th>
                      <th>Monto</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonosActivos.map((asignacion) => (
                      <tr key={asignacion.id}>
                        <td>{asignacion.bono?.nombreBono || 'N/A'}</td>
                        <td className="text-success">{formatMiles(parseInt(asignacion.bono?.monto || '0'))}</td>
                        <td>
                          <Badge bg={asignacion.bono?.tipoBono === 'estatal' ? 'info' : 'warning'}>
                            {asignacion.bono?.tipoBono || 'N/A'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de Bonos
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center text-muted">
                <i className="bi bi-gift fs-1 mb-3"></i>
                <p>No hay bonos asignados actualmente.</p>
                <small>Los bonos aparecerán aquí cuando sean asignados por Recursos Humanos.</small>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <button 
          className="btn btn-secondary" 
          onClick={onHide}
        >
          <i className="bi bi-x-circle me-1"></i>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  );
}; 