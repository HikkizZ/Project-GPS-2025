import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole, SafeUser } from '@/types/auth.types';
import { useRut } from '@/hooks/useRut';
import { userService } from '@/services/user.service';
import { Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';

// Interfaz para los parámetros de búsqueda
interface UserSearchParams {
  name?: string;
  rut?: string;
  email?: string;
  role?: UserRole;
}

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const { formatRUT } = useRut();
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [searchParams, setSearchParams] = useState<UserSearchParams>({});
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);

  // Estados para los checkboxes de filtrado
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [soloInactivos, setSoloInactivos] = useState(false);

  const availableRoles: UserRole[] = ['Usuario', 'RecursosHumanos', 'Gerencia', 'Ventas', 'Arriendo', 'Finanzas'];
  
  // Solo admin puede crear otros admins
  if (user?.role === 'Administrador') {
    availableRoles.push('Administrador');
  }

  // Función para limpiar el RUT (eliminar puntos y guión)
  const cleanRUT = (rut: string) => {
    return rut.replace(/\./g, '').replace(/-/g, '');
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      // Aplicar filtros localmente
      let filteredUsers = data;
      
      if (searchParams.name) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchParams.name!.toLowerCase())
        );
      }
      
      if (searchParams.rut) {
        // Limpiar el RUT de búsqueda y los RUTs de usuarios antes de comparar
        const searchRUT = cleanRUT(searchParams.rut);
        filteredUsers = filteredUsers.filter(user => 
          cleanRUT(user.rut).includes(searchRUT)
        );
      }
      
      if (searchParams.email) {
        filteredUsers = filteredUsers.filter(user => 
          user.email.toLowerCase().includes(searchParams.email!.toLowerCase())
        );
      }
      
      if (searchParams.role) {
        filteredUsers = filteredUsers.filter(user => 
          user.role === searchParams.role
        );
      }
      
      setUsers(filteredUsers);
      setError('');
    } catch (err) {
      setError('Error al cargar la lista de usuarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleResetSearch = async () => {
    // Limpiar los filtros
    setSearchParams({});
    // Recargar la lista completa de usuarios
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Error al cargar la lista de usuarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = (selectedUser: SafeUser) => {
    setNewRole(selectedUser.role);
    setNewPassword('');
    setSelectedUser(selectedUser);
    setShowUpdateModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
        setIsUpdating(true);
        setError('');
        
        // Crear objeto con las actualizaciones
        const updates: { role?: string, password?: string } = {};
        if (newRole && newRole !== selectedUser.role) updates.role = newRole;
        if (newPassword && newPassword.length === 8) updates.password = newPassword;

        // Solo enviar la petición si hay cambios
        if (Object.keys(updates).length > 0) {
            await userService.updateUser(selectedUser.id, selectedUser.rut, updates);
            setSuccess(`Usuario ${selectedUser.name} actualizado exitosamente`);
            setTimeout(() => setSuccess(''), 3000);
            setShowUpdateModal(false);
            loadUsers(); // Recargar la lista después de actualizar
        } else {
            setShowUpdateModal(false); // Cerrar modal si no hay cambios
        }
    } catch (err: any) {
        setError(err.message || 'Error al actualizar usuario');
    } finally {
        setIsUpdating(false);
        setNewPassword('');
    }
  };

  // Función para filtrar usuarios según el estado de cuenta
  const usuariosFiltrados = users.filter(user => {
    if (soloInactivos) return user.estadoCuenta === 'Inactiva';
    if (!incluirInactivos) return user.estadoCuenta === 'Activa';
    return true;
  });

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRut = formatRUT(e.target.value);
    setSearchParams({ ...searchParams, rut: formattedRut });
  };

  // Verificar permisos
  if (
    user?.role !== 'Administrador' &&
    user?.role !== 'RecursosHumanos' &&
    user?.role !== 'SuperAdministrador'
  ) {
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
    <div className="container py-4">
      {/* Header con título y botones */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="d-flex align-items-center mb-1">
            <i className="bi bi-people me-2"></i>
            Gestión de Usuarios
          </h4>
          <p className="text-muted mb-0">Administrar cuentas y permisos del sistema</p>
        </div>
        <div>
          <Button 
            variant={showFilters ? "outline-secondary" : "outline-primary"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>
      </div>

      {/* Sección de Filtros */}
      {showFilters && (
        <div className="card border-light shadow-sm mb-4">
          <div className="card-body">
            <h6 className="card-title mb-3">
              <i className="bi bi-search me-2"></i>
              Filtros de Búsqueda
            </h6>

            {/* Checkboxes de estado de cuenta */}
            <div className="row mb-4">
              <div className="col-12">
                <h6 className="mb-3">Estado de cuenta:</h6>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="incluirInactivos"
                    checked={incluirInactivos}
                    onChange={(e) => {
                      setIncluirInactivos(e.target.checked);
                      if (e.target.checked) setSoloInactivos(false);
                    }}
                    disabled={soloInactivos}
                  />
                  <label className="form-check-label" htmlFor="incluirInactivos">
                    Incluir cuentas inactivas
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="soloInactivos"
                    checked={soloInactivos}
                    onChange={(e) => {
                      setSoloInactivos(e.target.checked);
                      if (e.target.checked) setIncluirInactivos(false);
                    }}
                    disabled={incluirInactivos}
                  />
                  <label className="form-check-label" htmlFor="soloInactivos">
                    Ver solo cuentas inactivas
                  </label>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label d-flex align-items-center">
                  <i className="bi bi-credit-card me-2"></i>
                  RUT
                </label>
                <Form.Control
                  type="text"
                  name="rut"
                  placeholder="12.345.678-9"
                  value={searchParams.rut || ''}
                  onChange={handleRutChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label d-flex align-items-center">
                  <i className="bi bi-person me-2"></i>
                  Nombre
                </label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Buscar por nombre"
                  value={searchParams.name || ''}
                  onChange={(e) => {
                    const { value } = e.target;
                    setSearchParams(prev => ({
                      ...prev,
                      name: value
                    }));
                  }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label d-flex align-items-center">
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </label>
                <Form.Control
                  type="text"
                  name="email"
                  placeholder="usuario@gmail.com"
                  value={searchParams.email || ''}
                  onChange={(e) => {
                    const { value } = e.target;
                    setSearchParams(prev => ({
                      ...prev,
                      email: value
                    }));
                  }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label d-flex align-items-center">
                  <i className="bi bi-shield me-2"></i>
                  Rol
                </label>
                <Form.Select
                  name="role"
                  value={searchParams.role || ''}
                  onChange={(e) => {
                    const { value } = e.target;
                    setSearchParams(prev => ({
                      ...prev,
                      role: value as UserRole
                    }));
                  }}
                >
                  <option value="">Todos los roles</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="primary"
                className="me-2"
                onClick={handleSearch}
              >
                <i className="bi bi-search me-2"></i>
                Buscar
              </Button>
              <Button
                variant="secondary"
                onClick={handleResetSearch}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="card shadow-sm">
        <div className="card-body">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              <i className="bi bi-check-circle-fill me-2"></i>
              {success}
            </Alert>
          )}

          <div className="table-responsive">
            {isLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <i className="bi bi-list-ul me-2"></i>
                    Usuarios Registrados ({usuariosFiltrados.length})
                    <small className="text-muted ms-2">
                      (Activos: {usuariosFiltrados.filter(u => u.estadoCuenta === 'Activa').length} • 
                      Inactivos: {usuariosFiltrados.filter(u => u.estadoCuenta === 'Inactiva').length})
                    </small>
                  </h6>
                </div>
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>RUT</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Contraseña</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{formatRUT(user.rut)}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${user.estadoCuenta === 'Activa' ? 'success' : 'danger'}`}>
                            {user.estadoCuenta}
                          </span>
                        </td>
                        <td>
                          {user.showPassword ? user.password : '••••••••'}
                        </td>
                        <td className="text-center">
                          {/* Ocultar acciones si es el admin principal */}
                          {(user.email !== 'admin.principal@gmail.com' && user.rut !== '11.111.111-1') && (
                            <div className="btn-group">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => {
                                  const updatedUsers = users.map(u => 
                                    u.id === user.id ? { ...u, showPassword: !u.showPassword } : u
                                  );
                                  setUsers(updatedUsers);
                                }}
                                title={user.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={user.estadoCuenta === 'Inactiva'}
                              >
                                <i className={`bi bi-eye${user.showPassword ? '-slash' : ''}`}></i>
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleUpdateClick(user)}
                                title="Editar rol"
                                disabled={user.estadoCuenta === 'Inactiva'}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mantener solo los modales de actualización */}
      <Modal show={showUpdateModal} onHide={() => {
        setShowUpdateModal(false);
        setNewPassword('');
        if (selectedUser) setNewRole(selectedUser.role);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-gear me-2"></i>
            Actualizar Usuario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-person me-2"></i>
                  Usuario
                </Form.Label>
                <Form.Control type="text" value={selectedUser.name} disabled />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-credit-card me-2"></i>
                  RUT
                </Form.Label>
                <Form.Control type="text" value={formatRUT(selectedUser.rut)} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-shield me-2"></i>
                  Rol
                </Form.Label>
                <Form.Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-key me-2"></i>
                  Nueva Contraseña
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dejar vacío para mantener la actual"
                  maxLength={8}
                />
                <Form.Text className="text-muted">
                  La contraseña debe tener exactamente 8 caracteres si se desea cambiar
                </Form.Text>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowUpdateModal(false);
            setNewPassword('');
            if (selectedUser) setNewRole(selectedUser.role);
          }}>
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateUser}
            disabled={isUpdating || (newPassword !== '' && newPassword.length !== 8)}
          >
            {isUpdating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Actualizando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Guardar Cambios
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Función auxiliar para determinar el color del badge según el rol
const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'Administrador':
      return 'danger';
    case 'RecursosHumanos':
      return 'success';
    case 'Gerencia':
      return 'primary';
    case 'Ventas':
      return 'warning';
    case 'Arriendo':
      return 'info';
    case 'Finanzas':
      return 'secondary';
    case 'Usuario':
      return 'dark';
    default:
      return 'light';
  }
}; 