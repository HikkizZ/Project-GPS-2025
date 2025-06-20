import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const GestionPersonalPage: React.FC = () => {
  return (
    <div className="gestion-personal-page">
      <div className="container py-4">
        <h2 className="mb-4">Gestión del Personal</h2>
        <Row className="g-4">
          <Col md={4}>
            <Link to="/trabajadores" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm dashboard-card">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                  <i className="bi bi-people-fill fs-1 mb-3 text-primary"></i>
                  <Card.Title>Trabajadores</Card.Title>
                  <Card.Text>Gestiona la información de los trabajadores</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col md={4}>
            <Link to="/fichas-empresa" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm dashboard-card">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                  <i className="bi bi-file-earmark-text fs-1 mb-3 text-success"></i>
                  <Card.Title>Fichas de Empresa</Card.Title>
                  <Card.Text>Administra las fichas de empresa</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col md={4}>
            <Link to="/usuarios" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm dashboard-card">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                  <i className="bi bi-person-lines-fill fs-1 mb-3 text-info"></i>
                  <Card.Title>Gestión de Usuarios</Card.Title>
                  <Card.Text>Administra los usuarios del sistema</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default GestionPersonalPage; 