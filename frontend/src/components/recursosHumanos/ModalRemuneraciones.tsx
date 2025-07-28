import React from 'react';
import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { FichaEmpresa } from '@/types/recursosHumanos/fichaEmpresa.types';

interface ModalRemuneracionesProps {
  show: boolean;
  onHide: () => void;
  ficha: FichaEmpresa | null;
}

// Función para calcular sueldo bruto
function calculoSueldoBruto(ficha: FichaEmpresa): number {
  const { sueldoBase, tipoContrato } = ficha;
  const bonos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
  const sumaBonos = bonos.reduce((total, asignacionBono) => total + parseInt(asignacionBono.bono?.monto || '0'), 0);

  if (typeof sueldoBase !== 'number' || isNaN(sueldoBase) || sueldoBase < 0) {
    console.error("Sueldo base no válido.");
    return 0;
  }

  const tiposValidos = ["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time", "Honorarios", "Aprendizaje"];
  if (!tipoContrato || !tiposValidos.includes(tipoContrato)) {
    console.error("Tipo de contrato no válido.");
    return 0;
  }

  if (tipoContrato === "Honorarios") {
    return sueldoBase;
  }

  return sueldoBase + sumaBonos;
}

// Función para calcular sueldo líquido
function calcularSueldoLiquido(ficha: FichaEmpresa): [number, number, number, number, number] {
  const { sueldoBase, tipoContrato, seguroCesantia } = ficha;
  let validacionSueldo = true, validacionTipoContrato = true;
  let sueldoLiquido = 0;
  let descuentoLegal = 0;
  let descuentosInternos = 0; // Por defecto 0, se podría obtener de historial laboral
  let rentaImponible = 0;

  const bonos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
  const bonosImponibles = bonos.filter(bono => bono.bono?.imponible);
  const bonosNoImponibles = bonos.filter(bono => !bono.bono?.imponible);

  const sueldoImponible = sueldoBase + bonosImponibles.reduce((total, asignacionBono) => total + (parseFloat(asignacionBono.bono?.monto || '0') || 0), 0);

  // Comprobar que el sueldo base es un número válido
  if (typeof sueldoBase !== 'number' || isNaN(sueldoBase) || sueldoBase < 0) {
    validacionSueldo = false;
    console.error("Sueldo base no válido o no asignado un descuento específico");
  } 

  // Comprobar que el tipo de contrato es válido
  if (!tipoContrato || !["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time", "Honorarios", "Aprendizaje"].includes(tipoContrato)) {
    validacionTipoContrato = false;
    console.error("Tipo de contrato no válido");
  }

  // Calcular descuento por AFP
  switch (ficha.afp){
    case "AFP Uno": descuentoLegal = sueldoImponible * 0.0049; break;
    case "AFP Modelo": descuentoLegal = sueldoImponible * 0.0058; break;
    case "AFP Planvital": descuentoLegal = sueldoImponible * 0.0116; break;
    case "AFP Habitat": descuentoLegal = sueldoImponible * 0.0127; break;
    case "AFP Capital": descuentoLegal = sueldoImponible * 0.0144; break;
    case "AFP Cuprum": descuentoLegal = sueldoImponible * 0.0144; break;
    case "AFP Provida": descuentoLegal = sueldoImponible * 0.0145; break;
  }
  descuentoLegal += sueldoImponible * 0.07; // 7% de salud

  // Calcular descuentos legales por tipo de contrato
  if (validacionSueldo && validacionTipoContrato) {
    switch (tipoContrato) {
      case "Indefinido":
        if (seguroCesantia === 'Sí' ) {
          descuentoLegal += sueldoImponible * 0.006; // 0.6% de seguro de cesantía
        }
        break;
      case "Plazo Fijo":
        if (seguroCesantia === 'Sí' ) {
          descuentoLegal += sueldoImponible * 0.03; // 3% de seguro de cesantía
        }
        break;
      case "Por Obra":
        if (seguroCesantia === 'Sí' ) {
          descuentoLegal += sueldoImponible * 0.03; // 3% de seguro de cesantía
        }
        break;
      case "Part-Time":
        if (seguroCesantia === 'Sí' ) {
          descuentoLegal += sueldoImponible * 0.03; // 3% de seguro de cesantía
        }
        break;
      case "Aprendizaje":
      case "Honorarios":
        // No rige por el CT; no hay descuentos legales
        descuentoLegal = 0;
        break;
      default:
        console.error("Tipo de contrato no reconocido");
        validacionTipoContrato = false;
        break;
    }
  }

  // Calcular renta imponible
  rentaImponible = sueldoImponible - descuentoLegal;

  // Asignaciones no imponibles (bonos no imponibles) y descuentos internos
  const totalBonosNoImponibles = bonosNoImponibles.reduce((total, asignacionBono) => total + (parseInt(asignacionBono.bono?.monto || '0') || 0), 0);
  sueldoLiquido = rentaImponible + totalBonosNoImponibles - descuentosInternos;

  return [rentaImponible, descuentoLegal, sueldoLiquido, descuentosInternos, totalBonosNoImponibles];
}

// Función para formatear números como moneda
function formatMiles(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export const ModalRemuneraciones: React.FC<ModalRemuneracionesProps> = ({
  show,
  onHide,
  ficha
}) => {
  if (!ficha || !show) return null;

  const sueldoBruto = calculoSueldoBruto(ficha);
  const [rentaImponible, descuentoLegal, sueldoLiquido, descuentosInternos, totalBonosNoImponibles] = calcularSueldoLiquido(ficha);

  // Debug: Verificar datos recibidos
  console.log('ModalRemuneraciones - Datos de ficha:', {
    id: ficha.id,
    trabajador: ficha.trabajador?.nombres,
    asignacionesBonos: ficha.asignacionesBonos?.length || 0,
    bonosActivos: ficha.asignacionesBonos?.filter(bono => bono.activo).length || 0
  });

  const bonosActivos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
  const bonosImponibles = bonosActivos.filter(bono => bono.bono?.imponible);
  const bonosNoImponibles = bonosActivos.filter(bono => !bono.bono?.imponible);
  
  // Separar bonos permanentes y temporales
  const bonosPermanentes = bonosActivos.filter(bono => bono.bono?.temporalidad === 'permanente');
  const bonosTemporales = bonosActivos.filter(bono => bono.bono?.temporalidad !== 'permanente');
  
  // Función para formatear fecha
  const formatFecha = (fecha: string | Date) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL');
  };

  // Función para verificar si un bono está próximo a vencer (30 días)
  const isProximoAVencer = (fechaFin: string | Date) => {
    if (!fechaFin) return false;
    const fechaFinDate = new Date(fechaFin);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaFinDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  };

  // Función para verificar si un bono está vencido
  const isVencido = (fechaFin: string | Date) => {
    if (!fechaFin) return false;
    const fechaFinDate = new Date(fechaFin);
    const hoy = new Date();
    return fechaFinDate < hoy;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-calculator me-2"></i>
          Detalle de Remuneraciones
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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

        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <i className="bi bi-cash me-2"></i>
                  Ingresos
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Sueldo Base:</span>
                  <strong className="text-success">{formatMiles(ficha.sueldoBase)}</strong>
                </div>
                {bonosPermanentes.length > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Bonos Permanentes:</span>
                    <strong className="text-success">
                      {formatMiles(bonosPermanentes.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0))}
                    </strong>
                  </div>
                )}
                {bonosActivos.length === 0 && (
          <Card className="mb-3">
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

        {bonosTemporales.length > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Bonos Temporales:</span>
                    <strong className="text-warning">
                      {formatMiles(bonosTemporales.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0))}
                    </strong>
                  </div>
                )}
                {(bonosPermanentes.length > 0 || bonosTemporales.length > 0) && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Bonos:</span>
                    <strong className="text-info">
                      {formatMiles(
                        bonosPermanentes.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0) +
                        bonosTemporales.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0)
                      )}
                    </strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Bonos Imponibles:</span>
                  <strong className="text-success">
                    {formatMiles(bonosImponibles.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0))}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Bonos No Imponibles:</span>
                  <strong className="text-success">{formatMiles(totalBonosNoImponibles)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span><strong>Sueldo Bruto:</strong></span>
                  <strong className="text-primary">{formatMiles(sueldoBruto)}</strong>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3">
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <i className="bi bi-scissors me-2"></i>
                  Descuentos
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>AFP ({ficha.afp}):</span>
                  <strong className="text-danger">
                    {formatMiles(rentaImponible * (ficha.afp === "AFP Capital" ? 0.0144 : 0.01))}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Salud (7%):</span>
                  <strong className="text-danger">{formatMiles(rentaImponible * 0.07)}</strong>
                </div>
                {ficha.seguroCesantia === 'Sí' && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Seguro Cesantía:</span>
                    <strong className="text-danger">
                      {formatMiles(rentaImponible * (ficha.tipoContrato === "Indefinido" ? 0.006 : 0.03))}
                    </strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Descuentos Internos:</span>
                  <strong className="text-danger">{formatMiles(descuentosInternos)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span><strong>Total Descuentos:</strong></span>
                  <strong className="text-danger">{formatMiles(descuentoLegal + descuentosInternos)}</strong>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-3">
          <Card.Header className="bg-primary text-white">
            <h6 className="mb-0">
              <i className="bi bi-calculator me-2"></i>
              Resumen Final
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center">
                  <h6 className="text-muted">Renta Imponible</h6>
                  <h4 className="text-info">{formatMiles(rentaImponible)}</h4>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <h6 className="text-muted">Descuento Legal</h6>
                  <h4 className="text-danger">{formatMiles(descuentoLegal)}</h4>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <h6 className="text-muted">Sueldo Líquido</h6>
                  <h4 className="text-success">{formatMiles(sueldoLiquido)}</h4>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {bonosPermanentes.length > 0 && (
          <Card className="mb-3">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">
                <i className="bi bi-gift me-2"></i>
                Bonos Permanentes
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
                      <th>Imponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonosPermanentes.map((asignacion) => (
                      <tr key={asignacion.id}>
                        <td>{asignacion.bono?.nombreBono || 'N/A'}</td>
                        <td className="text-success">{formatMiles(parseInt(asignacion.bono?.monto || '0'))}</td>
                        <td>
                          <Badge bg={asignacion.bono?.tipoBono === 'estatal' ? 'info' : 'warning'}>
                            {asignacion.bono?.tipoBono || 'N/A'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={asignacion.bono?.imponible ? 'success' : 'secondary'}>
                            {asignacion.bono?.imponible ? 'Sí' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        )}

        {bonosTemporales.length > 0 && (
          <Card className="mb-3">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Bonos Temporales
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
                      <th>Imponible</th>
                      <th>Vigencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonosTemporales.map((asignacion) => (
                      <tr key={asignacion.id}>
                        <td>{asignacion.bono?.nombreBono || 'N/A'}</td>
                        <td className="text-success">{formatMiles(parseInt(asignacion.bono?.monto || '0'))}</td>
                        <td>
                          <Badge bg={asignacion.bono?.tipoBono === 'estatal' ? 'info' : 'warning'}>
                            {asignacion.bono?.tipoBono || 'N/A'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={asignacion.bono?.imponible ? 'success' : 'secondary'}>
                            {asignacion.bono?.imponible ? 'Sí' : 'No'}
                          </Badge>
                        </td>
                        <td>
                          <small className={
                            isVencido(asignacion.fechaFinAsignacion) ? 'text-danger' :
                            isProximoAVencer(asignacion.fechaFinAsignacion) ? 'text-warning' :
                            'text-muted'
                          }>
                            {asignacion.fechaFinAsignacion ? 
                              `Hasta ${formatFecha(asignacion.fechaFinAsignacion)}` : 
                              'Sin fecha fin'
                            }
                            {isProximoAVencer(asignacion.fechaFinAsignacion) && (
                              <i className="bi bi-exclamation-triangle ms-1" title="Próximo a vencer"></i>
                            )}
                            {isVencido(asignacion.fechaFinAsignacion) && (
                              <i className="bi bi-x-circle ms-1" title="Vencido"></i>
                            )}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        )}
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