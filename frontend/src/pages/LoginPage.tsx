import React from 'react';
import { LoginForm } from '@/components/common/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <header className="login-header">
        <h1>S.G. Lamas</h1>
        <p>Sistema de Gestión de Personal</p>
      </header>
      
      <main className="login-main">
        <LoginForm />
      </main>
      
      <footer className="login-footer">
        <p>&copy; 2025 Sistema GPS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}; 