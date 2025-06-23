import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { UserRole } from '../types/auth.types';

const GestionPersonalPage: React.FC = () => {
  const { user } = useAuth();

  // Roles que tienen acceso completo a todas las funcionalidades
  const rolesPrivilegiados: UserRole[] = ['SuperAdministrador', 'Administrador', 'RecursosHumanos'];
  
  // Verificar si el usuario tiene permisos completos
  const tienePermisosCompletos = user && rolesPrivilegiados.includes(user.role as UserRole);

  return (
    <div className="gestion-personal-page">
      <div className="container py-4">
        <h2 className="mb-4">Gestión del Personal</h2>
        <Row className="g-4">
          {/* Tarjeta de Trabajadores - Solo para roles privilegiados */}
          {tienePermisosCompletos && (
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
          )}

          {/* Tarjeta de Fichas de Empresa - Visible para todos los usuarios */}
          <Col md={tienePermisosCompletos ? 4 : 12}>
            <Link to="/fichas-empresa" style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm dashboard-card">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                  <i className="bi bi-file-earmark-text fs-1 mb-3 text-success"></i>
                                      <Card.Title>
                      {tienePermisosCompletos 
                        ? "Fichas de Empresa" 
                        : "Mi Ficha de Empresa"
                      }
                    </Card.Title>
                    {tienePermisosCompletos && (
                      <Card.Text>Administra las fichas de empresa</Card.Text>
                    )}
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Tarjeta de Gestión de Usuarios - Solo para roles privilegiados */}
          {tienePermisosCompletos && (
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
          )}
        </Row>


      </div>
    </div>
  );
};

export default GestionPersonalPage; 