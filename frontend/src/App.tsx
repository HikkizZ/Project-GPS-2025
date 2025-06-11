import React, { useState } from 'react';
import { useRut } from './hooks/useRut';
import { useTrabajadores } from './hooks/recursosHumanos/useTrabajadores';
import { type CreateTrabajadorData, type Trabajador } from './types/recursosHumanos/trabajador.types';
import { FichasEmpresaPage } from './pages/recursosHumanos/FichasEmpresaPage';
import { UsersPage } from './pages/UsersPage';
import { TrabajadoresPage } from './pages/recursosHumanos/TrabajadoresPage';
import { authService } from './services/auth.service';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import DashboardRecursosHumanos from './pages/recursosHumanos/DashboardRecursosHumanos';
import MainLayout from './components/common/MainLayout';
import GestionPersonalPage from './pages/GestionPersonalPage';

// Componente simple de Login
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login({ email, password });
      // Recargar la página para mostrar el dashboard
      window.location.reload();
    } catch (error: any) {
      console.error('Error de conexión:', error);
      setError(error.message || 'Error de conexión. Verifica que el backend esté funcionando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-header bg-primary text-white text-center">
                <h4 className="mb-0">
                  <i className="bi bi-truck me-2"></i>
                  S.G. Lamas
                </h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patricia.gonzalez@gmail.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña:</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="204dm1n8"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Iniciando Sesión...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </button>
                </form>
                <div className="mt-3">
                  <small className="text-muted">
                    <strong>Credenciales de prueba:</strong><br/>
                    <strong>Admin:</strong> patricia.gonzalez@gmail.com / 204dm1n8
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    correo: '',
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
    if (!emailRegex.test(formData.correo)) {
      errors.correo = 'Email inválido';
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
                      className={`form-control ${validationErrors.correo ? 'is-invalid' : ''}`}
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      placeholder="juan.perez@gmail.com"
                      required
                    />
                    {validationErrors.correo && (
                      <div className="invalid-feedback">{validationErrors.correo}</div>
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
const Dashboard: React.FC = () => {
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('userData');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return { name: 'Usuario', role: 'Invitado', rut: 'N/A' };
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return { name: 'Usuario', role: 'Invitado', rut: 'N/A' };
    }
  };

  const user = getUserFromStorage();
  const [currentPage, setCurrentPage] = useState('home');
  const [successMessage, setSuccessMessage] = useState('');
  const [recienRegistrado, setRecienRegistrado] = useState<Trabajador | null>(null);
  const navigate = useNavigate();

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
                            <Card.Text>Gestión del personal y Gestión de sueldos</Card.Text>
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

// App principal
function App() {
  const isAuthenticated = (() => {
    try {
      const authStr = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('userData');
      return authStr && userStr && authStr !== 'undefined' && userStr !== 'undefined';
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  })();

  // Obtener usuario y función de logout para pasar al layout
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('userData');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return { name: 'Usuario', role: 'Invitado', rut: 'N/A' };
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return { name: 'Usuario', role: 'Invitado', rut: 'N/A' };
    }
  };
  const user = getUserFromStorage();
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  return isAuthenticated ? (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<MainLayout user={user} onLogout={handleLogout}><Dashboard /></MainLayout>} />
      <Route path="/recursos-humanos" element={<MainLayout user={user} onLogout={handleLogout}><DashboardRecursosHumanos /></MainLayout>} />
      <Route path="/trabajadores" element={<MainLayout user={user} onLogout={handleLogout}><TrabajadoresPage /></MainLayout>} />
      <Route path="/fichas-empresa" element={<MainLayout user={user} onLogout={handleLogout}><FichasEmpresaPage /></MainLayout>} />
      <Route path="/usuarios" element={<MainLayout user={user} onLogout={handleLogout}><UsersPage /></MainLayout>} />
      <Route path="/gestion-personal" element={<MainLayout user={user} onLogout={handleLogout}><GestionPersonalPage /></MainLayout>} />
    </Routes>
  ) : <LoginPage />;
}

export default App; 