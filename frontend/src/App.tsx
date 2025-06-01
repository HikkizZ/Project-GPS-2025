import React, { useState, useEffect } from 'react';
import { useTrabajador } from './hooks/useTrabajador';
import { type CreateTrabajadorData, type Trabajador } from './types/trabajador';
import { FichasEmpresaPage } from './pages/FichasEmpresaPage';
import { UsersPage } from './pages/UsersPage';
import { TrabajadoresPage } from './pages/TrabajadoresPage';
import { authService } from './services/auth.service';
import { EditarTrabajadorModal } from './components/trabajador/EditarTrabajadorModal';

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
                  <i className="bi bi-geo-alt me-2"></i>
                  Sistema GPS 2025
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
                      placeholder="admin.principal@gmail.com"
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
                      placeholder="Admin2024"
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
                    <strong>Admin:</strong> admin.principal@gmail.com / Admin2024
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
  const { createTrabajador, isLoading, error, clearError, validateRUT, formatRUT } = useTrabajador();
  
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
    fechaIngreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
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
      const result = await createTrabajador(formData);
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
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
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
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
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
  // Manejo seguro de localStorage
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  const handleTrabajadorCreated = (trabajador: Trabajador) => {
    setSuccessMessage(`Trabajador ${trabajador.nombres} ${trabajador.apellidoPaterno} registrado exitosamente. Completa ahora su información laboral.`);
    setRecienRegistrado(trabajador);
    setCurrentPage('fichas-empresa');
    
    // Limpiar mensaje después de 5 segundos
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
                    
                    <div className="row">
                      {/* Tarjeta de Trabajadores */}
                      <div className="col-md-4 mb-3">
                        <div 
                          className="card h-100 shadow-sm border-success"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setCurrentPage('trabajadores')}
                        >
                          <div className="card-body text-center">
                            <i className="bi bi-people-fill display-4 text-success mb-3"></i>
                            <h5>Trabajadores</h5>
                            <p className="text-muted">Gestionar información del personal</p>
                            <button className="btn btn-success">
                              <i className="bi bi-person-gear me-2"></i>
                              Administrar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tarjeta de Fichas de Empresa */}
                      <div className="col-md-4 mb-3">
                        <div 
                          className="card h-100 shadow-sm border-primary"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setCurrentPage('fichas-empresa')}
                        >
                          <div className="card-body text-center">
                            <i className="bi bi-clipboard-data display-4 text-primary mb-3"></i>
                            <h5>Fichas de Empresa</h5>
                            <p className="text-muted">Editar información laboral de trabajadores</p>
                            <button className="btn btn-primary">
                              <i className="bi bi-pencil-square me-2"></i>
                              Gestionar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tarjeta de Gestión de Usuarios */}
                      {(user?.role === 'Administrador' || user?.role === 'RecursosHumanos') && (
                        <div className="col-md-4 mb-3">
                          <div 
                            className="card h-100 shadow-sm border-warning"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setCurrentPage('users')}
                          >
                            <div className="card-body text-center">
                              <i className="bi bi-people display-4 text-warning mb-3"></i>
                              <h5>Gestión de Usuarios</h5>
                              <p className="text-muted">Administrar cuentas y permisos del sistema</p>
                              <button className="btn btn-warning">
                                <i className="bi bi-shield-lock me-2"></i>
                                Gestionar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Otros Módulos */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <h6 className="text-secondary mb-3">
                          <i className="bi bi-gear me-2"></i>
                          Otros Módulos
                        </h6>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="card h-100 bg-light">
                          <div className="card-body text-center">
                            <i className="bi bi-box display-4 text-muted mb-3"></i>
                            <h5>Inventario</h5>
                            <p className="text-muted">Gestión de productos</p>
                            <button className="btn btn-outline-secondary" disabled>
                              Próximamente
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4 mb-3">
                        <div className="card h-100 bg-light">
                          <div className="card-body text-center">
                            <i className="bi bi-wrench display-4 text-muted mb-3"></i>
                            <h5>Maquinaria</h5>
                            <p className="text-muted">Control de equipos</p>
                            <button className="btn btn-outline-secondary" disabled>
                              Próximamente
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4 mb-3">
                        <div className="card h-100 bg-light">
                          <div className="card-body text-center">
                            <i className="bi bi-graph-up display-4 text-muted mb-3"></i>
                            <h5>Reportes</h5>
                            <p className="text-muted">Análisis y estadísticas</p>
                            <button className="btn btn-outline-secondary" disabled>
                              Próximamente
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-geo-alt me-2"></i>
            Sistema GPS 2025
          </span>
          
          <div className="navbar-nav ms-auto d-flex flex-row">
            {(user?.role === 'Administrador' || user?.role === 'RecursosHumanos') && (
              <div className="nav-item dropdown me-3">
                <button 
                  className="btn btn-outline-light dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-shield-lock me-2"></i>
                  Usuarios
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setCurrentPage('users')}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Registrar Usuario
                    </button>
                  </li>
                </ul>
              </div>
            )}
            
            {(user?.role === 'Administrador' || user?.role === 'RecursosHumanos') && (
              <div className="nav-item dropdown me-3">
                <button 
                  className="btn btn-outline-light dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-people me-2"></i>
                  RRHH
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setCurrentPage('registrar-trabajador')}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Registrar Trabajador
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => setCurrentPage('fichas-empresa')}
                    >
                      <i className="bi bi-clipboard-data me-2"></i>
                      Fichas de Empresa
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={() => setCurrentPage('trabajadores')}
                    >
                      <i className="bi bi-people-fill me-2"></i>
                      Trabajadores
                    </button>
                  </li>
                </ul>
              </div>
            )}
            
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => setCurrentPage('home')}
            >
              <i className="bi bi-house me-2"></i>
              Dashboard
            </button>
            
            <div className="nav-item dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-2"></i>
                {user.name}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <strong>Usuario:</strong> {user.name}<br />
                    <strong>Rol:</strong> {user.role}<br />
                    <strong>RUT:</strong> {user.rut}
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="flex-grow-1 bg-light">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-light py-2">
        <div className="container text-center">
          <small>&copy; 2025 Sistema GPS - Gestión de Procesos Empresariales</small>
        </div>
      </footer>
    </div>
  );
};

// App principal
function App() {
  // Manejo seguro de autenticación
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

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}

export default App; 