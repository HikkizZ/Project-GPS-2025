import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RegisterData, UserRole, SafeUser } from '@/types/auth.types';
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
  const { user, register } = useAuth();
  const { formatRUT, validateRUT } = useRut();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [searchParams, setSearchParams] = useState<UserSearchParams>({});

  // Estados para los checkboxes de filtrado
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [soloInactivos, setSoloInactivos] = useState(false);

  const [newUser, setNewUser] = useState<RegisterData>({
    name: '',
    rut: '',
    email: '',
    password: '',
    role: 'Usuario'
  });

  const resetNewUser = () => {
    setNewUser({
      name: '',
      rut: '',
      email: '',
      password: '',
      role: 'Usuario'
    });
  };

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setSuccess('');

    // Validar RUT antes de enviar
    if (!validateRUT(newUser.rut)) {
      setError('El RUT ingresado no es válido');
      setIsCreating(false);
      return;
    }

    const result = await register(newUser);
    
    if (result.success) {
      setSuccess(`Usuario ${newUser.name} creado exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
      resetNewUser();
      setShowCreateModal(false);
      loadUsers(); // Recargar la lista después de crear
    } else {
      setError(result.error || 'Error al crear usuario');
    }
    
    setIsCreating(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      const formattedRUT = formatRUT(value);
      setSearchParams(prev => ({
        ...prev,
        [name]: formattedRUT
      }));
    } else {
      setSearchParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      const formattedRUT = formatRUT(value);
      setNewUser(prev => ({
        ...prev,
        [name]: formattedRUT
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateClick = (selectedUser: SafeUser) => {
    setSelectedUser(selectedUser);
    setNewRole(selectedUser.role);
    setNewPassword('');
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (selectedUser: SafeUser) => {
    setSelectedUser(selectedUser);
    setShowDeleteModal(true);
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);
      setError('');
      await userService.deleteUser(selectedUser.id, selectedUser.rut);
      setSuccess(`Usuario ${selectedUser.name} eliminado exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteModal(false);
      loadUsers(); // Recargar la lista después de eliminar
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para filtrar usuarios según el estado de cuenta
  const usuariosFiltrados = users.filter(user => {
    if (soloInactivos) return user.estadoCuenta === 'Inactiva';
    if (!incluirInactivos) return user.estadoCuenta === 'Activa';
    return true;
  });

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
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-person-plus-fill me-2"></i>
            Nuevo Usuario
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

            <div className="row g-3">
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
                  onChange={handleSearchInputChange}
                />
              </div>
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
                  onChange={(e) => {
                    const formattedRUT = formatRUT(e.target.value);
                    setSearchParams(prev => ({ ...prev, rut: formattedRUT }));
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
                  onChange={handleSearchInputChange}
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
                  onChange={handleSearchInputChange}
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
                          <div className="btn-group">
                            {!(user.role === 'Administrador' && user.rut === '11.111.111-1') && (
                              <>
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
                                >
                                  <i className={`bi bi-eye${user.showPassword ? '-slash' : ''}`}></i>
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleUpdateClick(user)}
                                  title="Editar rol"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user)}
                                  title="Eliminar usuario"
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* Mantener los modales existentes */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-plus me-2"></i>
            Registrar Nuevo Usuario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Importante:</strong> El usuario debe estar registrado como trabajador antes de crear su cuenta.
          </Alert>
          <Form onSubmit={handleCreateUser}>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-person me-2"></i>
                Nombre Completo
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleRegistrationInputChange}
                placeholder="Ej: Juan Pérez González"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-credit-card me-2"></i>
                RUT
              </Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={newUser.rut}
                onChange={handleRegistrationInputChange}
                placeholder="12.345.678-9"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-envelope me-2"></i>
                Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleRegistrationInputChange}
                placeholder="usuario@gmail.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-key me-2"></i>
                Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleRegistrationInputChange}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-shield me-2"></i>
                Rol
              </Form.Label>
              <Form.Select
                name="role"
                value={newUser.role}
                onChange={handleRegistrationInputChange}
                required
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateUser} disabled={isCreating}>
            {isCreating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Crear Usuario
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p>¿Estás seguro que deseas eliminar al siguiente usuario?</p>
              <ul className="list-unstyled">
                <li><strong>Nombre:</strong> {selectedUser.name}</li>
                <li><strong>RUT:</strong> {formatRUT(selectedUser.rut)}</li>
                <li><strong>Email:</strong> {selectedUser.email}</li>
                <li><strong>Rol:</strong> {selectedUser.role}</li>
              </ul>
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Esta acción no se puede deshacer.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUser}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              'Eliminar Usuario'
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