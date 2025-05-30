import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const RecursosHumanosPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const getModulesRRHH = () => {
    const modules = [
      {
        id: 'trabajadores',
        title: 'Gestión de Trabajadores',
        description: 'Administrar empleados y personal',
        icon: '👥',
        link: '/trabajadores',
        color: 'primary',
        stats: { total: '-', activos: '-' }
      },
      {
        id: 'fichas',
        title: 'Fichas de Empresa',
        description: 'Información laboral y contratos',
        icon: '📋',
        link: '/fichas-empresa',
        color: 'success',
        stats: { total: '-', pendientes: '-' }
      },
      {
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        description: 'Usuarios del sistema',
        icon: '🔐',
        link: '/usuarios',
        color: 'warning',
        stats: { total: '-', roles: '-' }
      },
      {
        id: 'licencias',
        title: 'Licencias y Permisos',
        description: 'Solicitudes y aprobaciones',
        icon: '📅',
        link: '/licencias-permisos',
        color: 'info',
        stats: { pendientes: '-', aprobadas: '-' }
      },
      {
        id: 'reportes',
        title: 'Reportes de RRHH',
        description: 'Informes y estadísticas',
        icon: '📊',
        link: '/reportes-rrhh',
        color: 'secondary',
        stats: { generados: '-', automáticos: '-' }
      },
      {
        id: 'nomina',
        title: 'Nómina y Pagos',
        description: 'Gestión de sueldos',
        icon: '💰',
        link: '/nomina',
        color: 'dark',
        stats: { procesados: '-', pendientes: '-' }
      }
    ];

    return modules;
  };

  const getQuickActions = () => {
    return [
      {
        title: 'Nuevo Trabajador',
        description: 'Registrar nuevo empleado',
        icon: '➕',
        action: () => window.location.href = '/trabajadores?action=create',
        color: 'primary'
      },
      {
        title: 'Buscar Trabajador',
        description: 'Buscar en la base de datos',
        icon: '🔍',
        action: () => window.location.href = '/trabajadores',
        color: 'secondary'
      },
      {
        title: 'Crear Usuario',
        description: 'Nuevo usuario del sistema',
        icon: '🆕',
        action: () => window.location.href = '/usuarios?action=create',
        color: 'success'
      },
      {
        title: 'Ver Solicitudes',
        description: 'Licencias pendientes',
        icon: '📋',
        action: () => window.location.href = '/licencias-permisos',
        color: 'warning'
      }
    ];
  };

  const modules = getModulesRRHH();
  const quickActions = getQuickActions();

  return (
    <div className="container-fluid py-4">
      {/* Header de Recursos Humanos */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="card-body py-5 text-white">
              <div className="text-center">
                <div className="display-3 mb-3">👥</div>
                <h1 className="display-5 fw-bold mb-3">Recursos Humanos</h1>
                <p className="lead mb-4">
                  Centro de gestión integral del personal y administración de recursos humanos
                </p>
                <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                  <span className="badge bg-light text-dark fs-6 px-3 py-2">
                    <i className="bi bi-person-badge me-2"></i>
                    Responsable: {user?.name}
                  </span>
                  <span className="badge bg-light text-dark fs-6 px-3 py-2">
                    <i className="bi bi-calendar me-2"></i>
                    {new Date().toLocaleDateString('es-CL')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100 border-start border-primary border-5">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="display-6 text-primary">👤</div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Total Trabajadores</h6>
                  <h2 className="mb-0">-</h2>
                  <small className="text-muted">Activos en sistema</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100 border-start border-success border-5">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="display-6 text-success">📋</div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Fichas Activas</h6>
                  <h2 className="mb-0">-</h2>
                  <small className="text-muted">Contratos vigentes</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100 border-start border-warning border-5">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="display-6 text-warning">📅</div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Solicitudes</h6>
                  <h2 className="mb-0">-</h2>
                  <small className="text-muted">Pendientes revisión</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100 border-start border-info border-5">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="display-6 text-info">🔐</div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Usuarios Sistema</h6>
                  <h2 className="mb-0">-</h2>
                  <small className="text-muted">Accesos activos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-lightning me-2"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {quickActions.map((action, index) => (
                  <div key={index} className="col-lg-3 col-md-6 mb-3">
                    <div 
                      className="card h-100 shadow-sm cursor-pointer"
                      onClick={action.action}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <div className="display-6 mb-2">{action.icon}</div>
                        <h6 className="card-title">{action.title}</h6>
                        <p className="card-text text-muted small">{action.description}</p>
                        <button className={`btn btn-${action.color} btn-sm`}>
                          Ejecutar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos principales */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Módulos de Recursos Humanos
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {modules.map((module) => (
                  <div key={module.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-start mb-3">
                          <div className="flex-shrink-0">
                            <div className={`display-6 text-${module.color}`}>{module.icon}</div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h5 className="card-title">{module.title}</h5>
                            <p className="card-text text-muted">{module.description}</p>
                          </div>
                        </div>
                        
                        <div className="row text-center mb-3">
                          {Object.entries(module.stats).map(([key, value]) => (
                            <div key={key} className="col-6">
                              <div className="border-end">
                                <h6 className="text-muted mb-1">{key}</h6>
                                <h5 className="mb-0">{value}</h5>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="d-grid">
                          <a href={module.link} className={`btn btn-${module.color}`}>
                            <i className="bi bi-arrow-right me-2"></i>
                            Acceder al módulo
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente y próximas tareas */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Actividad Reciente
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                      <i className="bi bi-person-plus"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">Sistema iniciado</h6>
                    <p className="mb-1 text-muted">Módulo de Recursos Humanos activado</p>
                    <small className="text-muted">Hace unos momentos</small>
                  </div>
                </div>
                
                <div className="list-group-item d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                      <i className="bi bi-check-circle"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">Sesión iniciada</h6>
                    <p className="mb-1 text-muted">Acceso autorizado como {user?.role}</p>
                    <small className="text-muted">Ahora</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-check me-2"></i>
                Próximas Tareas
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex align-items-center">
                  <div className="form-check me-3">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">Revisar solicitudes pendientes</h6>
                    <small className="text-muted">Licencias y permisos por aprobar</small>
                  </div>
                  <span className="badge bg-warning">Pendiente</span>
                </div>
                
                <div className="list-group-item d-flex align-items-center">
                  <div className="form-check me-3">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">Actualizar fichas de empresa</h6>
                    <small className="text-muted">Contratos próximos a vencer</small>
                  </div>
                  <span className="badge bg-info">Rutina</span>
                </div>
                
                <div className="list-group-item d-flex align-items-center">
                  <div className="form-check me-3">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">Generar reporte mensual</h6>
                    <small className="text-muted">Estadísticas de personal</small>
                  </div>
                  <span className="badge bg-secondary">Programado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 