import React, { useState } from 'react';
import { Container, Row, Col, Tab, Tabs, Card } from 'react-bootstrap';
import { FormularioSolicitudLicenciaPermiso } from '@/components/recursosHumanos/FormularioSolicitudLicenciaPermiso';
import { ListaSolicitudesPersonales } from '@/components/recursosHumanos/ListaSolicitudesPersonales';
import { Toast, useToast } from '@/components/common/Toast';

export const MisLicenciasPermisosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('lista');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { toasts, removeToast, showSuccess } = useToast();

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

  // Nueva función: manejar éxito de creación de solicitud
  const handleSolicitudCreada = () => {
    showSuccess('¡Solicitud creada!', 'Tu solicitud ha sido enviada exitosamente y será revisada por Recursos Humanos.');
    volverAListaYActualizar();
  };

  return (
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
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
              <FormularioSolicitudLicenciaPermiso onSuccess={handleSolicitudCreada} />
            </Tab>
          </Tabs>
          {/* Sistema de notificaciones global para la página */}
          <Toast toasts={toasts} removeToast={removeToast} />
        </Col>
      </Row>
    </Container>
  );
}; 