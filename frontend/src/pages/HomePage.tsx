import React from 'react';
import { useAuth } from '@/context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getAllModules = () => {
    const modules = [
      // Módulos siempre disponibles
      {
        title: 'Mi Perfil',
        description: 'Ver y editar información personal',
        icon: '👤',
        link: '/mi-perfil',
        color: 'primary',
        category: 'personal'
      },
      
      // Módulos de Recursos Humanos
      {
        title: 'Recursos Humanos',
        description: 'Gestión de personal y trabajadores',
        icon: '👥',
        link: '/recursos-humanos',
        color: 'success',
        category: 'rrhh',
        roles: ['Administrador', 'RecursosHumanos']
      },
      
      // Módulos de Inventario (para otros compañeros)
      {
        title: 'Inventario',
        description: 'Gestión de productos y stock',
        icon: '📦',
        link: '/inventario',
        color: 'warning',
        category: 'inventario',
        roles: ['Administrador', 'Inventario', 'Gerencia']
      },
      
      // Módulos de Maquinaria (para otros compañeros)
      {
        title: 'Maquinaria',
        description: 'Control de equipos y mantención',
        icon: '🚜',
        link: '/maquinaria',
        color: 'danger',
        category: 'maquinaria',
        roles: ['Administrador', 'Maquinaria', 'Gerencia']
      },
      
      // Módulos de Ventas
      {
        title: 'Ventas',
        description: 'Gestión de ventas y clientes',
        icon: '💰',
        link: '/ventas',
        color: 'info',
        category: 'ventas',
        roles: ['Administrador', 'Ventas', 'Gerencia']
      },
      
      // Módulos de Arriendo
      {
        title: 'Arriendo',
        description: 'Gestión de arriendos y contratos',
        icon: '🏠',
        link: '/arriendo',
        color: 'secondary',
        category: 'arriendo',
        roles: ['Administrador', 'Arriendo', 'Gerencia']
      },
      
      // Módulos de Finanzas
      {
        title: 'Finanzas',
        description: 'Control financiero y contabilidad',
        icon: '📊',
        link: '/finanzas',
        color: 'dark',
        category: 'finanzas',
        roles: ['Administrador', 'Finanzas', 'Gerencia']
      },
      
      // Módulos de Administración
      {
        title: 'Usuarios',
        description: 'Gestión de usuarios del sistema',
        icon: '🔐',
        link: '/usuarios',
        color: 'danger',
        category: 'admin',
        roles: ['Administrador', 'RecursosHumanos']
      }
    ];

    return modules.filter(module => 
      !module.roles || module.roles.includes(user?.role || '')
    );
  };

  const getModulesByCategory = () => {
    const modules = getAllModules();
    const categories = {
      personal: modules.filter(m => m.category === 'personal'),
      rrhh: modules.filter(m => m.category === 'rrhh'),
      operations: modules.filter(m => ['inventario', 'maquinaria'].includes(m.category)),
      business: modules.filter(m => ['ventas', 'arriendo', 'finanzas'].includes(m.category)),
      admin: modules.filter(m => m.category === 'admin')
    };
    return categories;
  };

  const categories = getModulesByCategory();

  return (
    <div className="container-fluid py-4">
      {/* Header con saludo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 bg-primary text-white">
            <div className="card-body py-5">
              <div className="text-center">
                <h1 className="display-4 fw-bold mb-3">
                  {getGreeting()}, {user?.name}! 👋
                </h1>
                <p className="lead mb-3">
                  Bienvenido al Sistema GPS 2025 - Gestión Integral de Procesos
                </p>
                <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                  <span className="badge bg-light text-dark fs-6 px-3 py-2">
                    <i className="bi bi-person-badge me-2"></i>
                    {user?.role}
                  </span>
                  <span className="badge bg-light text-dark fs-6 px-3 py-2">
                    <i className="bi bi-credit-card me-2"></i>
                    RUT: {user?.rut}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="display-6 text-primary mb-2">📈</div>
              <h5 className="card-title">Estado del Sistema</h5>
              <p className="card-text text-success fw-bold">Operativo</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="display-6 text-success mb-2">✅</div>
              <h5 className="card-title">Sesión Activa</h5>
              <p className="card-text text-muted">Conectado desde hoy</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="display-6 text-info mb-2">🔔</div>
              <h5 className="card-title">Notificaciones</h5>
              <p className="card-text text-muted">0 pendientes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="display-6 text-warning mb-2">⭐</div>
              <h5 className="card-title">Acceso</h5>
              <p className="card-text text-muted">{getAllModules().length} módulos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos por categorías */}
      
      {/* Módulos Personales */}
      {categories.personal.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">
              <i className="bi bi-person-circle me-2"></i>
              Información Personal
            </h3>
            <div className="row">
              {categories.personal.map((module) => (
                <div key={module.title} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body text-center">
                      <div className="display-6 mb-3">{module.icon}</div>
                      <h5 className="card-title">{module.title}</h5>
                      <p className="card-text text-muted">{module.description}</p>
                      <a href={module.link} className={`btn btn-${module.color}`}>
                        Acceder <i className="bi bi-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Módulos de Recursos Humanos */}
      {categories.rrhh.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">
              <i className="bi bi-people me-2"></i>
              Recursos Humanos
            </h3>
            <div className="row">
              {categories.rrhh.map((module) => (
                <div key={module.title} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body text-center">
                      <div className="display-6 mb-3">{module.icon}</div>
                      <h5 className="card-title">{module.title}</h5>
                      <p className="card-text text-muted">{module.description}</p>
                      <a href={module.link} className={`btn btn-${module.color}`}>
                        Acceder <i className="bi bi-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Módulos Operacionales */}
      {categories.operations.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">
              <i className="bi bi-gear me-2"></i>
              Operaciones
            </h3>
            <div className="row">
              {categories.operations.map((module) => (
                <div key={module.title} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body text-center">
                      <div className="display-6 mb-3">{module.icon}</div>
                      <h5 className="card-title">{module.title}</h5>
                      <p className="card-text text-muted">{module.description}</p>
                      <a href={module.link} className={`btn btn-${module.color}`}>
                        Acceder <i className="bi bi-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Módulos de Negocio */}
      {categories.business.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">
              <i className="bi bi-briefcase me-2"></i>
              Área de Negocio
            </h3>
            <div className="row">
              {categories.business.map((module) => (
                <div key={module.title} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body text-center">
                      <div className="display-6 mb-3">{module.icon}</div>
                      <h5 className="card-title">{module.title}</h5>
                      <p className="card-text text-muted">{module.description}</p>
                      <a href={module.link} className={`btn btn-${module.color}`}>
                        Acceder <i className="bi bi-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Módulos de Administración */}
      {categories.admin.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">
              <i className="bi bi-shield-lock me-2"></i>
              Administración
            </h3>
            <div className="row">
              {categories.admin.map((module) => (
                <div key={module.title} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body text-center">
                      <div className="display-6 mb-3">{module.icon}</div>
                      <h5 className="card-title">{module.title}</h5>
                      <p className="card-text text-muted">{module.description}</p>
                      <a href={module.link} className={`btn btn-${module.color}`}>
                        Acceder <i className="bi bi-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h5 className="card-title">🚀 Sistema GPS 2025</h5>
              <p className="card-text text-muted mb-0">
                Plataforma integral para la gestión de procesos empresariales • 
                Versión 1.0 • Desarrollado para optimizar todas las áreas de la empresa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 