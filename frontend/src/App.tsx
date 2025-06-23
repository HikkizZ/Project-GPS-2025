import React, { useState } from 'react';
import { useRut } from './hooks/useRut';
import { useTrabajadores } from './hooks/recursosHumanos/useTrabajadores';
import { type CreateTrabajadorData, type Trabajador } from './types/recursosHumanos/trabajador.types';
import { FichasEmpresaPage } from './pages/recursosHumanos/FichasEmpresaPage';
import { UsersPage } from './pages/UsersPage';
import { TrabajadoresPage } from './pages/recursosHumanos/TrabajadoresPage';
import { authService } from './services/auth.service';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardRecursosHumanos from './pages/recursosHumanos/DashboardRecursosHumanos';
import GestionLicenciasPermisosPage from './pages/recursosHumanos/GestionLicenciasPermisosPage';
import MisLicenciasPermisosPage from './pages/recursosHumanos/MisLicenciasPermisosPage';
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
            <div className="card-header bg-primary text-white">
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
    setCurrentPage('fichas-empresa');
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
      case 'fichas-empresa':
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
          <div className="container py-4">
            <div className="row">
              <div className="col-12">
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
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                      <i className="bi bi-house me-2"></i>
                      Dashboard Principal
                    </h4>
                  </div>
                  <div className="card-body">
                    <h5>¡Bienvenido, {user.name}!</h5>
                    <p className="text-muted">Rol: <strong>{user.role}</strong> • RUT: {user.rut}</p>
                    {/* Sección de Recursos Humanos */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <h6 className="text-primary mb-3">
                          <i className="bi bi-people me-2"></i>
                          Recursos Humanos
                        </h6>
                      </div>
                    </div>
                    <Row>
                      <Col md={3} className="mb-4">
                        <Card className="h-100 shadow-sm border-primary" style={{ cursor: 'pointer', borderTop: '4px solid #2563eb' }} onClick={() => navigate('/recursos-humanos')}>
                          <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                            <i className="bi bi-people-fill fs-1 mb-3 text-primary"></i>
                            <Card.Title>Recursos Humanos</Card.Title>
                            {tienePermisosCompletos && (
                              <Card.Text>Gestión del personal y Gestión de sueldos</Card.Text>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} className="mb-4">
                        <Card className="h-100 shadow-sm border-success" style={{ border: '1.5px solid #059669', borderTop: '3px solid #059669' }}>
                          <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                            <i className="bi bi-box-seam fs-1 mb-3" style={{ color: '#059669' }}></i>
                            <Card.Title className="fw-bold">Inventario</Card.Title>
                            <Card.Text className="text-secondary">Próximamente</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} className="mb-4">
                        <Card className="h-100 shadow-sm border-info" style={{ border: '1.5px solid #0ea5e9', borderTop: '3px solid #0ea5e9' }}>
                          <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                            <i className="bi bi-truck fs-1 mb-3" style={{ color: '#0ea5e9' }}></i>
                            <Card.Title className="fw-bold">Maquinaria</Card.Title>
                            <Card.Text className="text-secondary">Próximamente</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} className="mb-4">
                        <Card className="h-100 shadow-sm border-warning" style={{ border: '1.5px solid #fbbf24', borderTop: '3px solid #fbbf24' }}>
                          <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                            <i className="bi bi-bar-chart fs-1 mb-3" style={{ color: '#fbbf24' }}></i>
                            <Card.Title className="fw-bold">Reportes</Card.Title>
                            <Card.Text className="text-secondary">Próximamente</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

  const safeUser = user ?? { name: 'Usuario', role: 'Invitado', rut: 'N/A' };

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MainLayout user={safeUser} onLogout={logout}>
              <Routes>
                <Route path="dashboard" element={<Dashboard user={safeUser} />} />
                <Route path="recursos-humanos" element={<DashboardRecursosHumanos />} />
                <Route path="trabajadores" element={<TrabajadoresPage />} />
                <Route path="fichas-empresa" element={<FichasEmpresaPage />} />
                <Route path="usuarios" element={<UsersPage />} />
                <Route path="gestion-personal" element={<GestionPersonalPage />} />
                <Route path="gestion-licencias-permisos" element={<GestionLicenciasPermisosPage />} />
                <Route path="mis-licencias-permisos" element={<MisLicenciasPermisosPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            location.pathname === '/login' ? null : <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      />
    </Routes>
  );
}

export default App; 