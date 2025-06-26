import React, { useState, useEffect } from 'react';
import { useAuth, useUI } from '@/context';
import { SafeUser } from '@/types';
import { UserRole } from '@/types/auth.types';
import { useRut } from '@/hooks/useRut';
import { userService } from '@/services/user.service';
import { Table, Button, Form, Spinner, Modal, Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/usuarios.css';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import { useToast, Toast } from '@/components/common/Toast';

// Interfaz para los parámetros de búsqueda
interface UserSearchParams {
  name?: string;
  rut?: string;
  email?: string;
  role?: UserRole;
  incluirInactivos: boolean;
  soloInactivos: boolean;
}

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const { setError, setLoading } = useUI();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { formatRUT } = useRut();
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    incluirInactivos: false,
    soloInactivos: false
  });
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [rutError, setRutError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const availableRoles: UserRole[] = ['Usuario', 'RecursosHumanos', 'Gerencia', 'Ventas', 'Arriendo', 'Finanzas', 'Mecánico', 'Mantenciones de Maquinaria'];
  
  // Admin, SuperAdmin y RecursosHumanos pueden asignar rol de Administrador
  if (user?.role === 'Administrador' || user?.role === 'SuperAdministrador' || user?.role === 'RecursosHumanos') {
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
    // Para la carga inicial, solo mostrar usuarios activos
    const initialParams = {
      incluirInactivos: false,
      soloInactivos: false
    };
    await executeSearch(initialParams);
  };

  const handleSearch = async () => {
    // Validar formato de RUT si está presente
    if (searchParams.rut) {
      const rutLimpio = searchParams.rut.trim();
      const rutRegex = /^\d{2}\.\d{3}\.\d{3}-[\dkK]$/;
      if (!rutRegex.test(rutLimpio)) {
        setRutError('Debe ingresar el RUT en formato xx.xxx.xxx-x');
        return;
      }
    }
    setRutError(null);
    await executeSearch(searchParams);
  };

  // Función auxiliar para ejecutar búsqueda con parámetros específicos
  const executeSearch = async (params: UserSearchParams) => {
    setIsLoading(true);
    try {
      let filteredUsers: SafeUser[] = [];
      
      // Si hay filtros de búsqueda específicos, usar el servicio de búsqueda
      if (params.name || params.rut || params.email || params.role) {
        const { users: foundUsers, error: searchError } = await userService.searchUsers(params);
        if (searchError) {
          setError(searchError);
          setUsers([]);
          return;
        }
        filteredUsers = foundUsers || [];
      } else {
        // Si no hay filtros específicos, obtener todos los usuarios
        const allUsers = await userService.getAllUsers();
        filteredUsers = allUsers || [];
      }
      
      // Aplicar filtros de estado de cuenta
      if (params.soloInactivos) {
        // Solo mostrar usuarios inactivos
        filteredUsers = filteredUsers.filter(u => u.estadoCuenta === 'Inactiva');
      } else if (!params.incluirInactivos) {
        // Solo mostrar usuarios activos (comportamiento por defecto)
        filteredUsers = filteredUsers.filter(u => u.estadoCuenta === 'Activa');
      }
      // Si incluirInactivos es true, no aplicar ningún filtro de estado (mostrar todos)
      
      setUsers(filteredUsers);
      setError('');
    } catch (err) {
      console.error('Error al buscar usuarios:', err);
      setError('Error al buscar usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncluirInactivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      incluirInactivos: e.target.checked,
      soloInactivos: e.target.checked ? false : prev.soloInactivos
    }));
  };

  const handleSoloInactivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      soloInactivos: e.target.checked,
      incluirInactivos: e.target.checked ? false : prev.incluirInactivos
    }));
  };

  const handleResetSearch = async () => {
    const resetParams = {
      incluirInactivos: false,
      soloInactivos: false
    };
    setSearchParams(resetParams);
    setRutError(null);
    await executeSearch(resetParams);
  };

  const handleUpdateClick = (selectedUser: SafeUser) => {
    // Prevenir edición del SuperAdministrador
    if (selectedUser.role === 'SuperAdministrador') {
      setError('No se puede modificar el SuperAdministrador.');
      return;
    }
    
    setNewRole(selectedUser.role);
    setNewPassword('');
    setSelectedUser(selectedUser);
    setShowUpdateModal(true);
  };

  // Función para validar contraseña
  const validatePassword = (password: string): string | null => {
    if (password.length === 0) return null; // Vacía es válida (no cambiar)
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (password.length > 16) return 'La contraseña debe tener máximo 16 caracteres';
    if (!/(?=.*[a-z])/.test(password)) return 'La contraseña debe tener al menos una letra minúscula';
    if (!/(?=.*[A-Z])/.test(password)) return 'La contraseña debe tener al menos una letra mayúscula';
    if (!/(?=.*\d)/.test(password)) return 'La contraseña debe tener al menos un número';
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) return 'La contraseña debe tener al menos un carácter especial';
    return null;
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
        setIsUpdating(true);
        setError('');
        setPasswordError(null);
        
        // Validar contraseña si se proporciona
        if (newPassword) {
          const passwordValidation = validatePassword(newPassword);
          if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
          }
        }
        
        // Crear objeto con las actualizaciones
        const updates: { role?: string, password?: string } = {};
        if (newRole && newRole !== selectedUser.role) updates.role = newRole;
        if (newPassword && newPassword.length >= 8 && newPassword.length <= 16) updates.password = newPassword;

        // Solo enviar la petición si hay cambios
        if (Object.keys(updates).length > 0) {
            await userService.updateUser(selectedUser.id, selectedUser.rut, updates);
            showSuccess('¡Usuario actualizado!', `El usuario ${selectedUser.name} se ha actualizado exitosamente`, 4000);
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
        setPasswordError(null);
    }
  };

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
      <Container fluid className="py-2">
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="bi bi-shield-exclamation display-1 text-danger mb-4"></i>
                <h2>Acceso Denegado</h2>
                <p className="lead">No tienes permisos para acceder a la gestión de usuarios.</p>
                <p>Solo usuarios con rol de <strong>Administrador</strong> o <strong>Recursos Humanos</strong> pueden gestionar usuarios.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-people-fill fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Gestión de Usuarios</h3>
                    <p className="mb-0 opacity-75">
                      Administrar cuentas y permisos del sistema
                    </p>
                  </div>
                </div>
                <div>
                  <Button 
                    variant={showFilters ? "outline-light" : "light"}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                    {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="shadow-sm mb-3">
              <FiltrosBusquedaHeader />
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>RUT</Form.Label>
                      <Form.Control
                        type="text"
                        name="rut"
                        placeholder="12.345.678-9"
                        value={searchParams.rut || ''}
                        onChange={handleRutChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
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
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
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
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rol</Form.Label>
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
                    </Form.Group>
                  </Col>
                </Row>

                {/* Checkboxes de estado de cuenta */}
                <Row className="mb-4">
                  <Col>
                    <h6 className="mb-3">Estado de cuenta:</h6>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="incluirInactivos"
                        checked={searchParams.incluirInactivos}
                        onChange={handleIncluirInactivos}
                        disabled={searchParams.soloInactivos}
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
                        checked={searchParams.soloInactivos}
                        onChange={handleSoloInactivos}
                        disabled={searchParams.incluirInactivos}
                      />
                      <label className="form-check-label" htmlFor="soloInactivos">
                        Ver solo cuentas inactivas
                      </label>
                    </div>
                  </Col>
                </Row>

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

                {rutError && (
                  <div className="alert alert-danger mt-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {rutError}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Tabla de Usuarios */}
          <Card className="shadow-sm">
            <Card.Body>
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
                        Usuarios Registrados ({users.length})
                        <small className="text-muted ms-2">
                          (Activos: {users.filter(u => u.estadoCuenta === 'Activa').length} • 
                          Inactivos: {users.filter(u => u.estadoCuenta === 'Inactiva').length})
                        </small>
                      </h6>
                    </div>
                    {users.length === 0 && !isLoading && (
                      <div className="text-center py-5">
                        <i className="bi bi-person-x display-1 text-muted"></i>
                        <h5 className="mt-3">No hay resultados que coincidan con tu búsqueda</h5>
                      </div>
                    )}
                    <Table hover responsive className="align-middle">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>RUT</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Estado</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.rut ? formatRUT(user.rut) : <span className="text-muted">No aplica</span>}</td>
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
                            <td className="text-center">
                              {/* Ocultar acciones si es el admin principal o SuperAdministrador */}
                              {(user.email !== 'admin.principal@gmail.com' && user.role !== 'SuperAdministrador') && (
                                <div className="btn-group">
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
            </Card.Body>
          </Card>

          {/* Modal de Actualización */}
          <Modal show={showUpdateModal} onHide={() => {
            setShowUpdateModal(false);
            setNewPassword('');
            setPasswordError(null);
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
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (e.target.value) {
                          setPasswordError(validatePassword(e.target.value));
                        } else {
                          setPasswordError(null);
                        }
                      }}
                      placeholder="Dejar vacío para mantener la actual"
                      maxLength={16}
                      isInvalid={!!passwordError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {passwordError}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      La contraseña debe tener entre 8 y 16 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.
                    </Form.Text>
                  </Form.Group>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => {
                setShowUpdateModal(false);
                setNewPassword('');
                setPasswordError(null);
                if (selectedUser) setNewRole(selectedUser.role);
              }}>
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateUser}
                disabled={isUpdating || !!passwordError}
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
        </Col>
      </Row>
      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </Container>
  );
};

// Función auxiliar para determinar el color del badge según el rol
const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'SuperAdministrador':
      return 'primary';
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
    case 'Mecánico':
      return 'warning';
    case 'Mantenciones de Maquinaria':
      return 'info';
    case 'Usuario':
      return 'dark';
    default:
      return 'light';
  }
}; 