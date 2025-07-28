import React from "react";
import { Modal, Button, Row, Col, Badge, Card } from "react-bootstrap";
import { MaintenanceRecord } from "@/types/machinaryMaintenance/maintenanceRecord.types";
import { usePdfExport } from "@/hooks/usePdfExport";

interface Props {
  show: boolean;
  onHide: () => void;
  record: MaintenanceRecord | null;
}

const DetalleMantencionModal: React.FC<Props> = ({ show, onHide, record }) => {
  if (!record) return null;

  const { exportToPdf, isExporting } = usePdfExport();

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("es-CL");
    } catch {
      return "-";
    }
  };

  const toTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .split(/[\s_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "en_proceso":
        return "En Proceso";
      case "completada":
        return "Completada";
      case "irrecuperable":
        return "Irrecuperable";
      default:
        return toTitleCase(estado);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "secondary";
      case "en_proceso":
        return "warning";
      case "completada":
        return "success";
      case "irrecuperable":
        return "danger";
      default:
        return "dark";
    }
  };

  const repuestos = (record.repuestosUtilizados as any[]).map((r, idx) => {
    const nombre = "repuesto" in r ? r.repuesto.name : r.nombre;
    const cantidad = "cantidadUtilizada" in r ? r.cantidadUtilizada : r.cantidad;
    return (
      <li key={idx}>
        {toTitleCase(nombre)} ({cantidad})
      </li>
    );
  });

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="detalle-mantencion-modal">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-tools me-2" />
          Detalles de Mantención - {toTitleCase(record.maquinaria.grupo)}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <h1 className="text-center mb-4 fw-bold">Reporte de Mantención</h1>
        <div id="detalle-mantencion-content">
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0 text-uppercase fw-bold">
                <i className="bi bi-info-circle me-2"></i>
                Información General
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <strong>Maquinaria:</strong>
                  <div>
                    {toTitleCase(record.maquinaria.grupo.replace(/_/g, " "))} - {toTitleCase(record.maquinaria.modelo)}
                  </div>
                </Col>
                <Col md={6}>
                  <strong>Chasis:</strong>
                  <div className="font-monospace">{record.maquinaria.numeroChasis}</div>
                </Col>
                <Col md={6}>
                  <strong>Tipo de Mantención:</strong>
                  <div>{toTitleCase(record.razonMantencion)}</div>
                </Col>
                <Col md={6}>
                  <strong>Mecánico:</strong>
                  <div>
                    {record.mecanicoAsignado?.trabajador
                      ? `${toTitleCase(record.mecanicoAsignado.trabajador.nombres)} ${toTitleCase(record.mecanicoAsignado.trabajador.apellidoPaterno)} ${toTitleCase(record.mecanicoAsignado.trabajador.apellidoMaterno)}`
                      : record.mecanicoAsignado?.rut ?? "No asignado"}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0 text-uppercase fw-bold">
                <i className="bi bi-calendar-event me-2"></i>
                Fechas
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <strong>Fecha Entrada:</strong>
                  <div>{formatDate(record.fechaEntrada)}</div>
                </Col>
                <Col md={6}>
                  <strong>Fecha Salida:</strong>
                  <div>{formatDate(record.fechaSalida)}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0 text-uppercase fw-bold">
                <i className="bi bi-journal-text me-2"></i>
                Descripciones
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={12}>
                  <strong>Descripción Entrada:</strong>
                  <div className="bg-light p-2 rounded border">{record.descripcionEntrada}</div>
                </Col>
                <Col md={12}>
                  <strong>Descripción Salida:</strong>
                  <div className="bg-light p-2 rounded border">{record.descripcionSalida || "No disponible"}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0 text-uppercase fw-bold">
                <i className="bi bi-nut me-2"></i>
                Repuestos Utilizados
              </h6>
            </Card.Header>
            <Card.Body>
              {repuestos.length > 0 ? (
                <ul className="mb-0">{repuestos}</ul>
              ) : (
                <div className="text-muted">No se han registrado repuestos.</div>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0 text-uppercase fw-bold">
                <i className="bi bi-clipboard-check me-2"></i>
                Estado Actual
              </h6>
            </Card.Header>
            <Card.Body>
              <Badge bg={getEstadoBadgeColor(record.estado)} className="fs-6 text-uppercase">
                {getEstadoTexto(record.estado)}
              </Badge>
            </Card.Body>
          </Card>
        </div>
      </Modal.Body>

      <Modal.Footer>
        {(() => {
          const formatDateForFile = (dateString: string | Date | null | undefined) => {
            if (!dateString) return "sin-fecha";
            const date = new Date(dateString);
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
          };

          const fileName = `Reporte de Mantención - ${toTitleCase(record.maquinaria.grupo)} - ${formatDateForFile(record.fechaSalida)}.pdf`;

          return (
            <>
              <Button
                variant="danger"
                onClick={() => exportToPdf("detalle-mantencion-content", fileName)}
                disabled={isExporting}
              >
                <i className="bi bi-file-earmark-pdf me-2" />
                {isExporting ? "Generando..." : "Exportar PDF"}
              </Button>
              <Button variant="danger" onClick={onHide}>
                <i className="bi bi-x-circle me-2"></i>
                Cerrar
              </Button>
            </>
          );
        })()}
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleMantencionModal;
