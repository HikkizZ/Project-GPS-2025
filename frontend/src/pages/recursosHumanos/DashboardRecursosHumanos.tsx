import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DashboardRecursosHumanos: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="mb-2">
          <i className="bi bi-people-fill me-2 text-primary"></i>
          Recursos Humanos
        </h2>
        <p className="text-muted">Gestión de personal y recursos humanos</p>
      </div>
      <Row className="justify-content-center">
        <Col md={4} className="mb-4">
          <Card 
            className="h-100 shadow-sm hover-card" 
            style={{ 
              cursor: 'pointer', 
              borderTop: '4px solid #2563eb',
              transition: 'transform 0.2s ease-in-out'
            }} 
            onClick={() => handleCardClick('/trabajadores')}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
              <i className="bi bi-people-fill fs-1 mb-3 text-primary"></i>
              <Card.Title className="h5 mb-2">Trabajadores</Card.Title>
              <Card.Text className="text-muted small">Gestiona la información de los trabajadores</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className="h-100 shadow-sm hover-card" 
            style={{ 
              cursor: 'pointer', 
              borderTop: '4px solid #059669',
              transition: 'transform 0.2s ease-in-out'
            }} 
            onClick={() => handleCardClick('/fichas-empresa')}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
              <i className="bi bi-file-earmark-text-fill fs-1 mb-3 text-success"></i>
              <Card.Title className="h5 mb-2">Fichas de Empresa</Card.Title>
              <Card.Text className="text-muted small">Administra las fichas de empresa</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className="h-100 shadow-sm hover-card" 
            style={{ 
              cursor: 'pointer', 
              borderTop: '4px solid #8b5cf6',
              transition: 'transform 0.2s ease-in-out'
            }} 
            onClick={() => handleCardClick('/usuarios')}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
              <i className="bi bi-people fs-1 mb-3" style={{ color: '#8b5cf6' }}></i>
              <Card.Title className="h5 mb-2">Gestión de Usuarios</Card.Title>
              <Card.Text className="text-muted small">Administra los usuarios del sistema</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardRecursosHumanos; 