import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRut } from '@/hooks/useRut';
import { GlobalMessages } from './GlobalMessages';
import { Toast, useToast } from './Toast';
import '@/styles/layout/navbar.css';
import '@/styles/layout/footer.css';

interface MainLayoutProps {
  user: { name: string; role: string; rut: string };
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatRUT } = useRut();
  const { toasts, removeToast } = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isInDashboard = location.pathname === '/dashboard';
  const hideVolver = location.pathname === '/trabajadores/historial-laboral' || location.pathname === '/recursos-humanos';

  const handleNavbarVolver = () => {
    if (
      location.pathname === '/fichas-empresa' ||
      location.pathname === '/trabajadores' ||
      location.pathname === '/usuarios'
    ) {
      navigate('/gestion-personal', { replace: true });
    } else if (location.pathname === '/gestion-personal') {
      navigate('/recursos-humanos', { replace: true });
    } else {
      navigate(-1);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Escuchar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Cerrar menú móvil si la pantalla se hace más grande
      if (window.innerWidth > 767) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    // Función para ajustar el ancho
    const adjustMenuWidth = () => {
      menu.style.width = btn.offsetWidth + 'px';
    };

    // Observer para detectar la clase 'show' en el menú
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          menu.classList.contains('show')
        ) {
          adjustMenuWidth();
        }
      });
    });

    observer.observe(menu, { attributes: true });

    // Ajuste inicial por si ya está abierto
    if (menu.classList.contains('show')) {
      adjustMenuWidth();
    }

    // Limpieza
    return () => {
      observer.disconnect();
    };
  }, []);

  // Renderizar botones de navegación
  const renderNavButtons = (isMobile = false) => {
    const buttonClass = isMobile 
      ? "btn btn-outline-light w-100 mb-2 text-start" 
      : "btn btn-outline-light me-3 px-3 py-2 fw-semibold";
    
    const buttonStyle = isMobile 
      ? { borderRadius: '0.5rem', transition: 'all 0.3s ease' }
      : { borderRadius: '25px', transition: 'all 0.3s ease' };

    return (
      <>
        <button 
          className={buttonClass}
          onClick={() => {
            navigate('/dashboard');
            if (isMobile) closeMobileMenu();
          }}
          style={buttonStyle}
          data-title="Ir al inicio"
        >
          <i className="bi bi-house me-2"></i>
          <span className="btn-text">Inicio</span>
        </button>
        
        {/* Botones adicionales para la página de trabajadores */}
        {location.pathname === '/trabajadores' && (
          <>
            <button 
              className={buttonClass}
              onClick={() => {
                navigate('/fichas-empresa');
                if (isMobile) closeMobileMenu();
              }}
              style={buttonStyle}
              data-title="Ver fichas de empresa"
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              <span className="btn-text">Ficha de Empresa</span>
            </button>
            <button 
              className={buttonClass}
              onClick={() => {
                navigate('/usuarios');
                if (isMobile) closeMobileMenu();
              }}
              style={buttonStyle}
              data-title="Gestionar usuarios"
            >
              <i className="bi bi-people me-2"></i>
              <span className="btn-text">Usuarios</span>
            </button>
          </>
        )}

        {/* Botones adicionales para la página de fichas de empresa */}
        {location.pathname === '/fichas-empresa' && (
          <>
            <button 
              className={buttonClass}
              onClick={() => {
                navigate('/trabajadores');
                if (isMobile) closeMobileMenu();
              }}
              style={buttonStyle}
              data-title="Ver trabajadores"
            >
              <i className="bi bi-people-fill me-2"></i>
              <span className="btn-text">Trabajadores</span>
            </button>
            <button 
              className={buttonClass}
              onClick={() => {
                navigate('/usuarios');
                if (isMobile) closeMobileMenu();
              }}
              style={buttonStyle}
              data-title="Gestionar usuarios"
            >
              <i className="bi bi-people me-2"></i>
              <span className="btn-text">Usuarios</span>
            </button>
          </>
        )}

        {/* Botones adicionales para la página de usuarios */}
        {location.pathname === '/usuarios' && (
          <>
            <button 
              className={buttonClass}
              onClick={() => {
                navigate('/trabajadores');
                if (isMobile) closeMobileMenu();
              }}
              style={buttonStyle}
              data-title="Ver trabajadores"
            >
              <i className="bi bi-people-fill me-2"></i>
              <span className="btn-text">Trabajadores</span>
            </button>
            <button 
              className={buttonClass}
              onClick={() => {
                navigate('/fichas-empresa');
                if (isMobile) closeMobileMenu();
              }}
              style={buttonStyle}
              data-title="Ver fichas de empresa"
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              <span className="btn-text">Ficha de Empresa</span>
            </button>
          </>
        )}
        
        {!isInDashboard && !hideVolver && (
          <button 
            className={buttonClass}
            onClick={() => {
              handleNavbarVolver();
              if (isMobile) closeMobileMenu();
            }}
            style={buttonStyle}
            data-title="Volver a la página anterior"
          >
            <i className="bi bi-arrow-left me-2"></i>
            <span className="btn-text">
              {location.pathname === '/gestion-personal'
                ? 'Volver a Recursos Humanos'
                : (location.pathname === '/trabajadores' || location.pathname === '/fichas-empresa' || location.pathname === '/usuarios')
                  ? 'Volver a Gestión del Personal'
                  : 'Volver'}
            </span>
          </button>
        )}
      </>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 fw-bold" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-truck me-2"></i>
            <span className="brand-text">S.G. Lamas</span>
          </span>
          
          {/* Botón hamburguesa para móvil */}
          {windowWidth <= 767 && (
            <button 
              className="navbar-toggler"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          )}
          
          {/* Navegación principal */}
          <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
            {renderNavButtons(false)}
            
            <div className="navbar-user-dropdown" style={{ position: 'relative' }}>
              <button
                ref={buttonRef}
                className="btn btn-outline-light dropdown-toggle px-3 py-2 fw-semibold"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ borderRadius: '25px', transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-person-circle me-2"></i>
                <span className="btn-text">{user.name}</span>
              </button>
              <ul
                ref={menuRef}
                className="dropdown-menu dropdown-menu-end shadow-lg border-0"
                style={{ borderRadius: '12px' }}
              >
                <li>
                  <div className="dropdown-item-text px-3 py-3 bg-light" style={{ borderRadius: '12px 12px 0 0' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-person-circle fs-3 me-3 text-primary"></i>
                      <div>
                        <strong className="d-block text-dark">{user.name}</strong>
                        <small className="text-muted">{user.role}</small>
                      </div>
                    </div>
                    {user.role !== "SuperAdministrador" && (
                      <small className="text-muted d-flex align-items-center">
                        <i className="bi bi-card-text me-1"></i>
                        RUT: {formatRUT(user.rut)}
                      </small>
                    )}
                  </div>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li>
                  <button className="dropdown-item px-3 py-2 d-flex align-items-center text-danger fw-semibold" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      {windowWidth <= 767 && (
        <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'show' : ''}`}>
          {renderNavButtons(true)}
        </div>
      )}

      {/* Contenido */}
      <main className="flex-grow-1 bg-light">
        <GlobalMessages />
        {children}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        © 2025 Sistema GPS - Gestión de Procesos Empresariales
      </footer>
      
      {/* Sistema de notificaciones globales */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MainLayout; 