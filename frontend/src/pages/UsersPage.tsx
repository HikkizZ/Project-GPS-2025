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
      <div className="container py-4">
        <div className="card">
          <div className="card-body text-center">
            <i className="bi bi-shield-exclamation display-1 text-danger mb-4"></i>
            <h2>Acceso Denegado</h2>
            <p className="lead">No tienes permisos para acceder a la gestión de usuarios.</p>
            <p>Solo usuarios con rol de <strong>Administrador</strong> o <strong>Recursos Humanos</strong> pueden gestionar usuarios.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-shield-lock me-2"></i>
                Gestión de Usuarios
              </h2>
              <p className="text-muted mb-0">Administra los usuarios del sistema GPS 2025</p>
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
        </div>
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
      {showCreateForm ? (
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-person-plus me-2"></i>
                  Registrar Nuevo Usuario
                </h5>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-outline-light btn-sm"
                >
                  <i className="bi bi-x me-2"></i>
                  Cancelar
                </button>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Importante:</strong> El usuario debe estar registrado como trabajador antes de crear su cuenta.
                </div>

                <form onSubmit={handleCreateUser}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">
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
                    <div className="col-md-6">
                      <label htmlFor="rut" className="form-label">
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

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
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
                    <div className="col-md-6">
                      <label htmlFor="role" className="form-label">
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
                        className="form-select"
                      >
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
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

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Crear Usuario
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateForm(false)}
                      disabled={isCreating}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Usuarios del Sistema
                </h5>
              </div>
              <div className="card-body">
                {/* Información del Usuario Actual */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-person-circle me-2"></i>
                    Usuario Actual
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <h5>{user?.name || 'Usuario'}</h5>
                      <p className="mb-1">
                        <strong>Rol:</strong> {user?.role || 'N/A'}
                      </p>
                      <p className="mb-0">
                        <strong>RUT:</strong> {user?.rut || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Funcionalidades */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-gear me-2"></i>
                    Funcionalidades
                  </h6>
                  <ul className="list-group">
                    <li className="list-group-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Crear nuevos usuarios
                    </li>
                    <li className="list-group-item text-muted">
                      <i className="bi bi-clock me-2"></i>
                      Lista completa (próximamente)
                    </li>
                    <li className="list-group-item text-muted">
                      <i className="bi bi-clock me-2"></i>
                      Editar usuarios (próximamente)
                    </li>
                    <li className="list-group-item text-muted">
                      <i className="bi bi-clock me-2"></i>
                      Eliminar usuarios (próximamente)
                    </li>
                  </ul>
                </div>

                {/* Roles Disponibles */}
                <div>
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-shield-lock me-2"></i>
                    Roles Disponibles
                  </h6>
                  <div className="row g-3">
                    {availableRoles.map(role => (
                      <div key={role} className="col-md-4 col-lg-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-title">
                              <i className="bi bi-person-badge me-2"></i>
                              {role}
                            </h6>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 