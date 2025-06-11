import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  user: { name: string; role: string; rut: string };
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <i className="bi bi-truck me-2"></i>
            S.G. Lamas
          </span>
          <div className="navbar-nav ms-auto d-flex flex-row">
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house me-2"></i>
              Dashboard
            </button>
            <div className="nav-item dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-2"></i>
                {user.name}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <strong>Usuario:</strong> {user.name}<br />
                    <strong>Rol:</strong> {user.role}<br />
                    <strong>RUT:</strong> {user.rut}
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
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
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-dark text-light py-2">
        <div className="container text-center">
          <small>&copy; 2025 Sistema GPS - Gestión de Procesos Empresariales</small>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 