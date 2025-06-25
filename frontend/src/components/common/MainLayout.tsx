import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRut } from '@/hooks/useRut';
import { GlobalMessages } from './GlobalMessages';
import { Toast, useToast } from './Toast';

interface MainLayoutProps {
  user: { name: string; role: string; rut: string };
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const { formatRUT } = useRut();
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-sm">
        <div className="container-fluid" style={{ paddingLeft: '36px', paddingRight: '36px' }}>
          <span className="navbar-brand mb-0 h1 fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <i className="bi bi-truck me-2"></i>
            S.G. Lamas
          </span>
          <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
            <button 
              className="btn btn-outline-light me-3 px-3 py-2 fw-semibold"
              onClick={() => navigate('/dashboard')}
              style={{ borderRadius: '25px', transition: 'all 0.3s ease' }}
            >
              <i className="bi bi-house me-2"></i>
              Dashboard
            </button>
            <div className="nav-item dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle px-3 py-2 fw-semibold" 
                type="button" 
                data-bs-toggle="dropdown"
                style={{ borderRadius: '25px', transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-person-circle me-2"></i>
                {user.name}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" style={{ borderRadius: '12px', minWidth: '280px' }}>
                <li>
                  <div className="dropdown-item-text px-3 py-3 bg-light" style={{ borderRadius: '12px 12px 0 0' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-person-circle fs-3 me-3 text-primary"></i>
                      <div>
                        <strong className="d-block text-dark">{user.name}</strong>
                        <small className="text-muted">{user.role}</small>
                      </div>
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-card-text me-1"></i>
                      RUT: {formatRUT(user.rut)}
                    </small>
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
      {/* Contenido */}
      <main className="flex-grow-1 bg-light">
        <div className="container-fluid">
          <GlobalMessages />
          {children}
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-dark text-light py-2">
        <div className="container text-center">
          <small>&copy; 2025 Sistema GPS - Gestión de Procesos Empresariales</small>
        </div>
      </footer>
      
      {/* Sistema de notificaciones globales */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MainLayout; 