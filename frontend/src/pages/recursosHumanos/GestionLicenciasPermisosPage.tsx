import React from 'react';
import { Container, Card } from 'react-bootstrap';

const GestionLicenciasPermisosPage: React.FC = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Gestión de Licencias y Permisos</h2>
      
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <i className="bi bi-clipboard-check fs-1 mb-3 text-warning"></i>
          <Card.Title className="mb-3">Gestión de Licencias y Permisos</Card.Title>
          <Card.Text className="text-muted">
            Aquí podrás revisar, aprobar y rechazar todas las solicitudes de licencias y permisos de los trabajadores.
          </Card.Text>
          <Card.Text className="text-muted">
            <strong>Próximamente:</strong> Funcionalidad completa de gestión
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GestionLicenciasPermisosPage; 