import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { ListaGestionSolicitudes } from '@/components/recursosHumanos/ListaGestionSolicitudes';

export const GestionLicenciasPermisosPage: React.FC = () => {

  return (
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
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

          {/* Contenido directo - solo gestión */}
          <ListaGestionSolicitudes />
        </Col>
      </Row>
    </Container>
  );
}; 