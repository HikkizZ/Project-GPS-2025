import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
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
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Header Elegante */}
          <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="card-header bg-gradient-primary text-white border-0" style={{ padding: '0.75rem 1.25rem' }}>
            <div className="d-flex align-items-center">
              <i className="bi bi-people-fill fs-5 me-2"></i>
              <div>
                <h5 className="mb-0 fw-bold">Recursos Humanos</h5>
                <small className="opacity-75" style={{ fontSize: '0.75rem' }}>Gestión integral del capital humano</small>
              </div>
            </div>
          </div>
          
          {/* Sección de módulos */}
          <div className="card-body" style={{ padding: '1.5rem' }}>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-circle bg-primary bg-opacity-10 me-2">
                  <i className="bi bi-grid fs-5 text-primary"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Módulos Disponibles</h6>
                  <small className="text-muted">Accede a las funcionalidades de recursos humanos</small>
                </div>
              </div>
            </div>
            
            <Row className="g-4">
              {/* TARJETAS PARA ROLES PRIVILEGIADOS */}
              {tienePermisosCompletos && (
                <>
                  {/* Tarjeta de Gestión del Personal */}
                  <Col md={3}>
                    <Link to="/gestion-personal" style={{ textDecoration: 'none' }}>
                      <Card 
                        className="h-100 border-0 shadow-lg" 
                        style={{ 
                          cursor: 'pointer', 
                          borderRadius: '20px',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          background: 'white',
                          border: '1px solid #e3f2fd'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 25px 50px rgba(13, 110, 253, 0.25)';
                          e.currentTarget.style.borderColor = '#0d6efd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#e3f2fd';
                        }}
                      >
                        <Card.Body className="p-4 text-center">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center mb-4"
                            style={{
                              width: '80px',
                              height: '80px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '24px',
                              position: 'relative',
                              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                            }}
                          >
                            <i className="bi bi-person-badge text-white" style={{ fontSize: '2.5rem' }}></i>
                          </div>
                          <Card.Title className="fw-bold text-dark mb-2 fs-5">Gestión del Personal</Card.Title>
                          <Card.Text className="text-muted small mb-3">Administra trabajadores, fichas y usuarios</Card.Text>
                          <div className="d-flex align-items-center justify-content-center">
                            <small className="text-primary fw-semibold">
                              <i className="bi bi-arrow-right me-1"></i>
                              Acceder
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>

                  {/* Tarjeta de Gestión de Sueldos */}
                  <Col md={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm" 
                      style={{ 
                        borderRadius: '20px',
                        background: 'white',
                        border: '1px solid #f1f5f9',
                        opacity: 0.8
                      }}
                    >
                      <Card.Body className="p-4 text-center">
                        <div 
                          className="d-inline-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            borderRadius: '24px',
                            boxShadow: '0 8px 32px rgba(107, 114, 128, 0.2)'
                          }}
                        >
                          <i className="bi bi-cash-stack text-white" style={{ fontSize: '2.5rem' }}></i>
                        </div>
                        <Card.Title className="fw-bold text-dark mb-2 fs-5">Gestión de Sueldos</Card.Title>
                        <Card.Text className="text-muted small mb-3">Control de remuneraciones y beneficios</Card.Text>
                        <div className="d-flex align-items-center justify-content-center">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            Próximamente
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Tarjeta de Gestión de Licencias y Permisos */}
                  <Col md={3}>
                    <Link to="/gestion-licencias-permisos" style={{ textDecoration: 'none' }}>
                      <Card 
                        className="h-100 border-0 shadow-lg" 
                        style={{ 
                          cursor: 'pointer', 
                          borderRadius: '20px',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          background: 'white',
                          border: '1px solid #fef3c7'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 25px 50px rgba(245, 158, 11, 0.25)';
                          e.currentTarget.style.borderColor = '#f59e0b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#fef3c7';
                        }}
                      >
                        <Card.Body className="p-4 text-center">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center mb-4"
                            style={{
                              width: '80px',
                              height: '80px',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              borderRadius: '24px',
                              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            <i className="bi bi-clipboard-check text-white" style={{ fontSize: '2.5rem' }}></i>
                          </div>
                          <Card.Title className="fw-bold text-dark mb-2 fs-5">Gestión de Licencias y Permisos</Card.Title>
                          <Card.Text className="text-muted small mb-3">Revisa y gestiona solicitudes de todos los trabajadores</Card.Text>
                          <div className="d-flex align-items-center justify-content-center">
                            <small className="text-primary fw-semibold">
                              <i className="bi bi-arrow-right me-1"></i>
                              Acceder
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>

                  {/* Tarjeta de Mis Licencias y Permisos - NUEVA (solo si puede solicitar licencias) */}
                  {puedesolicitarLicencias && (
                    <Col md={3}>
                      <Link to="/mis-licencias-permisos" style={{ textDecoration: 'none' }}>
                        <Card 
                          className="h-100 border-0 shadow-lg" 
                          style={{ 
                            cursor: 'pointer', 
                            borderRadius: '20px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            background: 'white',
                            border: '1px solid #cffafe'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 25px 50px rgba(6, 182, 212, 0.25)';
                            e.currentTarget.style.borderColor = '#06b6d4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = '#cffafe';
                          }}
                        >
                          <Card.Body className="p-4 text-center">
                            <div 
                              className="d-inline-flex align-items-center justify-content-center mb-4"
                              style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)'
                              }}
                            >
                              <i className="bi bi-calendar-check text-white" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Mis Licencias y Permisos</Card.Title>
                            <Card.Text className="text-muted small mb-3">Crea y gestiona tus propias solicitudes</Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-primary fw-semibold">
                                <i className="bi bi-arrow-right me-1"></i>
                                Acceder
                              </small>
                            </div>
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
                  <Col md={3}>
                    <Link to="/ficha-empresa/mi-ficha" style={{ textDecoration: 'none' }}>
                      <Card 
                        className="h-100 border-0 shadow-lg" 
                        style={{ 
                          cursor: 'pointer', 
                          borderRadius: '20px',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          background: 'white',
                          border: '1px solid #dcfce7'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 25px 50px rgba(34, 197, 94, 0.25)';
                          e.currentTarget.style.borderColor = '#22c55e';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#dcfce7';
                        }}
                      >
                        <Card.Body className="p-4 text-center">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center mb-4"
                            style={{
                              width: '80px',
                              height: '80px',
                              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                              borderRadius: '24px',
                              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
                            }}
                          >
                            <i className="bi bi-file-earmark-text text-white" style={{ fontSize: '2.5rem' }}></i>
                          </div>
                          <Card.Title className="fw-bold text-dark mb-2 fs-5">Mi Ficha de Empresa</Card.Title>
                          <Card.Text className="text-muted small mb-3">Consulta tu información laboral</Card.Text>
                          <div className="d-flex align-items-center justify-content-center">
                            <small className="text-primary fw-semibold">
                              <i className="bi bi-arrow-right me-1"></i>
                              Acceder
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>

                  {/* Tarjeta de Mis Licencias y Permisos - NUEVA (solo si puede solicitar licencias) */}
                  {puedesolicitarLicencias && (
                    <Col md={3}>
                      <Link to="/mis-licencias-permisos" style={{ textDecoration: 'none' }}>
                        <Card 
                          className="h-100 border-0 shadow-lg" 
                          style={{ 
                            cursor: 'pointer', 
                            borderRadius: '20px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            background: 'white',
                            border: '1px solid #cffafe'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 25px 50px rgba(6, 182, 212, 0.25)';
                            e.currentTarget.style.borderColor = '#06b6d4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = '#cffafe';
                          }}
                        >
                          <Card.Body className="p-4 text-center">
                            <div 
                              className="d-inline-flex align-items-center justify-content-center mb-4"
                              style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)'
                              }}
                            >
                              <i className="bi bi-calendar-check text-white" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Mis Licencias y Permisos</Card.Title>
                            <Card.Text className="text-muted small mb-3">Crea y gestiona tus solicitudes</Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-primary fw-semibold">
                                <i className="bi bi-arrow-right me-1"></i>
                                Acceder
                              </small>
                            </div>
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
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardRecursosHumanos; 