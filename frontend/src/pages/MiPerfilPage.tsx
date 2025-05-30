import React from 'react';
import { useAuth } from '@/context/AuthContext';

export const MiPerfilPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No se pudo cargar la información del usuario.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="card-title mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Mi Perfil
              </h4>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-3 text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{width: '120px', height: '120px'}}>
                    <i className="bi bi-person-fill display-3 text-primary"></i>
                  </div>
                </div>
                <div className="col-md-9">
                  <h2 className="mb-1">{user.name}</h2>
                  <p className="text-muted mb-2">
                    <i className="bi bi-person-badge me-1"></i>
                    {user.role}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="bi bi-credit-card me-1"></i>
                    RUT: {user.rut}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información personal */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información Personal
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted">Nombre completo:</label>
                  <p className="mb-0">{user.name}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted">RUT:</label>
                  <p className="mb-0">{user.rut}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted">Email:</label>
                  <p className="mb-0">{user.email}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-muted">Rol en el sistema:</label>
                  <span className="badge bg-primary">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permisos y accesos */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Permisos y Accesos
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <h6 className="text-muted mb-3">Módulos disponibles según tu rol:</h6>
                  <div className="list-group">
                    <div className="list-group-item d-flex align-items-center">
                      <i className="bi bi-house me-3 text-primary"></i>
                      <div>
                        <h6 className="mb-1">Dashboard Principal</h6>
                        <small className="text-muted">Página de inicio con resumen general</small>
                      </div>
                    </div>
                    
                    {(user.role === 'Administrador' || user.role === 'RecursosHumanos') && (
                      <>
                        <div className="list-group-item d-flex align-items-center">
                          <i className="bi bi-people me-3 text-success"></i>
                          <div>
                            <h6 className="mb-1">Recursos Humanos</h6>
                            <small className="text-muted">Gestión completa de personal</small>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center">
                          <i className="bi bi-person-badge me-3 text-info"></i>
                          <div>
                            <h6 className="mb-1">Trabajadores</h6>
                            <small className="text-muted">CRUD de empleados</small>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center">
                          <i className="bi bi-clipboard-data me-3 text-warning"></i>
                          <div>
                            <h6 className="mb-1">Fichas de Empresa</h6>
                            <small className="text-muted">Información laboral y contratos</small>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center">
                          <i className="bi bi-shield-lock me-3 text-danger"></i>
                          <div>
                            <h6 className="mb-1">Gestión de Usuarios</h6>
                            <small className="text-muted">Crear y administrar usuarios</small>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="list-group-item d-flex align-items-center">
                      <i className="bi bi-clipboard-data me-3 text-secondary"></i>
                      <div>
                        <h6 className="mb-1">Mi Ficha Laboral</h6>
                        <small className="text-muted">Ver información de mi contrato</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-gear me-2"></i>
                Acciones
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap">
                <a href="/fichas-empresa" className="btn btn-outline-primary">
                  <i className="bi bi-clipboard-data me-2"></i>
                  Ver mi ficha laboral
                </a>
                <button className="btn btn-outline-secondary" disabled>
                  <i className="bi bi-key me-2"></i>
                  Cambiar contraseña
                  <small className="text-muted ms-1">(Próximamente)</small>
                </button>
                <button className="btn btn-outline-info" disabled>
                  <i className="bi bi-bell me-2"></i>
                  Configurar notificaciones
                  <small className="text-muted ms-1">(Próximamente)</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 