import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RegisterData, UserRole } from '@/types/auth.types';

export const UsersPage: React.FC = () => {
  const { user, register } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [newUser, setNewUser] = useState<RegisterData>({
    name: '',
    rut: '',
    email: '',
    password: '',
    role: 'Usuario'
  });

  const availableRoles: UserRole[] = ['Usuario', 'RecursosHumanos', 'Gerencia', 'Ventas', 'Arriendo', 'Finanzas'];
  
  // Solo admin puede crear otros admins
  if (user?.role === 'Administrador') {
    availableRoles.push('Administrador');
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setSuccess('');

    const result = await register(newUser);
    
    if (result.success) {
      setSuccess(`Usuario ${newUser.name} creado exitosamente`);
      setNewUser({
        name: '',
        rut: '',
        email: '',
        password: '',
        role: 'Usuario'
      });
      setShowCreateForm(false);
    } else {
      setError(result.error || 'Error al crear usuario');
    }
    
    setIsCreating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Verificar permisos
  if (user?.role !== 'Administrador' && user?.role !== 'RecursosHumanos') {
    return (
      <div className="users-page">
        <div className="access-denied">
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder a la gestión de usuarios.</p>
          <p>Solo usuarios con rol de <strong>Administrador</strong> o <strong>Recursos Humanos</strong> pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-text">
          <h1>
            <i className="bi bi-shield-lock me-2"></i>
            Gestión de Usuarios
          </h1>
          <p>Administra los usuarios del sistema GPS 2025</p>
        </div>
        {!showCreateForm && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <i className="bi bi-person-plus me-2"></i>
            Registrar Nuevo Usuario
          </button>
        )}
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button onClick={() => setError('')} className="btn-close"></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button onClick={() => setSuccess('')} className="btn-close"></button>
        </div>
      )}

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="create-user-section">
          <div className="create-user-form">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>
                <i className="bi bi-person-plus me-2"></i>
                Registrar Nuevo Usuario
              </h3>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-x me-2"></i>
                Cancelar
              </button>
            </div>

            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Importante:</strong> El usuario debe estar registrado como trabajador antes de crear su cuenta.
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="bi bi-person me-2"></i>
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    placeholder="Ej: Juan Pérez González"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rut">
                    <i className="bi bi-credit-card me-2"></i>
                    RUT:
                  </label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    value={newUser.rut}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    placeholder="12.345.678-9"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="bi bi-envelope me-2"></i>
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    placeholder="usuario@gmail.com"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    <i className="bi bi-shield me-2"></i>
                    Rol:
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    className="form-control"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="bi bi-key me-2"></i>
                  Contraseña:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                  disabled={isCreating}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  className="form-control"
                />
              </div>

              <div className="form-actions mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                  className="btn btn-secondary"
                >
                  <i className="bi bi-x me-2"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn btn-primary"
                >
                  {isCreating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check me-2"></i>
                      Crear Usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de usuarios existentes */}
      <div className="users-list-section mt-4">
        <h3>
          <i className="bi bi-people me-2"></i>
          Usuarios del Sistema
        </h3>
        <div className="users-info">
          <div className="info-card">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <h4>Usuario Actual</h4>
              <p><strong>{user?.name}</strong></p>
              <p>
                <i className="bi bi-shield me-2"></i>
                Rol: {user?.role}
              </p>
              <p>
                <i className="bi bi-credit-card me-2"></i>
                RUT: {user?.rut}
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📋</div>
            <div className="info-content">
              <h4>Funcionalidades</h4>
              <ul className="list-unstyled">
                <li>
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Crear nuevos usuarios
                </li>
                <li>
                  <i className="bi bi-clock text-warning me-2"></i>
                  Lista completa (próximamente)
                </li>
                <li>
                  <i className="bi bi-clock text-warning me-2"></i>
                  Editar usuarios (próximamente)
                </li>
                <li>
                  <i className="bi bi-clock text-warning me-2"></i>
                  Eliminar usuarios (próximamente)
                </li>
              </ul>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🔐</div>
            <div className="info-content">
              <h4>Roles Disponibles</h4>
              <ul className="list-unstyled">
                {availableRoles.map(role => (
                  <li key={role}>
                    <i className="bi bi-shield me-2"></i>
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="coming-soon mt-4">
          <h4>
            <i className="bi bi-tools me-2"></i>
            Próximas Funcionalidades
          </h4>
          <p>Estamos trabajando en agregar:</p>
          <ul>
            <li>Lista completa de usuarios registrados</li>
            <li>Búsqueda y filtrado de usuarios</li>
            <li>Edición de información de usuarios</li>
            <li>Gestión de permisos avanzados</li>
            <li>Historial de actividades</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 