import React from "react";
import { useMaintenanceRecords } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords";
import CompletedMaintenanceList from "@/components/MachineryMaintenance/MaintenanceRecord/ListCompleteMaintenance";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap"

const MantencionesCompletadasPage: React.FC = () => {
  const { records, loading, error } = useMaintenanceRecords();

  const mantencionesCompletadas = records.filter((record) => record.estado === "completada");

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
                <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <i className="bi bi-check2-circle fs-4 me-3"></i>
                    <div>
                    <h3 className="mb-1">Mantenciones Completadas</h3>
                    <p className="mb-0 opacity-75">
                        Revisa el historial de mantenciones finalizadas
                    </p>
                    </div>
                </div>
                </div>
            </Card.Header>
            </Card>

          {/* Contenido principal */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Lista de Mantenciones Completadas
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando mantenciones completadas...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              ) : (
                <CompletedMaintenanceList records={mantencionesCompletadas} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MantencionesCompletadasPage;
