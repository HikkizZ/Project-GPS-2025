import React, { useState } from 'react';
import { Container, Row, Col, Tab, Tabs, Card } from 'react-bootstrap';
import { FormularioSolicitudLicenciaPermiso } from '@/components/recursosHumanos/FormularioSolicitudLicenciaPermiso';
import { ListaGestionSolicitudes } from '@/components/recursosHumanos/ListaGestionSolicitudes';

export const GestionLicenciasPermisosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('gestion');

  // Función para cambiar a la pestaña de nueva solicitud
  const irANuevaSolicitud = () => {
    setActiveTab('nueva');
  };

  // Función para volver a la gestión después de crear una solicitud
  const volverAGestion = () => {
    setActiveTab('gestion');
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-shield-check fs-4 me-3"></i>
                <div>
                  <h3 className="mb-1">Gestión de Licencias y Permisos</h3>
                  <p className="mb-0 opacity-75">
                    Panel administrativo para aprobar, rechazar y gestionar todas las solicitudes del sistema
                  </p>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Pestañas principales */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'gestion')}
            className="mb-4"
            variant="pills"
          >
            {/* Pestaña: Gestión de Solicitudes */}
            <Tab 
              eventKey="gestion" 
              title={
                <span>
                  <i className="bi bi-clipboard-check me-2"></i>
                  Gestión de Solicitudes
                </span>
              }
            >
              <ListaGestionSolicitudes />
            </Tab>

            {/* Pestaña: Nueva Solicitud (para RRHH también puede crear) */}
            <Tab 
              eventKey="nueva" 
              title={
                <span>
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Solicitud
                </span>
              }
            >
              <FormularioSolicitudLicenciaPermiso onSuccess={volverAGestion} />
            </Tab>

            {/* Pestaña: Reportes (placeholder para futuro) */}
            <Tab 
              eventKey="reportes" 
              title={
                <span>
                  <i className="bi bi-graph-up me-2"></i>
                  Reportes
                </span>
              }
            >
              <Card className="shadow-sm">
                <Card.Body className="text-center py-5">
                  <i className="bi bi-graph-up fs-1 mb-3 text-info d-block"></i>
                  <Card.Title className="mb-3">Reportes y Estadísticas</Card.Title>
                  <Card.Text className="text-muted">
                    Próximamente: Reportes detallados de licencias y permisos, estadísticas por departamento,
                    trends mensuales, exportación de datos y análisis de patrones.
                  </Card.Text>
                  <Card.Text className="text-muted">
                    <strong>Funcionalidades planeadas:</strong>
                    <br />• Reportes por período y departamento
                    <br />• Exportación a Excel/PDF
                    <br />• Gráficos de tendencias
                    <br />• Alertas de licencias frecuentes
                  </Card.Text>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}; 