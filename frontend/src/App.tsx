import React, { useState } from 'react';
import { useRut } from './hooks/useRut';
import { useTrabajadores } from './hooks/recursosHumanos/useTrabajadores';
import { type CreateTrabajadorData, type Trabajador } from './types/recursosHumanos/trabajador.types';
import { FichasEmpresaPage } from './pages/recursosHumanos/FichasEmpresaPage';
import { BonosPage } from './pages/recursosHumanos/bonosPage';
import { UsersPage } from './pages/UsersPage';
import { TrabajadoresPage } from './pages/recursosHumanos/TrabajadoresPage';
import { authService } from './services/auth.service';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardRecursosHumanos from './pages/recursosHumanos/DashboardRecursosHumanos';
import { GestionLicenciasPermisosPage } from './pages/recursosHumanos/GestionLicenciasPermisosPage';
import { MisLicenciasPermisosPage } from './pages/recursosHumanos/MisLicenciasPermisosPage';
import MainLayout from './components/common/MainLayout';
import GestionPersonalPage from './pages/GestionPersonalPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context';
import { UserRole } from './types/auth.types';

// Componente de Registro de Trabajadores
const RegistrarTrabajadorPage: React.FC<{
  onSuccess: (trabajador: Trabajador) => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { createTrabajador: createTrabajadorService, isLoading: isCreating, error: createError, clearError } = useTrabajadores();
  const { validateRUT, formatRUT } = useRut();
  
  const [formData, setFormData] = useState<CreateTrabajadorData>({
    rut: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    telefono: '',
    correoPersonal: '',
    numeroEmergencia: '',
    direccion: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del frontend
    const errors: Record<string, string> = {};
    
    if (!validateRUT(formData.rut)) {
      errors.rut = 'RUT inválido';
    }
    
    if (formData.nombres.length < 2) {
      errors.nombres = 'Nombres debe tener al menos 2 caracteres';
    }
    
    if (formData.apellidoPaterno.length < 2) {
      errors.apellidoPaterno = 'Apellido paterno debe tener al menos 2 caracteres';
    }
    
    if (formData.apellidoMaterno.length < 2) {
      errors.apellidoMaterno = 'Apellido materno debe tener al menos 2 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correoPersonal)) {
      errors.correoPersonal = 'Email inválido';
    }
    
    if (formData.telefono.length < 9) {
      errors.telefono = 'Teléfono debe tener al menos 9 dígitos';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    try {
      const result = await createTrabajadorService(formData);
      if (result.success && result.trabajador) {
        onSuccess(result.trabajador);
      } else {
        setValidationErrors({ submit: result.error || 'Error al crear trabajador' });
      }
    } catch (error) {
      console.error('Error al crear trabajador:', error);
      setValidationErrors({ submit: 'Error al crear trabajador' });
    }
  };

  const handleChange = (field: keyof CreateTrabajadorData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo específico
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-formatear RUT
    if (field === 'rut') {
      const formattedRUT = formatRUT(value);
      setFormData(prev => ({ ...prev, rut: formattedRUT }));
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white header-text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                Registrar Nuevo Trabajador
              </h4>
            </div>
            <div className="card-body">
              {createError && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {createError}
                  <button type="button" className="btn-close" onClick={clearError}></button>
                </div>
              )}

              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Nota:</strong> Al registrar un trabajador se creará automáticamente una ficha de empresa 
                con valores por defecto que podrás editar inmediatamente.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">RUT: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.rut ? 'is-invalid' : ''}`}
                      value={formData.rut}
                      onChange={(e) => handleChange('rut', e.target.value)}
                      placeholder="12.345.678-9"
                      required
                    />
                    {validationErrors.rut && (
                      <div className="invalid-feedback">{validationErrors.rut}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Ingreso: <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaIngreso}
                      onChange={(e) => handleChange('fechaIngreso', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombres: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.nombres ? 'is-invalid' : ''}`}
                      value={formData.nombres}
                      onChange={(e) => handleChange('nombres', e.target.value)}
                      placeholder="Juan Carlos"
                      required
                    />
                    {validationErrors.nombres && (
                      <div className="invalid-feedback">{validationErrors.nombres}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido Paterno: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.apellidoPaterno ? 'is-invalid' : ''}`}
                      value={formData.apellidoPaterno}
                      onChange={(e) => handleChange('apellidoPaterno', e.target.value)}
                      placeholder="Pérez"
                      required
                    />
                    {validationErrors.apellidoPaterno && (
                      <div className="invalid-feedback">{validationErrors.apellidoPaterno}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido Materno: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.apellidoMaterno ? 'is-invalid' : ''}`}
                      value={formData.apellidoMaterno}
                      onChange={(e) => handleChange('apellidoMaterno', e.target.value)}
                      placeholder="González"
                      required
                    />
                    {validationErrors.apellidoMaterno && (
                      <div className="invalid-feedback">{validationErrors.apellidoMaterno}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email: <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className={`form-control ${validationErrors.correoPersonal ? 'is-invalid' : ''}`}
                      value={formData.correoPersonal}
                      onChange={(e) => handleChange('correoPersonal', e.target.value)}
                      placeholder="juan.perez@gmail.com"
                      required
                    />
                    {validationErrors.correoPersonal && (
                      <div className="invalid-feedback">{validationErrors.correoPersonal}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono: <span className="text-danger">*</span></label>
                    <input
                      type="tel"
                      className={`form-control ${validationErrors.telefono ? 'is-invalid' : ''}`}
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="+56912345678"
                      required
                    />
                    {validationErrors.telefono && (
                      <div className="invalid-feedback">{validationErrors.telefono}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono de Emergencia:</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.numeroEmergencia}
                      onChange={(e) => handleChange('numeroEmergencia', e.target.value)}
                      placeholder="+56987654321"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dirección: <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.direccion}
                      onChange={(e) => handleChange('direccion', e.target.value)}
                      placeholder="Av. Principal 123, Comuna, Ciudad"
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Registrar Trabajador
                      </>
                    )}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard principal simplificado
interface DashboardProps {
  user: { name: string; role: string; rut: string };
}
const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [successMessage, setSuccessMessage] = useState('');
  const [recienRegistrado, setRecienRegistrado] = useState<Trabajador | null>(null);
  const navigate = useNavigate();

  // Roles que tienen acceso completo a todas las funcionalidades
  const rolesPrivilegiados: UserRole[] = ['SuperAdministrador', 'Administrador', 'RecursosHumanos'];
  
  // Verificar si el usuario tiene permisos completos
  const tienePermisosCompletos = rolesPrivilegiados.includes(user.role as UserRole);

  const handleTrabajadorCreated = (trabajador: Trabajador) => {
    setSuccessMessage(`Trabajador ${trabajador.nombres} ${trabajador.apellidoPaterno} registrado exitosamente. Completa ahora su información laboral.`);
    setRecienRegistrado(trabajador);
    setCurrentPage('ficha-empresa');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <UsersPage />;
      case 'registrar-trabajador':
        return (
          <RegistrarTrabajadorPage
            onSuccess={handleTrabajadorCreated}
            onCancel={() => setCurrentPage('home')}
          />
        );
      case 'ficha-empresa':
        return (
          <FichasEmpresaPage 
            trabajadorRecienRegistrado={recienRegistrado}
            onTrabajadorModalClosed={() => setRecienRegistrado(null)}
          />
        );
      case 'ficha-empresa/mi-ficha':
        return (
          <FichasEmpresaPage 
            trabajadorRecienRegistrado={recienRegistrado}
            onTrabajadorModalClosed={() => setRecienRegistrado(null)}
          />
        );
      case 'trabajadores':
        return <TrabajadoresPage />;
      default:
        return (
          <>
            <div className="container-fluid">
              <div className="dashboard-content">
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show">
                    <i className="bi bi-check-circle me-2"></i>
                    {successMessage}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSuccessMessage('')}
                    ></button>
                  </div>
                )}
                <div className="card shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="card-header bg-gradient-primary text-white border-0 header-text-white" style={{ padding: '0.75rem 1.25rem' }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-house fs-5 me-2"></i>
                      <div>
                        <h5 className="mb-0 fw-bold">Página de Inicio</h5>
                        <small className="opacity-75" style={{ fontSize: '0.75rem' }}>Centro de control y navegación del sistema</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: '1.5rem' }}>
                    <div className="mb-3 p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: '1px solid #e9ecef' }}>
                      <h6 className="mb-2 fw-bold text-dark">¡Bienvenido, {user.name}!</h6>
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        <span className="badge bg-primary px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>
                          <i className="bi bi-person-badge me-1"></i>
                          {user.role}
                        </span>
                        <span className="text-muted small">
                          <i className="bi bi-card-text me-1"></i>
                          RUT: {user.rut}
                        </span>
                      </div>
                    </div>
                    
                    {/* Sección de Recursos Humanos */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle bg-primary bg-opacity-10 me-2">
                          <i className="bi bi-grid fs-5 text-primary"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold text-dark">Módulos del Sistema</h6>
                          <small className="text-muted">Accede a las diferentes áreas de gestión</small>
                        </div>
                      </div>
                    </div>
                    <Row>
                      <Col md={3} className="mb-4">
                        <Card 
                          className="h-100 border-0 shadow-lg" 
                          style={{ 
                            cursor: 'pointer', 
                            borderRadius: '20px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            background: 'white',
                            border: '1px solid #e3f2fd'
                          }} 
                          onClick={() => navigate('/recursos-humanos')}
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
                              <i className="bi bi-people-fill text-white" style={{ fontSize: '2.5rem' }}></i>
                              <div 
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  right: '-8px',
                                  width: '24px',
                                  height: '24px',
                                  background: '#28a745',
                                  borderRadius: '50%',
                                  border: '3px solid white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <i className="bi bi-check text-white" style={{ fontSize: '0.7rem' }}></i>
                              </div>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Recursos Humanos</Card.Title>
                            {tienePermisosCompletos && (
                              <Card.Text className="text-muted small mb-3">Gestión del personal y sueldos</Card.Text>
                            )}
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-primary fw-semibold">
                                <i className="bi bi-arrow-right me-1"></i>
                                Acceder
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={3} className="mb-4">
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
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
                              }}
                            >
                              <i className="bi bi-box-seam text-white" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Inventario</Card.Title>
                            <Card.Text className="text-muted small mb-3">Control de stock y productos</Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                Próximamente
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={3} className="mb-4">
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
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.2)'
                              }}
                            >
                              <i className="bi bi-truck text-white" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Maquinaria</Card.Title>
                            <Card.Text className="text-muted small mb-3">Gestión de equipos y mantención</Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                Próximamente
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col md={3} className="mb-4">
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
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderRadius: '24px',
                                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
                              }}
                            >
                              <i className="bi bi-bar-chart text-white" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Reportes</Card.Title>
                            <Card.Text className="text-muted small mb-3">Análisis y estadísticas</Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                Próximamente
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return renderPage();
};

function PublicRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// App principal
function App() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const location = useLocation();
  const safeUser = user ?? { name: 'Usuario', role: 'Invitado', rut: 'N/A' };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 mb-0 text-muted fw-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MainLayout user={safeUser} onLogout={logout}>
              <Routes>
                <Route path="dashboard" element={<Dashboard user={safeUser} />} />
                <Route path="recursos-humanos" element={<DashboardRecursosHumanos />} />
                <Route path="trabajadores" element={<TrabajadoresPage />} />
                <Route path="ficha-empresa" element={<FichasEmpresaPage />} />
                <Route path="ficha-empresa/mi-ficha" element={<FichasEmpresaPage />} />
                <Route path="bonos" element={<BonosPage />} />
                <Route path="fichas-empresa" element={<FichasEmpresaPage />} />
                <Route path="fichas-empresa/mi-ficha" element={<FichasEmpresaPage />} />
                <Route path="usuarios" element={<UsersPage />} />
                <Route path="gestion-personal" element={<GestionPersonalPage />} />
                <Route path="gestion-licencias-permisos" element={<GestionLicenciasPermisosPage />} />
                <Route path="mis-licencias-permisos" element={<MisLicenciasPermisosPage />} />
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="*" element={<div className="container py-4"><div className="alert alert-warning"><h4>Página no encontrada</h4><p>La página que buscas no existe. <a href="/dashboard">Volver al dashboard</a></p></div></div>} />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      />
    </Routes>
  );
}

export default App; 