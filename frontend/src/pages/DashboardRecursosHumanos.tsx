import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DashboardRecursosHumanos: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Recursos Humanos</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-primary" style={{ cursor: 'pointer', borderTop: '4px solid #2563eb' }} onClick={() => handleCardClick('/trabajadores')}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <i className="bi bi-people-fill fs-1 mb-3 text-primary"></i>
              <Card.Title>Trabajadores</Card.Title>
              <Card.Text>Gestiona la información de los trabajadores</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-success" style={{ cursor: 'pointer', borderTop: '4px solid #059669' }} onClick={() => handleCardClick('/fichas-empresa')}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <i className="bi bi-file-earmark-text-fill fs-1 mb-3 text-success"></i>
              <Card.Title>Fichas de Empresa</Card.Title>
              <Card.Text>Administra las fichas de empresa</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-info" style={{ cursor: 'pointer', borderTop: '4px solid #8b5cf6' }} onClick={() => handleCardClick('/usuarios')}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <i className="bi bi-person-gear-fill fs-1 mb-3 text-info"></i>
              <Card.Title>Gestión de Usuarios</Card.Title>
              <Card.Text>Administra los usuarios del sistema</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardRecursosHumanos; 