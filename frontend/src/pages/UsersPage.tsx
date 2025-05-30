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
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema GPS 2025</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="alert-close">✕</button>
        </div>
      )}

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="create-user-section">
          <div className="create-user-form">
            <h3>Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    placeholder="Ej: Juan Pérez González"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rut">RUT:</label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    value={newUser.rut}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                    placeholder="usuario@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Rol:</label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                    disabled={isCreating}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
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
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn btn-primary"
                >
                  {isCreating ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de usuarios existentes */}
      <div className="users-list-section">
        <h3>Usuarios del Sistema</h3>
        <div className="users-info">
          <div className="info-card">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <h4>Usuario Actual</h4>
              <p><strong>{user?.name}</strong></p>
              <p>Rol: {user?.role}</p>
              <p>RUT: {user?.rut}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📋</div>
            <div className="info-content">
              <h4>Funcionalidades</h4>
              <ul>
                <li>✅ Crear nuevos usuarios</li>
                <li>🔄 Lista completa (próximamente)</li>
                <li>✏️ Editar usuarios (próximamente)</li>
                <li>🗑️ Eliminar usuarios (próximamente)</li>
              </ul>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🔐</div>
            <div className="info-content">
              <h4>Roles Disponibles</h4>
              <ul>
                {availableRoles.map(role => (
                  <li key={role}>• {role}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="coming-soon">
          <h4>🚧 Próximas Funcionalidades</h4>
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