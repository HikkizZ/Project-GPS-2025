import type React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
  Form,
  Spinner,
} from "react-bootstrap";
import { useFichaEmpresa } from "@/hooks/recursosHumanos/useFichaEmpresa";
import {
  type FichaEmpresa,
  type FichaEmpresaSearchParams,
  EstadoLaboral,
} from "@/types/recursosHumanos/fichaEmpresa.types";
import { useAuth } from "@/context";
import { useRut } from "@/hooks/useRut";

import "../../styles/pages/remuneraciones.css";

function calculoSueldoBruto(ficha: FichaEmpresa): number {
  const { sueldoBase, tipoContrato } = ficha;
  const bonos = ficha.asignacionesBonos.filter((bono) => bono.activo) || [];
  const SumaBonos = bonos.reduce(
    (total, asignacionBono) =>
      total + Number.parseInt(asignacionBono.bono.monto),
    0
  );

  if (typeof sueldoBase !== "number" || isNaN(sueldoBase) || sueldoBase < 0) {
    console.error("Sueldo base no válido.");
    return 0;
  }

  const tiposValidos = ["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time"];
  if (!tipoContrato || !tiposValidos.includes(tipoContrato)) {
    console.error("Tipo de contrato no válido.");
    return 0;
  }

  const bonosActivos =
    ficha.asignacionesBonos?.filter((bono) => bono.activo) || [];
  const sumaBonos = bonosActivos.reduce(
    (total, asignacionBono) =>
      total + Number.parseInt(asignacionBono.bono.monto),
    0
  );

  if (tipoContrato === "Honorarios") {
    return sueldoBase;
  }

  return sueldoBase + sumaBonos;
}

function calcularSueldoLiquido(
  ficha: FichaEmpresa,
  historialLaboral: any
): [number, number, number, number, number] {
  const { sueldoBase, tipoContrato, seguroCesantia } = ficha;
  let validacionSueldo = true,
    validacionTipoContrato = true;
  let sueldoLiquido = 0;
  let descuentoLegal = 0;
  const descuentosInternos = historialLaboral?.descuentosInternos || 0;
  let rentaImponible = 0;

  const bonos = ficha.asignacionesBonos.filter((bono) => bono.activo) || [];
  const bonosImponibles = bonos.filter((bono) => bono.bono.imponible);
  const bonosNoImponibles = bonos.filter((bono) => !bono.bono.imponible);
  const sueldoImponible =
    sueldoBase +
    bonosImponibles.reduce(
      (total, asignacionBono) =>
        total + (Number.parseFloat(asignacionBono.bono.monto) || 0),
      0
    );

  // Comprobar que el sueldo base es un número válido
  if (typeof sueldoBase !== "number" || isNaN(sueldoBase) || sueldoBase < 0) {
    validacionSueldo = false; // Marcar como inválido si no es un número o es negativo
    console.error(
      "Sueldo base no válido o no asignado un descuento específico"
    );
  }

  // Comprobar que el tipo de contrato es válido
  if (
    !tipoContrato ||
    !["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time"].includes(
      tipoContrato
    )
  ) {
    validacionTipoContrato = false; // Marcar como inválido si el tipo de contrato no es válido
    console.error("Tipo de contrato no válido");
  }

  switch (ficha.afp) {
    case "AFP Uno":
      descuentoLegal = sueldoImponible * 0.1049; // 10% obligatorio más 0,49% tipo
      break;
    case "AFP Modelo":
      descuentoLegal = sueldoImponible * 0.1058; // 
      break;
    case "AFP Planvital":
      descuentoLegal = sueldoImponible * 0.1116;
      break;
    case "AFP Habitat":
      descuentoLegal = sueldoImponible * 0.1127;
      break;
    case "AFP Capital":
      descuentoLegal = sueldoImponible * 0.1144;
      break;
    case "AFP Cuprum":
      descuentoLegal = sueldoImponible * 0.1144;
      break;
    case "AFP Provida":
      descuentoLegal = sueldoImponible * 0.1145;
      break;
  }

  descuentoLegal += sueldoImponible * 0.07; // 7% de salud

  // Calcular descuentos legales
  if (validacionSueldo && validacionTipoContrato) {
    switch (tipoContrato) {
      case "Indefinido":
        if (seguroCesantia === "Sí") {
          descuentoLegal += sueldoImponible * 0.006; // 0.6% de seguro de cesantía
        }
        break;
      case "Plazo Fijo":
        if (seguroCesantia === "Sí") {
          descuentoLegal += sueldoImponible * 0.03; // 3% de seguro de cesantía
        }
        break;
      case "Por Obra":
        if (seguroCesantia === "Sí") {
          descuentoLegal += sueldoImponible * 0.03; // 3% de seguro de cesantía
        }
        break;
      case "Part-Time":
        if (seguroCesantia === "Sí") {
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
  const totalBonosNoImponibles = bonosNoImponibles.reduce(
    (total, asignacionBono) =>
      total + (Number.parseInt(asignacionBono.bono.monto) || 0),
    0
  );
  sueldoLiquido = rentaImponible + totalBonosNoImponibles - descuentosInternos;

  return [
    rentaImponible,
    descuentoLegal,
    sueldoLiquido,
    descuentosInternos,
    totalBonosNoImponibles,
  ];
}

// Utilidad para formatear con puntos de miles
function formatMiles(value: string | number): string {
  const num = typeof value === "number" ? value : value.replace(/\D/g, "");
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
    clearError,
  } = useFichaEmpresa();

  const [showFilters, setShowFilters] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState<FichaEmpresaSearchParams>({
    estado: EstadoLaboral.ACTIVO,
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const { formatRUT } = useRut();
  const [showCharacteristics, setShowCharacteristics] = useState(false);

  // Definir roles y permisos
  const esSuperAdministrador = user?.role === "SuperAdministrador";
  const esAdminORecursosHumanos =
    user?.role === "Administrador" || user?.role === "RecursosHumanos";
  const puedeGestionarFichas = esSuperAdministrador || esAdminORecursosHumanos;

  useEffect(() => {
    if (isAuthLoading || !user) return;

    const isSuperAdmin = user.role === "SuperAdministrador";
    const isAdminOrRRHH =
      user.role === "Administrador" || user.role === "RecursosHumanos";

    if (isSuperAdmin || isAdminOrRRHH) {
      setSearchQuery((prev) => {
        if (prev.estado === EstadoLaboral.ACTIVO) return prev;
        return { estado: EstadoLaboral.ACTIVO };
      });
      searchFichas({ estado: EstadoLaboral.ACTIVO }).catch((err) => {
        console.error("Error al cargar fichas:", err);
      });
    }
  }, [user, isAuthLoading]);

  const getTipoContratoColor = (tipo: string) => {
    if (tipo === "Por Definir") {
      return "por-definir";
    }

    switch (tipo.toLowerCase()) {
      case "indefinido":
        return "text-success";
      case "plazo fijo":
        return "text-warning";
      case "por obra":
        return "text-info";
      case "part-time":
        return "text-secondary";
      default:
        return "text-muted";
    }
  };

  const getTipoContratoBadge = (tipo: string) => {
    if (tipo === "Por Definir") {
      return "secondary";
    }

    switch (tipo.toLowerCase()) {
      case "indefinido":
        return "success";
      case "plazo fijo":
        return "warning";
      case "por obra":
        return "info";
      case "part-time":
        return "secondary";
      default:
        return "light";
    }
  };

  // Función helper para campos "Por Definir"
  const getFieldClass = (value: string) => {
    return value === "Por Definir" ? "por-definir" : "";
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

  let [
    calcularRentaImponible,
    descuentoLegal,
    sueldoLiquido,
    descuentosInternos,
    totalBonosNoImponibles,
  ] = [0, 0, 0, 0, 0];
  if (fichas.length > 0) {
    calcularRentaImponible = calculoSueldoBruto(fichas[0]);
    [
      calcularRentaImponible,
      descuentoLegal,
      sueldoLiquido,
      descuentosInternos,
      totalBonosNoImponibles,
    ] = calcularSueldoLiquido(fichas[0], null);
  }

    return (
    <Container fluid className="remuneraciones-container">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-calculator fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">
                      Calculo de remuneraciones por trabajadores
                    </h3>
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
                    <i
                      className={`bi bi-funnel${
                        showFilters ? "-fill" : ""
                      } me-2`}
                    ></i>
                    {showFilters ? "Ocultar" : "Mostrar"} Filtros
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Información explicativa */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Alert
                variant="warning"
                className="border-0 mb-3"
                style={{ borderRadius: "12px" }}
              >
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle me-3 mt-1 text-warning"></i>
                  <div>
                    <strong>Importante:</strong>
                    <p className="mb-0 mt-1">
                      Revise la información calculada de AFP, previsión salud,
                      bonos, licencias, permisos, seguro de cesantía y más,
                      antes de realizar el pago de las remuneraciones de los
                      trabajadores.
                    </p>
                  </div>
                </div>
              </Alert>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">
                  Características de la tabla de remuneraciones
                </h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowCharacteristics(!showCharacteristics)}
                  style={{ borderRadius: "20px" }}
                >
                  <i
                    className={`bi bi-chevron-${
                      showCharacteristics ? "up" : "down"
                    } me-1`}
                  ></i>
                  {showCharacteristics ? "Ocultar" : "Mostrar"} detalles
                </Button>
              </div>

              {showCharacteristics && (
                <div className="mt-3">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="info-list">
                        <div className="info-item">
                          <strong>Trabajador:</strong> Nombre del trabajador al
                          que se le está calculando la remuneración.
                        </div>
                        <div className="info-item">
                          <strong>Tipo de Contrato:</strong> Tipo de contrato
                          que afecta el cálculo de la remuneración.
                        </div>
                        <div className="info-item">
                          <strong>Jornada:</strong> Indica si la jornada es
                          completa, parcial u otro tipo.
                        </div>
                        <div className="info-item">
                          <strong>Sueldo Base:</strong> Monto fijo mensual
                          estipulado en el contrato.
                        </div>
                        <div className="info-item">
                          <strong>Sueldo Bruto:</strong> Sueldo base más
                          bonificaciones.
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="info-list">
                        <div className="info-item">
                          <strong>Renta Imponible:</strong> Base sobre la cual
                          se calculan las cotizaciones legales.
                        </div>
                        <div className="info-item">
                          <strong>Descuento Legal:</strong> El descuento por <strong>AFP</strong> incluye un <strong>10% obligatorio</strong> del sueldo imponible para la pensión del trabajador, más una <strong>comisión de administración</strong> que varía según la AFP: <strong>Modelo (0,58%)</strong>, <strong>UNO (0,69%)</strong>, <strong>Habitat (1,27%)</strong>, <strong>Capital (1,44%)</strong>, y <strong>Provida (1,45%)</strong>. Este total se descuenta mensualmente del trabajador. Además, se aplican descuentos por <strong>salud</strong> (7%) y <strong>seguro de cesantía</strong> (0,3%-0,6%).
                        </div>
                        <div className="info-item">
                          <strong>Sueldo Líquido:</strong> Monto final que
                          recibe el trabajador.
                        </div>
                        <div className="info-item">
                          <strong>Descuentos Internos:</strong> Descuentos
                          específicos como faltas injustificadas.
                        </div>
                        <div className="info-item">
                          <strong>Bonos No Imponibles:</strong> Total de bonos
                          no imponibles.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="filters-card mb-4">
              <Card.Header className="filters-header">
                <h6 className="mb-0">
                  <i className="bi bi-funnel me-2"></i>
                  Filtros de Búsqueda
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="row g-4">
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="form-label">RUT:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: 12.345.678-9"
                        value={searchQuery.rut || ""}
                        onChange={handleRutChange}
                        className="form-input"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="form-label">
                        Tipo de Contrato:
                      </Form.Label>
                      <Form.Select
                        value={searchQuery.tipoContrato || ""}
                        onChange={(e) =>
                          setSearchQuery({
                            ...searchQuery,
                            tipoContrato: e.target.value,
                          })
                        }
                        className="form-input"
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
                      <Form.Label className="form-label">
                        Sueldo base desde:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        placeholder="Monto mínimo"
                        value={
                          searchQuery.sueldoBaseDesde !== undefined &&
                          searchQuery.sueldoBaseDesde !== null
                            ? formatMiles(searchQuery.sueldoBaseDesde)
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          if (raw === "") {
                            setSearchQuery({
                              ...searchQuery,
                              sueldoBaseDesde: undefined,
                            });
                          } else {
                            setSearchQuery({
                              ...searchQuery,
                              sueldoBaseDesde: Number(raw),
                            });
                          }
                        }}
                        maxLength={12}
                        className="form-input"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="form-label">
                        Sueldo base hasta:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        placeholder="Monto máximo"
                        value={
                          searchQuery.sueldoBaseHasta !== undefined &&
                          searchQuery.sueldoBaseHasta !== null
                            ? formatMiles(searchQuery.sueldoBaseHasta)
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          if (raw === "") {
                            setSearchQuery({
                              ...searchQuery,
                              sueldoBaseHasta: undefined,
                            });
                          } else {
                            setSearchQuery({
                              ...searchQuery,
                              sueldoBaseHasta: Number(raw),
                            });
                          }
                        }}
                        maxLength={12}
                        className="form-input"
                      />
                    </Form.Group>
                  </div>
                </div>
                <div className="filter-actions mt-4">
                  <Button
                    variant="primary"
                    onClick={handleSearch}
                    className="action-btn primary-btn me-3"
                  >
                    <i className="bi bi-search me-2"></i>
                    Buscar
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleReset}
                    className="action-btn secondary-btn"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Limpiar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Contenido principal */}
          <Card className="main-content-card">
            <Card.Body>
              {/* Mostrar errores */}
              {(localError || fichaError) && (
                <Alert variant="danger" className="error-alert mb-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3"></i>
                    <span>{localError || fichaError}</span>
                  </div>
                </Alert>
              )}

              {/* Contenido de la tabla */}
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner">
                    <Spinner animation="border" variant="primary" />
                  </div>
                  <h5 className="loading-title">Cargando remuneraciones...</h5>
                  <p className="loading-text">
                    Por favor espere mientras procesamos la información
                  </p>
                </div>
              ) : fichas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-clipboard-x"></i>
                  </div>
                  <h4 className="empty-title">
                    {Object.keys(searchQuery).length === 1 &&
                    searchQuery.estado === EstadoLaboral.ACTIVO
                      ? "No hay fichas de empresa en el sistema"
                      : "No hay resultados que coincidan con tu búsqueda"}
                  </h4>
                  <p className="empty-text">
                    {Object.keys(searchQuery).length === 1 &&
                    searchQuery.estado === EstadoLaboral.ACTIVO
                      ? "Las fichas de empresa se crean automáticamente al registrar un nuevo trabajador"
                      : "Intenta ajustar los filtros para obtener más resultados"}
                  </p>
                  {Object.keys(searchQuery).length > 1 ||
                  searchQuery.estado !== EstadoLaboral.ACTIVO ? (
                    <Button
                      variant="primary"
                      onClick={handleReset}
                      className="action-btn primary-btn"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Mostrar Todas
                    </Button>
                  ) : null}
                </div>
              ) : fichas.some((f) => f.tipoContrato === "Por Definir") ? (
                <div className="empty-state">
                  <div className="empty-icon text-warning">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                  </div>
                  <h4 className="empty-title">
                    Hay fichas con tipo de contrato "Por Definir"
                  </h4>
                  <p className="empty-text">
                    Para calcular correctamente las remuneraciones, primero
                    debes definir el tipo de contrato en cada ficha
                    correspondiente.
                  </p>
                  <a
                    href="/fichas-empresa"
                    className="btn btn-outline-primary mt-3"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Ir a gestión de fichas
                  </a>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      Remuneraciones ({fichas.length})
                      <small className="text-muted ms-2">
                        (Activos:{" "}
                        {
                          fichas.filter(
                            (f) => f.estado === EstadoLaboral.ACTIVO
                          ).length
                        }{" "}
                        • Licencias:{" "}
                        {
                          fichas.filter(
                            (f) => f.estado === EstadoLaboral.LICENCIA
                          ).length
                        }{" "}
                        • Permisos:{" "}
                        {
                          fichas.filter(
                            (f) => f.estado === EstadoLaboral.PERMISO
                          ).length
                        }{" "}
                        • Desvinculados:{" "}
                        {
                          fichas.filter(
                            (f) => f.estado === EstadoLaboral.DESVINCULADO
                          ).length
                        }
                        )
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
                            totalBonosNoImponibles,
                          ] = calcularSueldoLiquido(ficha, null);
                          const sueldoBruto = calculoSueldoBruto(ficha);

                          return (
                            <tr key={ficha.id}>
                              <td>
                                <div>
                                  <strong>
                                    {ficha.trabajador.nombres}{" "}
                                    {ficha.trabajador.apellidoPaterno}{" "}
                                    {ficha.trabajador.apellidoMaterno}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    {formatRUT(ficha.trabajador.rut)}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={getTipoContratoColor(
                                    ficha.tipoContrato
                                  )}
                                >
                                  {ficha.tipoContrato}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={getFieldClass(
                                    ficha.jornadaLaboral || "-"
                                  )}
                                >
                                  {ficha.jornadaLaboral || "-"}
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
};
