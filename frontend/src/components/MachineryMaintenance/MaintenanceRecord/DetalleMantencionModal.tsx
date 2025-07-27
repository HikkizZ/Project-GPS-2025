import React from "react";
import { Modal, Button, Row, Col, Badge, Alert } from "react-bootstrap";
import { MaintenanceRecord } from "@/types/machinaryMaintenance/maintenanceRecord.types";

interface Props {
  show: boolean;
  onHide: () => void;
  record: MaintenanceRecord | null;
}

const DetalleMantencionModal: React.FC<Props> = ({ show, onHide, record }) => {
  if (!record) return null;

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("es-CL");
    } catch {
      return "-";
    }
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
        return estado;
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
        {nombre} ({cantidad})
      </li>
    );
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>
          <i className="bi bi-tools me-2" />
          Detalles de Mantención - {record.maquinaria.patente}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Sección: Información Básica */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-info-circle me-2"></i>
            Información Básica
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <label className="fw-bold">Maquinaria:</label>
              <div>{record.maquinaria.grupo.replace(/_/g, " ")} - {record.maquinaria.modelo}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Chasis:</label>
              <div className="font-monospace">{record.maquinaria.numeroChasis}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Tipo de Mantención:</label>
              <div>{record.razonMantencion}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Mecánico:</label>
              <div>
                {record.mecanicoAsignado?.trabajador
                  ? `${record.mecanicoAsignado.trabajador.nombres} ${record.mecanicoAsignado.trabajador.apellidoPaterno} ${record.mecanicoAsignado.trabajador.apellidoMaterno}`
                  : record.mecanicoAsignado?.rut ?? "No asignado"}
              </div>
            </Col>
          </Row>
        </div>

        {/* Sección: Fechas */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-calendar-event me-2"></i>
            Fechas
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <label className="fw-bold">Fecha Entrada:</label>
              <div>{formatDate(record.fechaEntrada)}</div>
            </Col>
            <Col md={6}>
              <label className="fw-bold">Fecha Salida:</label>
              <div>{formatDate(record.fechaSalida)}</div>
            </Col>
          </Row>
        </div>

        {/* Sección: Descripciones */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-journal-text me-2"></i>
            Descripciones
          </h5>
          <Row className="g-3">
            <Col md={12}>
              <label className="fw-bold">Descripción Entrada:</label>
              <div className="bg-light p-2 rounded">{record.descripcionEntrada}</div>
            </Col>
            <Col md={12}>
              <label className="fw-bold">Descripción Salida:</label>
              <div className="bg-light p-2 rounded">{record.descripcionSalida || "No disponible"}</div>
            </Col>
          </Row>
        </div>

        {/* Sección: Repuestos Usados */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-nut me-2"></i>
            Repuestos Utilizados
          </h5>
          {repuestos.length > 0 ? (
            <ul className="mb-0">{repuestos}</ul>
          ) : (
            <div className="text-muted">No se han registrado repuestos.</div>
          )}
        </div>

        {/* Sección: Estado */}
        <div className="mb-4">
          <h5>
            <i className="bi bi-clipboard-check me-2"></i>
            Estado Actual
          </h5>
          <Badge bg={getEstadoBadgeColor(record.estado)} className="fs-6 text-uppercase">
            {getEstadoTexto(record.estado)}
          </Badge>
        </div>
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

export default DetalleMantencionModal;
