import React, { useState } from 'react';
import { Container, Row, Col, Tab, Tabs, Card } from 'react-bootstrap';
import { FormularioSolicitudLicenciaPermiso } from '@/components/recursosHumanos/FormularioSolicitudLicenciaPermiso';
import { ListaSolicitudesPersonales } from '@/components/recursosHumanos/ListaSolicitudesPersonales';

export const MisLicenciasPermisosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('lista');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Función para cambiar a la pestaña de nueva solicitud
  const irANuevaSolicitud = () => {
    setActiveTab('nueva');
  };

  // Función para volver a la lista después de crear una solicitud y forzar recarga
  const volverAListaYActualizar = () => {
    setActiveTab('lista');
    // Forzar recarga del componente ListaSolicitudesPersonales
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar-heart fs-4 me-3"></i>
                <div>
                  <h3 className="mb-1">Mis Licencias y Permisos</h3>
                  <p className="mb-0 opacity-75">
                    Gestiona tus solicitudes de licencias médicas y permisos laborales
                  </p>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Pestañas principales */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'lista')}
            className="mb-4"
            variant="pills"
          >
            {/* Pestaña: Mis Solicitudes */}
            <Tab 
              eventKey="lista" 
              title={
                <span>
                  <i className="bi bi-list-ul me-2"></i>
                  Mis Solicitudes
                </span>
              }
            >
              <ListaSolicitudesPersonales 
                key={refreshKey} 
                onNuevaSolicitud={irANuevaSolicitud} 
              />
            </Tab>

            {/* Pestaña: Nueva Solicitud */}
            <Tab 
              eventKey="nueva" 
              title={
                <span>
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Solicitud
                </span>
              }
            >
              <FormularioSolicitudLicenciaPermiso onSuccess={volverAListaYActualizar} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}; 