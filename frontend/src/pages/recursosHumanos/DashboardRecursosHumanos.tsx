import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const DashboardRecursosHumanos: React.FC = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Recursos Humanos</h2>
      <Row className="g-4">
        <Col md={6}>
          <Link to="/gestion-personal" style={{ textDecoration: 'none' }}>
            <Card className="h-100 shadow-sm dashboard-card">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                <i className="bi bi-person-badge fs-1 mb-3 text-primary"></i>
                <Card.Title>Gestión del Personal</Card.Title>
                <Card.Text>Administra trabajadores, fichas y usuarios</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm dashboard-card bg-light text-muted" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <i className="bi bi-cash-stack fs-1 mb-3"></i>
              <Card.Title>Gestión de Sueldos</Card.Title>
              <Card.Text>Próximamente</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardRecursosHumanos; 