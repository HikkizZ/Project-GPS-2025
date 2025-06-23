import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { UserRole } from '../../types/auth.types';

const DashboardRecursosHumanos: React.FC = () => {
  const { user } = useAuth();

  // Roles que tienen acceso completo a todas las funcionalidades
  const rolesPrivilegiados: UserRole[] = ['SuperAdministrador', 'Administrador', 'RecursosHumanos'];
  
  // Verificar si el usuario tiene permisos completos
  const tienePermisosCompletos = user && rolesPrivilegiados.includes(user.role as UserRole);
  
  // Super Administrador no debe poder solicitar licencias (es un usuario ficticio)
  const puedesolicitarLicencias = user && user.role !== 'SuperAdministrador';

  return (
    <div className="dashboard-rh-page">
      <div className="container py-4">
        <h2 className="mb-4">Recursos Humanos</h2>
        <Row className="g-4">
          {/* TARJETAS PARA ROLES PRIVILEGIADOS */}
          {tienePermisosCompletos && (
            <>
              {/* Tarjeta de Gestión del Personal */}
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

              {/* Tarjeta de Gestión de Sueldos */}
              <Col md={6}>
                <Card className="h-100 shadow-sm dashboard-card bg-light text-muted" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                    <i className="bi bi-cash-stack fs-1 mb-3"></i>
                    <Card.Title>Gestión de Sueldos</Card.Title>
                    <Card.Text>Próximamente</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              {/* Tarjeta de Gestión de Licencias y Permisos - NUEVA */}
              <Col md={6}>
                <Link to="/gestion-licencias-permisos" style={{ textDecoration: 'none' }}>
                  <Card className="h-100 shadow-sm dashboard-card">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                      <i className="bi bi-clipboard-check fs-1 mb-3 text-warning"></i>
                      <Card.Title>Gestión de Licencias y Permisos</Card.Title>
                      <Card.Text>Revisa y gestiona solicitudes de todos los trabajadores</Card.Text>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

              {/* Tarjeta de Mis Licencias y Permisos - NUEVA (solo si puede solicitar licencias) */}
              {puedesolicitarLicencias && (
                <Col md={6}>
                  <Link to="/mis-licencias-permisos" style={{ textDecoration: 'none' }}>
                    <Card className="h-100 shadow-sm dashboard-card">
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                        <i className="bi bi-calendar-check fs-1 mb-3 text-info"></i>
                        <Card.Title>Mis Licencias y Permisos</Card.Title>
                        <Card.Text>Crea y gestiona tus propias solicitudes</Card.Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              )}
            </>
          )}

          {/* TARJETAS PARA USUARIOS REGULARES */}
          {!tienePermisosCompletos && (
            <>
              {/* Tarjeta de Mi Ficha de Empresa */}
              <Col md={6}>
                <Link to="/fichas-empresa" style={{ textDecoration: 'none' }}>
                  <Card className="h-100 shadow-sm dashboard-card">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                      <i className="bi bi-file-earmark-text fs-1 mb-3 text-success"></i>
                      <Card.Title>Mi Ficha de Empresa</Card.Title>
                      <Card.Text>Consulta tu información laboral</Card.Text>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

              {/* Tarjeta de Mis Licencias y Permisos - NUEVA (solo si puede solicitar licencias) */}
              {puedesolicitarLicencias && (
                <Col md={6}>
                  <Link to="/mis-licencias-permisos" style={{ textDecoration: 'none' }}>
                    <Card className="h-100 shadow-sm dashboard-card">
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                        <i className="bi bi-calendar-check fs-1 mb-3 text-info"></i>
                        <Card.Title>Mis Licencias y Permisos</Card.Title>
                        <Card.Text>Crea y gestiona tus solicitudes</Card.Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
                )}
            </>
          )}
        </Row>
      </div>
    </div>
  );
};

export default DashboardRecursosHumanos; 