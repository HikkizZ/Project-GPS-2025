import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Form , Modal, Spinner} from 'react-bootstrap';
import { useBono } from '@/hooks/recursosHumanos/useBonos';
import { Bono, BonoSearchQueryData, BonoSearchParamsData } from '@/types/recursosHumanos/bono.types';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import "../../styles/pages/bonos.css";
import { useFichaEmpresa } from '@/hooks/recursosHumanos/useFichaEmpresa';
import { 
  FichaEmpresa, 
  FichaEmpresaSearchParams,
  EstadoLaboral
} from '@/types/recursosHumanos/fichaEmpresa.types';
import { useAuth, useUI } from '@/context';
import { useRut } from '@/hooks/useRut';



function calculoSueldoBruto(ficha: FichaEmpresa): number {
    const { sueldoBase, tipoContrato } = ficha;
    const bonos = ficha.asignacionesBonos.filter(bono => bono.activo) || [];
    const SumaBonos = bonos.reduce((total, asignacionBono) => total + parseInt(asignacionBono.bono.monto), 0);

     if (typeof sueldoBase !== 'number' || isNaN(sueldoBase) || sueldoBase < 0) {
        console.error("Sueldo base no válido.");
        return 0;
    }

    const tiposValidos = ["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time"];
    if (!tipoContrato || !tiposValidos.includes(tipoContrato)) {
        console.error("Tipo de contrato no válido.");
        return 0;
    }

    const bonosActivos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
    const sumaBonos = bonosActivos.reduce((total, asignacionBono) => total + parseInt(asignacionBono.bono.monto), 0);

    if (tipoContrato === "Honorarios") {
        return sueldoBase;
    }

    return sueldoBase + sumaBonos;
}

function calcularSueldoLiquido(ficha: FichaEmpresa, historialLaboral: any): [number, number, number, number, number] {
    const { sueldoBase, tipoContrato, seguroCesantia } = ficha;
    let validacionSueldo = true, validacionTipoContrato = true;
    let sueldoLiquido = 0;
    let descuentoLegal = 0;
    let descuentosInternos = historialLaboral?.descuentosInternos || 0;
    let rentaImponible = 0;
    


    const bonos = ficha.asignacionesBonos.filter(bono => bono.activo) || [];
    const bonosImponibles = bonos.filter(bono => bono.bono.imponible);
    const bonosNoImponibles = bonos.filter(bono => !bono.bono.imponible);

    const sueldoImponible = sueldoBase + bonosImponibles.reduce((total, asignacionBono) => total + (parseFloat(asignacionBono.bono.monto) || 0), 0);

    // Comprobar que el sueldo base es un número válido
    if (typeof sueldoBase !== 'number' || isNaN(sueldoBase) || sueldoBase < 0) {
        validacionSueldo = false; // Marcar como inválido si no es un número o es negativo
        console.error("Sueldo base no válido o no asignado un descuento específico");
    } 

    // Comprobar que el tipo de contrato es válido
    if (!tipoContrato || !["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time"].includes(tipoContrato)) {
        validacionTipoContrato = false; // Marcar como inválido si el tipo de contrato no es válido
        console.error("Tipo de contrato no válido");
    }

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
    // Calcular descuentos legales
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

    // Asignaciones no imponibles (bonos no imponibles) y descuentos internos si existen
    const totalBonosNoImponibles = bonosNoImponibles.reduce((total, asignacionBono) => total + (parseInt(asignacionBono.bono.monto) || 0), 0);
    sueldoLiquido = rentaImponible + totalBonosNoImponibles - descuentosInternos;

    return [rentaImponible, descuentoLegal, sueldoLiquido, descuentosInternos, totalBonosNoImponibles];
}

// Utilidad para formatear con puntos de miles
function formatMiles(value: string | number): string {
  const num = typeof value === 'number' ? value : value.replace(/\D/g, '');
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const GestionRemuneracionesPage: React.FC = () => {
    const {
        fichas,
        isLoading,
        error: fichaError,
        loadFichas: searchFichas,
        loadFichaById: loadMiFicha,
        formatSalario: formatSueldo,
        searchByRUT,
        clearError
      } = useFichaEmpresa();
    const [showFilters, setShowFilters] = useState(false);
    const { user, isLoading: isAuthLoading } = useAuth();
    const [searchQuery, setSearchQuery] = useState<FichaEmpresaSearchParams>({
        estado: EstadoLaboral.ACTIVO
      });
    const [localError, setLocalError] = useState<string | null>(null);

    const { formatRUT } = useRut();

    // Definir roles y permisos
    const esSuperAdministrador = user?.role === 'SuperAdministrador';
    const esAdminORecursosHumanos = user?.role === 'Administrador' || user?.role === 'RecursosHumanos';
    const puedeGestionarFichas = esSuperAdministrador || esAdminORecursosHumanos;
    
    useEffect(() => {
        if (isAuthLoading || !user) return;

        const isSuperAdmin = user.role === 'SuperAdministrador';
        const isAdminOrRRHH = user.role === 'Administrador' || user.role === 'RecursosHumanos';

        if (isSuperAdmin || isAdminOrRRHH) {
            setSearchQuery(prev => {
            if (prev.estado === EstadoLaboral.ACTIVO) return prev;
            return { estado: EstadoLaboral.ACTIVO };
            });

            searchFichas({ estado: EstadoLaboral.ACTIVO }).catch(err => {
            console.error("Error al cargar fichas:", err);
            });
        }
        }, [user, isAuthLoading]);
    
    const getTipoContratoColor = (tipo: string) => {
    if (tipo === 'Por Definir') {
      return 'por-definir';
    }
    
    switch (tipo.toLowerCase()) {
      case 'indefinido':
        return 'text-success';
      case 'plazo fijo':
        return 'text-warning';
      case 'por obra':
        return 'text-info';
      case 'part-time':
        return 'text-secondary';
      default:
        return 'text-muted';
    }
  };
  // Función helper para campos "Por Definir"
  const getFieldClass = (value: string) => {
    return value === 'Por Definir' ? 'por-definir' : '';
  };
    // Función para manejar la búsqueda
    const handleSearch = async () => {
        // Crear un objeto de búsqueda que incluya todos los filtros
        const searchParams = { ...searchQuery };
        
        // Siempre usar searchFichas, sin importar si hay RUT o no
        await searchFichas(searchParams);
      };

    const handleReset = () => {
        setSearchQuery({ estado: EstadoLaboral.ACTIVO });
        if (puedeGestionarFichas) {
          searchFichas({ estado: EstadoLaboral.ACTIVO });
        }
      };
    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedRut = formatRUT(e.target.value);
        setSearchQuery({ ...searchQuery, rut: formattedRut });
      };
    
    let [ calcularRentaImponible, descuentoLegal, sueldoLiquido, descuentosInternos, totalBonosNoImponibles] = [0, 0, 0, 0, 0];
    if (fichas.length > 0) {
        calcularRentaImponible = calculoSueldoBruto(fichas[0]);
        [calcularRentaImponible, descuentoLegal, sueldoLiquido, descuentosInternos, totalBonosNoImponibles] = calcularSueldoLiquido(fichas[0], null);
    }

    return (
        <Container fluid className="py-2">
            <Row>
                <Col>
                    {/* Encabezado de página */}
                    <Card className="shadow-sm mb-3">
                        <Card.Header className="bg-gradient-primary text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-calculator fs-4 me-3"></i>
                                    <div>
                                        <h3 className="mb-1">Calculo de remuneraciones por trabajadores</h3>
                                        <p className="mb-0 opacity-75">
                                            Administrar información de remuneraciones del sistema
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Button 
                                        variant={showFilters ? "outline-light" : "light"}
                                        className="me-2"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                                        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>
                    </Card>

                    {/* Información explicativa */}
                    <Card className="shadow-sm mb-3">
                        <Card.Body>
                            <Alert variant="warning" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
                                <div className="d-flex align-items-start">
                                    <i className="bi bi-exclamation-triangle me-3 mt-1 text-warning"></i>
                                    <div>
                                        <strong>Importante:</strong>
                                        <p className="mb-0 mt-1">
                                            Revise la información calculada de AFP, previsión salud, bonos, licencias, permisos, seguro de cesantía y más, antes de realizar el pago de las remuneraciones de los trabajadores.
                                        </p>
                                    </div>
                                </div>
                            </Alert>

                            <div className="mt-4">
                                <h5 className="fw-semibold mb-3">La siguiente tabla muestra las siguientes características:</h5>
                                <div className="row">
                                    <div className="col-md-6">
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <strong>Trabajador:</strong> Nombre del trabajador al que se le está calculando la remuneración.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Tipo de Contrato:</strong> Tipo de contrato que afecta el cálculo de la remuneración. Ej.: "Indefinido", "Plazo Fijo", "Por Obra", "Part-Time".
                                            </li>
                                            <li className="mb-2">
                                                <strong>Jornada:</strong> Indica si la jornada es completa, parcial u otro tipo, lo cual afecta el cálculo de horas trabajadas y cotizaciones.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Sueldo Base:</strong> Monto fijo mensual estipulado en el contrato como base de cálculo.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Sueldo Bruto:</strong> Sueldo base más bonificaciones, tanto imponibles como no imponibles.
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <strong>Renta Imponible:</strong> Sueldo base más bonos imponibles, base sobre la cual se calculan las cotizaciones legales.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Descuento Legal:</strong> Descuentos porcentuales aplicados sobre la renta imponible por AFP, salud y seguro de cesantía.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Sueldo Líquido:</strong> Monto final que el trabajador recibe tras aplicar descuentos legales e internos, y sumar asignaciones no imponibles.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Descuentos Internos:</strong> Descuentos específicos como faltas injustificadas, aplicados después de calcular la renta imponible.
                                            </li>
                                            <li className="mb-2">
                                                <strong>Total Bonos No Imponibles:</strong> Total de bonos no imponibles, sumados después del cálculo de la renta imponible.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Panel de filtros */}
                    {showFilters && (
                    <Card className="shadow-sm mb-3">
                        <FiltrosBusquedaHeader />
                        <Card.Body>
                        <div className="row g-3">
                            <div className="col-md-3">
                            <Form.Group>
                                <Form.Label className="fw-semibold">RUT:</Form.Label>
                                <Form.Control
                                type="text"
                                placeholder="Ej: 12.345.678-9"
                                value={searchQuery.rut || ''}
                                onChange={handleRutChange}
                                style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>
                            </div>
                            <div className="col-md-3">
                            <Form.Group>
                                <Form.Label className="fw-semibold">Tipo de Contrato:</Form.Label>
                                <Form.Select
                                value={searchQuery.tipoContrato || ''}
                                onChange={(e) => setSearchQuery({ ...searchQuery, tipoContrato: e.target.value })}
                                style={{ borderRadius: '8px' }}
                                >
                                <option value="">Todos los tipos</option>
                                <option value="Indefinido">Indefinido</option>
                                <option value="Plazo Fijo">Plazo Fijo</option>
                                <option value="Por Obra">Por Obra</option>
                                <option value="Part-Time">Part-Time</option>
                                </Form.Select>
                            </Form.Group>
                            </div>
                            <div className="col-md-3">
                            <Form.Group>
                                <Form.Label className="fw-semibold">Sueldo base desde:</Form.Label>
                                <Form.Control
                                type="text"
                                inputMode="numeric"
                                placeholder="Monto mínimo"
                                value={searchQuery.sueldoBaseDesde !== undefined && searchQuery.sueldoBaseDesde !== null ? formatMiles(searchQuery.sueldoBaseDesde) : ''}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    if (raw === '') {
                                    setSearchQuery({ ...searchQuery, sueldoBaseDesde: undefined });
                                    } else {
                                    setSearchQuery({ ...searchQuery, sueldoBaseDesde: Number(raw) });
                                    }
                                }}
                                maxLength={12}
                                style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>
                            </div>
                            <div className="col-md-3">
                            <Form.Group>
                                <Form.Label className="fw-semibold">Sueldo base hasta:</Form.Label>
                                <Form.Control
                                type="text"
                                inputMode="numeric"
                                placeholder="Monto máximo"
                                value={searchQuery.sueldoBaseHasta !== undefined && searchQuery.sueldoBaseHasta !== null ? formatMiles(searchQuery.sueldoBaseHasta) : ''}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    if (raw === '') {
                                    setSearchQuery({ ...searchQuery, sueldoBaseHasta: undefined });
                                    } else {
                                    setSearchQuery({ ...searchQuery, sueldoBaseHasta: Number(raw) });
                                    }
                                }}
                                maxLength={12}
                                style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>
                            </div>
                            <div className="col-md-6 d-flex align-items-end">
                            <div className="d-flex gap-2 mb-3">
                                <Button variant="primary" onClick={handleSearch} style={{ borderRadius: '20px', fontWeight: '500' }}>
                                <i className="bi bi-search me-2"></i>
                                Buscar
                                </Button>
                                <Button variant="outline-secondary" onClick={handleReset} style={{ borderRadius: '20px', fontWeight: '500' }}>
                                <i className="bi bi-x-circle me-2"></i>
                                Limpiar
                                </Button>
                            </div>
                            </div>
                        </div>
                        </Card.Body>
                    </Card>
                    )}
                    {/* Contenido principal */}
                              <Card className="shadow-sm">
                                <Card.Body>
                                  {/* Mostrar errores */}
                                  {(localError || fichaError) && (
                                    <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
                                      <i className="bi bi-exclamation-triangle me-2"></i>
                                      {localError || fichaError}
                                    </Alert>
                                  )}
                    
                                  {/* Contenido de la tabla */}
                                  {isLoading ? (
                                    <div className="text-center py-5">
                                      <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                      </div>
                                      <p className="mt-2 text-muted">Cargando remuneraciones...</p>
                                    </div>
                                  ) : fichas.length === 0 ? (
                                    <div className="text-center py-5">
                                      <i className="bi bi-clipboard-x display-1 text-muted"></i>
                                      <h5 className="mt-3">
                                        {Object.keys(searchQuery).length === 1 && searchQuery.estado === EstadoLaboral.ACTIVO ? 
                                          'No hay fichas de empresa en el sistema' : 
                                          'No hay resultados que coincidan con tu búsqueda'}
                                      </h5>
                                      <p className="text-muted">
                                        {Object.keys(searchQuery).length === 1 && searchQuery.estado === EstadoLaboral.ACTIVO ? 
                                          'Las fichas de empresa se crean automáticamente al registrar un nuevo trabajador' : 
                                          'Intenta ajustar los filtros para obtener más resultados'}
                                      </p>
                                      {Object.keys(searchQuery).length > 1 || searchQuery.estado !== EstadoLaboral.ACTIVO ? (
                                        <Button variant="outline-primary" onClick={handleReset}>
                                          <i className="bi bi-arrow-clockwise me-2"></i>
                                          Mostrar Todas
                                        </Button>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <>
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">
                                          <i className="bi bi-list-ul me-2"></i>
                                          Remuneraciones ({fichas.length})
                                          <small className="text-muted ms-2">
                                            (Activos: {fichas.filter(f => f.estado === EstadoLaboral.ACTIVO).length} • 
                                            Licencias: {fichas.filter(f => f.estado === EstadoLaboral.LICENCIA).length} • 
                                            Permisos: {fichas.filter(f => f.estado === EstadoLaboral.PERMISO).length} • 
                                            Desvinculados: {fichas.filter(f => f.estado === EstadoLaboral.DESVINCULADO).length})
                                          </small>
                                        </h6>
                                      </div>
                                      <div className="table-responsive">
                                        <Table hover className="mb-0">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Trabajador</th>
                                            <th>Tipo Contrato</th>
                                            <th>Jornada</th>
                                            <th>Sueldo Base</th>
                                            <th>Sueldo Bruto</th>
                                            <th>Renta Imponible</th>
                                            <th>Descuento Legal</th>
                                            <th>Sueldo Líquido</th>
                                            <th>Descuentos Internos</th>
                                            <th>Total Bonos No Imponibles</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                            {fichas.map((ficha) => {
                                                const [
                                                rentaImponible,
                                                descuentoLegal,
                                                sueldoLiquido,
                                                descuentosInternos,
                                                totalBonosNoImponibles
                                                ] = calcularSueldoLiquido(ficha, null);
                                                const sueldoBruto = calculoSueldoBruto(ficha);

                                                return (
                                                <tr key={ficha.id}>
                                                    <td>
                                                    <div>
                                                        <strong>{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}</strong>
                                                        <br />
                                                        <small className="text-muted">{formatRUT(ficha.trabajador.rut)}</small>
                                                    </div>
                                                    </td>
                                                    <td>
                                                    <span className={getTipoContratoColor(ficha.tipoContrato)}>
                                                        {ficha.tipoContrato}
                                                    </span>
                                                    </td>
                                                    <td>
                                                    <span className={getFieldClass(ficha.jornadaLaboral || '-')}>
                                                        {ficha.jornadaLaboral || '-'}
                                                    </span>
                                                    </td>
                                                    <td>{formatSueldo(ficha.sueldoBase)}</td>
                                                    <td>{formatSueldo(sueldoBruto)}</td>
                                                    <td>{formatSueldo(rentaImponible)}</td>
                                                    <td>{formatSueldo(descuentoLegal)}</td>
                                                    <td>{formatSueldo(sueldoLiquido)}</td>
                                                    <td>{formatSueldo(descuentosInternos)}</td>
                                                    <td>{formatSueldo(totalBonosNoImponibles)}</td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>

                                      </Table>
                                      </div>
                                    </>
                                  )}
                                </Card.Body>
                              </Card>
                    
                </Col>
            </Row>
        </Container>
    );
}