import React from 'react';
import { Container, Card } from 'react-bootstrap';

const MisLicenciasPermisosPage: React.FC = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Mis Licencias y Permisos</h2>
      
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <i className="bi bi-calendar-check fs-1 mb-3 text-info"></i>
          <Card.Title className="mb-3">Mis Licencias y Permisos</Card.Title>
          <Card.Text className="text-muted">
            Aquí podrás crear nuevas solicitudes de licencias médicas y permisos administrativos, 
            así como consultar el estado de tus solicitudes existentes.
          </Card.Text>
          <Card.Text className="text-muted">
            <strong>Próximamente:</strong> Formulario de solicitud y listado de solicitudes
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MisLicenciasPermisosPage; 